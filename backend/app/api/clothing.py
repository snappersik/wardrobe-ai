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
    2. Генерируем уникальное имя файла (UUID)
    3. Сохраняем файл на диск
    4. Создаём запись в базе данных
    5. Записываем в лог аудита
    6. Возвращаем данные о загруженной вещи
    
    TODO: Добавить YOLO распознавание категории и цвета
    
    Args:
        file: Загружаемый файл изображения (JPEG, PNG)
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        ClothingItemResponse: Данные о созданной вещи
    
    Пример запроса:
        POST /api/clothing/upload
        Content-Type: multipart/form-data
        file: (binary image data)
    """
    # Шаг 1: Создаём директорию для загрузок если её нет
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Шаг 2: Генерируем уникальное имя файла
    # UUID гарантирует что файлы не перезапишут друг друга
    file_extension = os.path.splitext(file.filename)[1]  # Получаем расширение (.jpg, .png)
    unique_filename = f"{uuid.uuid4()}{file_extension}"  # Например: abc123-def456.jpg
    file_path = f"{upload_dir}/{unique_filename}"        # uploads/abc123-def456.jpg
    
    # Шаг 3: Сохраняем файл на диск
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Шаг 4: Создаём запись в базе данных
    # TODO: Интегрировать YOLO для автоматического распознавания одежды
    new_item = models.ClothingItem(
        owner_id=current_user.id,    # Владелец вещи
        filename=file.filename,      # Оригинальное имя файла
        image_path=file_path,        # Путь к сохранённому файлу
        category="unknown",          # TODO: Распознать через YOLO
        color="unknown"              # TODO: Распознать через YOLO
    )
    
    # Добавляем в базу данных
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)  # Получаем id и created_at
    
    # Шаг 5: Записываем в лог аудита
    log = models.AuditLog(
        user_id=current_user.id, 
        action="upload_item",  # Тип действия: загрузка
        details=f"Uploaded {file.filename}"
    )
    db.add(log)
    await db.commit()
    
    # Шаг 6: Возвращаем данные о вещи
    return new_item


# =============================================================================
# ЭНДПОИНТ: ПОЛУЧЕНИЕ СПИСКА СВОИХ ВЕЩЕЙ
# =============================================================================
@router.get("/my-items", response_model=list[schemas.ClothingItemResponse])
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
        GET /api/clothing/my-items
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
