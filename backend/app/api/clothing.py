# =============================================================================
# API РОУТЕР: ОДЕЖДА (clothing.py)
# =============================================================================
# Этот модуль содержит эндпоинты для работы с гардеробом:
# - Загрузка фотографий одежды
# - Получение списка своих вещей
# - Удаление вещей из гардероба
# =============================================================================

# Импорт компонентов FastAPI
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

# Асинхронная сессия SQLAlchemy
from sqlalchemy.ext.asyncio import AsyncSession

# SQL операция SELECT
from sqlalchemy import select

# Модули для работы с файловой системой
import os      # Работа с путями и директориями
import uuid    # Генерация уникальных имён файлов
import shutil  # Копирование файлов

# Импорт зависимости для получения сессии БД
from app.db.database import get_db

# Импорт моделей базы данных
from app.models import models

# Импорт Pydantic схем
from app.schemas import schemas

# Импорт сервисов авторизации
from app.services import services

# =============================================================================
# СОЗДАНИЕ РОУТЕРА
# =============================================================================
# prefix="/clothing" - все маршруты начинаются с /api/clothing
# tags=["Clothing"] - группировка в Swagger
router = APIRouter(prefix="/clothing", tags=["Clothing"])


# Импорт ML сервисов
from app.ml.remover import get_remover
from app.ml.classifier import get_classifier
from app.ml.color_extractor import extract_dominant_color

# =============================================================================
# ЭНДПОИНТ: ЗАГРУЗКА ФОТО ОДЕЖДЫ
# =============================================================================
@router.post("/upload", response_model=schemas.ClothingItemResponse)
async def upload_item(
    file: UploadFile = File(...),   # Файл изображения (обязательный)
    current_user: models.User = Depends(services.get_current_user),  # Авторизация
    db: AsyncSession = Depends(get_db)
):
    """
    Загрузка фотографии одежды в гардероб.
    
    Алгоритм:
    1. Создаём папку uploads если её нет
    2. Генерируем уникальное имя файла
    3. Сохраняем временный файл
    4. Распознаем вещь через Fashion-MNIST CNN
    5. Удаляем фон через RemBG
    6. Сохраняем итоговый PNG
    7. Создаём запись в БД
    """
    # Шаг 1: Создаём директорию для загрузок
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Шаг 2: Генерируем уникальное имя (UUID)
    file_id = str(uuid.uuid4())
    temp_path = f"{upload_dir}/temp_{file_id}_{file.filename}"
    
    # Шаг 3: Сохраняем временный файл для обработки
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Шаг 4: Распознавание через Fashion-MNIST классификатор
        classifier = get_classifier()
        prediction = classifier.predict(temp_path)
        
        category = prediction.get("id", "unknown")
        confidence = prediction.get("confidence", 0.0)
        
        print(f"🎯 Классификация: {prediction['name']} ({category}) - {confidence*100:.1f}%")
        
        # Шаг 5: Удаление фона через RemBG
        final_filename = f"{file_id}.png" # Всегда PNG для прозрачности
        final_path = f"{upload_dir}/{final_filename}"
        
        remover = get_remover()
        remover.remove_background(temp_path, final_path)
        
        # Шаг 5.5: Извлечение доминирующего цвета через K-means
        color_info = extract_dominant_color(final_path)
        color_name = color_info.get("name_ru", "неизвестный")
        color_hex = color_info.get("hex", "#808080")
        
        print(f"🎨 Цвет: {color_name} ({color_hex})")
        
        # Шаг 6: Создаём запись в базе данных
        new_item = models.ClothingItem(
            owner_id=current_user.id,
            filename=file.filename,
            image_path=final_path,
            category=category,
            color=color_name  # Теперь реальный цвет из K-means!
        )
        
        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        
        # Лог аудита
        log = models.AuditLog(
            user_id=current_user.id, 
            action="upload_item",
            details=f"Uploaded and processed {file.filename} (detected: {category})"
        )
        db.add(log)
        await db.commit()
        
        return new_item

    finally:
        # Удаляем временный файл
        if os.path.exists(temp_path):
            os.remove(temp_path)


# =============================================================================
# ЭНДПОИНТ: ПОЛУЧЕНИЕ СПИСКА СВОИХ ВЕЩЕЙ
# =============================================================================
@router.get("/", response_model=list[schemas.ClothingItemResponse])
async def get_my_items(
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получение всех вещей текущего пользователя.
    
    Возвращает список всех вещей из гардероба авторизованного пользователя.
    
    Args:
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        List[ClothingItemResponse]: Список вещей пользователя
    
    Пример запроса:
        GET /api/clothing
        Cookie: wardrobe_access_token=...
    
    Пример ответа:
        [
            {
                "id": 1,
                "filename": "shirt.jpg",
                "category": "t-shirt",
                "color": "blue",
                ...
            },
            ...
        ]
    """
    # Выбираем все вещи принадлежащие текущему пользователю
    result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.owner_id == current_user.id
        )
    )
    
    # Возвращаем список вещей
    return result.scalars().all()


# =============================================================================
# ЭНДПОИНТ: ОБНОВЛЕНИЕ ВЕЩИ
# =============================================================================
@router.put("/{item_id}", response_model=schemas.ClothingItemResponse)
async def update_item(
    item_id: int,
    item_data: schemas.ClothingItemUpdate,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Обновление данных вещи (категория, цвет, сезон, стиль, название).
    """
    # Ищем вещь по ID и проверяем владельца
    result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.id == item_id,
            models.ClothingItem.owner_id == current_user.id
        )
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Обновляем поля если они переданы
    if item_data.name is not None:
        item.filename = item_data.name  # Используем filename для хранения названия
    if item_data.category is not None:
        item.category = item_data.category
    if item_data.color is not None:
        item.color = item_data.color
    if item_data.season is not None:
        item.season = item_data.season
    if item_data.style is not None:
        item.style = item_data.style
    
    await db.commit()
    await db.refresh(item)
    
    return item

# =============================================================================
# ЭНДПОИНТ: УДАЛЕНИЕ ВЕЩИ
# =============================================================================
@router.delete("/{item_id}")
async def delete_item(
    item_id: int,  # ID вещи для удаления (из URL)
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Удаление вещи из гардероба.
    
    Алгоритм:
    1. Находим вещь по ID
    2. Проверяем что вещь принадлежит текущему пользователю
    3. Удаляем файл изображения с диска
    4. Удаляем запись из базы данных
    
    Args:
        item_id: ID вещи для удаления
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        dict: Сообщение об успешном удалении
    
    Raises:
        HTTPException 404: Если вещь не найдена
    
    Пример запроса:
        DELETE /api/clothing/5
        Cookie: wardrobe_access_token=...
    """
    # Шаг 1 и 2: Ищем вещь по ID и проверяем владельца
    result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.id == item_id,
            models.ClothingItem.owner_id == current_user.id  # Только свои вещи!
        )
    )
    item = result.scalar_one_or_none()
    
    # Если вещь не найдена или принадлежит другому пользователю
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Шаг 3: Удаляем файл изображения с диска
    if os.path.exists(item.image_path):
        os.remove(item.image_path)
    
    # Шаг 4: Удаляем запись из базы данных
    await db.delete(item)
    await db.commit()
    
    return {"message": "Item deleted"}
