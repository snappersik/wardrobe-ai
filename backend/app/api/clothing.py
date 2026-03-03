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


# ML imports moved to upload_item to improve startup time

# =============================================================================
# ЭНДПОИНТ: ПРЕДОБРАБОТКА ФОТО ОДЕЖДЫ (без сохранения в БД)
# =============================================================================
@router.post("/upload")
async def upload_item(
    file: UploadFile = File(...),   # Файл изображения (обязательный)
    current_user: models.User = Depends(services.get_current_user),  # Авторизация
    db: AsyncSession = Depends(get_db)
):
    """
    Предобработка фотографии одежды БЕЗ сохранения в БД.
    
    Алгоритм:
    1. Создаём папку uploads если её нет
    2. Генерируем уникальное имя файла
    3. Сохраняем временный файл
    4. Распознаем вещь через Fashion-MNIST CNN
    5. Удаляем фон через RemBG
    6. Извлекаем доминирующий цвет
    7. Возвращаем данные для подтверждения (БЕЗ записи в БД)
    
    После этого фронтенд показывает модальное окно редактирования.
    При нажатии "Сохранить" вызывается POST /clothing/confirm.
    При отмене вызывается DELETE /clothing/cancel/{file_id}.
    """
    import sys
    import logging
    
    # Настраиваем логирование для вывода в консоль
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    logger.info(f"📥 Начало загрузки файла: {file.filename}")
    print(f"📥 [UPLOAD] Начало загрузки файла: {file.filename}", file=sys.stderr)
    
    # Lazy import ML modules to speed up server startup
    from app.ml.remover import get_remover
    from app.ml.fashion_classifier import get_fashion_classifier
    from app.ml.color_extractor import extract_dominant_color, extract_color_palette, suggest_color_variants
    
    # Шаг 1: Создаём директорию для загрузок
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Шаг 2: Генерируем уникальное имя (UUID)
    file_id = str(uuid.uuid4())
    temp_path = f"{upload_dir}/temp_{file_id}_{file.filename}"
    
    # Шаг 3: Сохраняем временный файл для обработки
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    logger.info(f"📁 Файл сохранён: {temp_path}")
    print(f"📁 [UPLOAD] Файл сохранён: {temp_path}", file=sys.stderr)
    
    import asyncio
    from functools import partial
    loop = asyncio.get_running_loop()
    
    try:
        # Шаг 4: Удаление фона через RemBG (делаем СНАЧАЛА!)
        logger.info("🖼️ Удаление фона...")
        print("🖼️ [UPLOAD] Удаление фона...", file=sys.stderr)
        
        final_filename = f"{file_id}.png" # Всегда PNG для прозрачности
        final_path = f"{upload_dir}/{final_filename}"
        
        # Fallback: если RemBG не готов/не доступен, используем оригинальный файл
        try:
            # Получаем ремувер (может блокировать если еще инициализируется)
            remover = await loop.run_in_executor(None, get_remover)
            
            # Запускаем удаление фона в пуле потоков
            removed = await loop.run_in_executor(
                None, 
                remover.remove_background, 
                temp_path, 
                final_path
            )
            
            if not removed or not os.path.exists(final_path):
                raise RuntimeError('Background removal failed or output not created')
            logger.info(f'BG removed: {final_path}')
            print(f'[UPLOAD] BG removed: {final_path}', file=sys.stderr)
        except Exception as bg_error:
            logger.warning(f'RemBG fallback, using original file: {bg_error}')
            print(f'[UPLOAD] RemBG fallback: {bg_error}', file=sys.stderr)
            shutil.copyfile(temp_path, final_path)
        
        # Шаг 5: Распознавание через MultiHeadResNet50 (категория + стиль)
        logger.info("🤖 Запуск классификатора...")
        print("🤖 [UPLOAD] Запуск классификатора...", file=sys.stderr)
        
        try:
            classifier = await loop.run_in_executor(None, get_fashion_classifier)
            prediction = await loop.run_in_executor(None, classifier.predict, final_path)
        except Exception as clf_error:
            logger.warning(f'Classifier fallback: {clf_error}')
            print(f'[UPLOAD] Classifier fallback: {clf_error}', file=sys.stderr)
            prediction = {'id': 'tee', 'name': 'Футболка', 'confidence': 0.0,
                          'style': 'casual', 'style_confidence': 0.0,
                          'seasons': ['spring', 'summer', 'fall'],
                          'temp_min': 15, 'temp_max': 35, 'waterproof_level': 0}
        
        category = prediction.get("id", "tee")
        confidence = prediction.get("confidence", 0.0)
        
        logger.info(f"🎯 Классификация: {prediction.get('name')} ({category}) - {confidence*100:.1f}%")
        print(f"🎯 [UPLOAD] Классификация: {prediction.get('name')} ({category}) - {confidence*100:.1f}%", file=sys.stderr)
        
        # Шаг 6: Извлечение цвета и палитры через K-means
        logger.info("🎨 Извлечение цвета...")
        print("🎨 [UPLOAD] Извлечение цвета...", file=sys.stderr)
        
        try:
            color_info = await loop.run_in_executor(None, extract_dominant_color, final_path)
        except Exception as color_error:
            logger.warning(f'Color extraction fallback: {color_error}')
            print(f'[UPLOAD] Color fallback: {color_error}', file=sys.stderr)
            color_info = {'name_en': 'gray', 'hex': '#808080'}
        
        color_id = color_info.get("name_en", "gray")
        color_hex = color_info.get("hex", "#808080")
        
        # Извлекаем палитру цветов
        try:
            palette = await loop.run_in_executor(
                None, 
                partial(extract_color_palette, k=4), 
                final_path
            )
            palette_hexes = [c.get('hex', '#808080') for c in palette]
            is_multicolor = len(set(c.get('name_en') for c in palette)) >= 3
        except Exception:
            palette_hexes = [color_hex]
            is_multicolor = False
        
        logger.info(f"🎨 Цвет: {color_id} ({color_hex}), палитра: {palette_hexes}")
        print(f"🎨 [UPLOAD] Цвет: {color_id} ({color_hex})", file=sys.stderr)
        
        # Шаг 7: Генерация 5 вариантов цвета для выбора пользователем
        try:
            color_rgb = tuple(color_info.get("rgb", [128, 128, 128]))
            color_suggestions = await loop.run_in_executor(
                None,
                partial(suggest_color_variants, count=5),
                color_rgb
            )
        except Exception:
            color_suggestions = [{"id": color_id, "name_ru": color_id, "name_en": color_id, "label": "Определённый", "hex": color_hex, "rgb": [128, 128, 128]}]
        
        result = {
            "file_id": file_id,
            "filename": file.filename,
            "image_path": final_path,
            "category": category,
            "color": color_id,
            "confidence": confidence,
            "style": prediction.get("style", "casual"),
            "style_confidence": prediction.get("style_confidence", 0.0),
            "seasons": prediction.get("seasons", []),
            "temp_min": prediction.get("temp_min"),
            "temp_max": prediction.get("temp_max"),
            "waterproof_level": prediction.get("waterproof_level", 0),
            "is_multicolor": is_multicolor,
            "color_palette": palette_hexes,
            "color_suggestions": color_suggestions,
            "pending": True
        }
        
        logger.info(f"✅ Загрузка завершена: {result}")
        print(f"✅ [UPLOAD] Загрузка завершена: {result}", file=sys.stderr)
        
        # Возвращаем данные для модального окна редактирования
        # НЕ сохраняем в БД - это произойдёт при подтверждении
        return result
    
    except Exception as e:
        logger.error(f"❌ Ошибка загрузки: {e}")
        print(f"❌ [UPLOAD] Ошибка: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Удаляем временный файл (но НЕ final_path - он нужен!)
        if os.path.exists(temp_path):
            os.remove(temp_path)


# =============================================================================
# ЭНДПОИНТ: ПОДТВЕРЖДЕНИЕ СОХРАНЕНИЯ ВЕЩИ В БД
# =============================================================================
@router.post("/confirm", response_model=schemas.ClothingItemResponse)
async def confirm_item(
    item_data: schemas.ClothingItemCreate,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Подтверждение сохранения вещи после редактирования.
    Вызывается при нажатии "Сохранить в гардероб".
    """
    import json
    
    # Проверяем что файл существует
    if not os.path.exists(item_data.image_path):
        raise HTTPException(status_code=400, detail="Image file not found")
    
    # Создаём запись в базе данных
    new_item = models.ClothingItem(
        owner_id=current_user.id,
        filename=item_data.name or item_data.filename,
        name=item_data.name,
        image_path=item_data.image_path,
        category=item_data.category,
        color=json.dumps(item_data.color) if isinstance(item_data.color, list) else item_data.color,
        season=json.dumps(item_data.season) if isinstance(item_data.season, list) else item_data.season,
        style=json.dumps(item_data.style) if isinstance(item_data.style, list) else item_data.style,
        temp_min=item_data.temp_min,
        temp_max=item_data.temp_max,
        waterproof_level=item_data.waterproof_level or 0,
        is_multicolor=item_data.is_multicolor or False,
        color_palette=json.dumps(item_data.color_palette) if item_data.color_palette else None,
        is_favorite=item_data.is_favorite or False,
    )
    
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    
    # Лог аудита
    log = models.AuditLog(
        user_id=current_user.id, 
        action="upload_item",
        details=f"Confirmed and saved {new_item.filename} (category: {item_data.category})"
    )
    db.add(log)
    await db.commit()
    
    print(f"✅ Вещь сохранена в БД: {new_item.filename} (ID: {new_item.id})")
    
    return new_item


# =============================================================================
# ЭНДПОИНТ: ОТМЕНА ЗАГРУЗКИ (удаление файла без сохранения)
# =============================================================================
@router.delete("/cancel/{file_id}")
async def cancel_upload(
    file_id: str,
    current_user: models.User = Depends(services.get_current_user)
):
    """
    Отмена загрузки - удаляет обработанный файл без сохранения в БД.
    Вызывается при нажатии X или Escape в модальном окне.
    """
    upload_dir = "uploads"
    file_path = f"{upload_dir}/{file_id}.png"
    
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"🗑️ Отменена загрузка: {file_id}")
        return {"message": "Upload cancelled", "deleted": True}
    
    return {"message": "File not found", "deleted": False}


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
        item.filename = item_data.name
        item.name = item_data.name
    if item_data.category is not None:
        item.category = item_data.category
    
    import json
    # Обработка мульти-выбора для цвета
    if item_data.color is not None:
        if isinstance(item_data.color, list):
            item.color = json.dumps(item_data.color)
        else:
            item.color = item_data.color
    
    # Обработка мульти-выбора для сезона
    if item_data.season is not None:
        if isinstance(item_data.season, list):
            item.season = json.dumps(item_data.season)
        else:
            item.season = item_data.season
    
    # Обработка мульти-выбора для стиля
    if item_data.style is not None:
        if isinstance(item_data.style, list):
            item.style = json.dumps(item_data.style)
        else:
            item.style = item_data.style
    
    # Новые поля Phase 1
    if item_data.temp_min is not None:
        item.temp_min = item_data.temp_min
    if item_data.temp_max is not None:
        item.temp_max = item_data.temp_max
    if item_data.waterproof_level is not None:
        item.waterproof_level = item_data.waterproof_level
    if item_data.is_multicolor is not None:
        item.is_multicolor = item_data.is_multicolor
    if item_data.color_palette is not None:
        item.color_palette = json.dumps(item_data.color_palette)
    if item_data.is_favorite is not None:
        item.is_favorite = item_data.is_favorite
    
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
