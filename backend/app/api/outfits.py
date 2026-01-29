# =============================================================================
# API РОУТЕР: ОБРАЗЫ (outfits.py)
# =============================================================================
# Этот модуль содержит эндпоинты для работы с образами (нарядами):
# - Создание образов (выбор вещей из гардероба)
# - Получение списка образов
# - Просмотр деталей образа
# - Обновление информации об образе
# - Добавление/удаление вещей
# - Удаление образов
# =============================================================================

# Импорт компонентов FastAPI
from fastapi import APIRouter, Depends, HTTPException, status

# Асинхронная сессия SQLAlchemy
from sqlalchemy.ext.asyncio import AsyncSession

# SQL операции
from sqlalchemy import select, delete

# Типизация для списков
from typing import List

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
# prefix="/outfits" - все маршруты начинаются с /api/outfits
# tags=["Outfits"] - группировка в Swagger
router = APIRouter(prefix="/outfits", tags=["Outfits"])


# =============================================================================
# ЭНДПОИНТ: СОЗДАНИЕ ОБРАЗА
# =============================================================================
@router.post("/create", response_model=schemas.OutfitDetailResponse)
async def create_outfit(
    outfit_data: schemas.OutfitCreate,  # Данные для создания образа
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Создание нового образа вручную (выбор вещей из гардероба).
    
    Алгоритм:
    1. Проверяем что все указанные вещи существуют и принадлежат пользователю
    2. Создаём новый образ
    3. Связываем вещи с образом (таблица outfit_items)
    4. Записываем в лог аудита
    5. Возвращаем образ со списком вещей
    
    Args:
        outfit_data: Данные образа (название, сезон, погода, список ID вещей)
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        OutfitDetailResponse: Созданный образ со списком вещей
    
    Raises:
        HTTPException 400: Если некоторые вещи не найдены
    
    Пример запроса:
        POST /api/outfits/create
        {
            "name": "Летний образ",
            "target_season": "summer",
            "target_weather": "sunny",
            "item_ids": [1, 3, 7]
        }
    """
    
    # Шаг 1: Проверяем что все вещи существуют и принадлежат пользователю
    result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.id.in_(outfit_data.item_ids),     # ID из списка
            models.ClothingItem.owner_id == current_user.id       # Только свои вещи
        )
    )
    items = result.scalars().all()
    
    # Если количество найденных вещей не совпадает с запрошенным
    if len(items) != len(outfit_data.item_ids):
        raise HTTPException(
            status_code=400, 
            detail="Some items not found or don't belong to you"
        )
    
    # Шаг 2: Создаём образ
    new_outfit = models.Outfit(
        owner_id=current_user.id,
        name=outfit_data.name,
        target_season=outfit_data.target_season,
        target_weather=outfit_data.target_weather,
        created_by_ai=False  # Создано пользователем вручную (не AI)
    )
    
    db.add(new_outfit)
    await db.commit()
    await db.refresh(new_outfit)  # Получаем id
    
    # Шаг 3: Создаём связи между образом и вещами (Many-to-Many)
    for item_id in outfit_data.item_ids:
        outfit_item = models.OutfitItem(
            outfit_id=new_outfit.id,
            item_id=item_id
        )
        db.add(outfit_item)
    
    await db.commit()
    
    # Шаг 4: Записываем в лог аудита
    log = models.AuditLog(
        user_id=current_user.id, 
        action="create_outfit",
        details=f"Created outfit: {outfit_data.name or 'Unnamed'}"
    )
    db.add(log)
    await db.commit()
    
    # Шаг 5: Возвращаем образ со списком вещей
    await db.refresh(new_outfit)
    return {
        **new_outfit.__dict__,
        "items": items
    }


# =============================================================================
# ЭНДПОИНТ: ПОЛУЧЕНИЕ СПИСКА ОБРАЗОВ
# =============================================================================
@router.get("/my-outfits", response_model=List[schemas.OutfitResponse])
async def get_my_outfits(
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получение всех образов текущего пользователя (краткий список).
    
    Возвращает список образов БЕЗ подробной информации о вещах.
    Для получения вещей используйте GET /api/outfits/{outfit_id}
    
    Args:
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        List[OutfitResponse]: Список образов пользователя
    
    Пример запроса:
        GET /api/outfits/my-outfits
    """
    # Выбираем все образы пользователя
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.owner_id == current_user.id
        )
    )
    outfits = result.scalars().all()
    return outfits


# =============================================================================
# ЭНДПОИНТ: ДЕТАЛИ ОБРАЗА
# =============================================================================
@router.get("/{outfit_id}", response_model=schemas.OutfitDetailResponse)
async def get_outfit_detail(
    outfit_id: int,  # ID образа из URL
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получение подробной информации об образе (включая список вещей).
    
    Args:
        outfit_id: ID образа
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        OutfitDetailResponse: Образ со списком всех вещей
    
    Raises:
        HTTPException 404: Если образ не найден
    
    Пример запроса:
        GET /api/outfits/5
    """
    # Ищем образ по ID (только свои!)
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Получаем все вещи этого образа через связующую таблицу
    result = await db.execute(
        select(models.ClothingItem)
        .join(models.OutfitItem)  # JOIN с таблицей outfit_items
        .filter(models.OutfitItem.outfit_id == outfit_id)
    )
    items = result.scalars().all()
    
    return {
        **outfit.__dict__,
        "items": items
    }


# =============================================================================
# ЭНДПОИНТ: ОБНОВЛЕНИЕ ОБРАЗА
# =============================================================================
@router.patch("/{outfit_id}", response_model=schemas.OutfitResponse)
async def update_outfit(
    outfit_id: int,
    outfit_update: schemas.OutfitUpdate,  # Данные для обновления
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Обновление информации об образе (название, сезон, избранное).
    
    Обновляет только переданные поля (PATCH логика).
    
    Args:
        outfit_id: ID образа для обновления
        outfit_update: Новые значения полей
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        OutfitResponse: Обновлённый образ
    
    Raises:
        HTTPException 404: Если образ не найден
    
    Пример запроса:
        PATCH /api/outfits/5
        {
            "name": "Новое название",
            "is_favorite": true
        }
    """
    # Ищем образ
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Обновляем только те поля которые были переданы
    update_data = outfit_update.dict(exclude_unset=True)  # Только заполненные поля
    for key, value in update_data.items():
        setattr(outfit, key, value)
    
    await db.commit()
    await db.refresh(outfit)
    return outfit


# =============================================================================
# ЭНДПОИНТ: ДОБАВЛЕНИЕ ВЕЩЕЙ В ОБРАЗ
# =============================================================================
@router.post("/{outfit_id}/add-items", response_model=schemas.OutfitDetailResponse)
async def add_items_to_outfit(
    outfit_id: int,
    items_data: schemas.OutfitAddItems,  # Список ID вещей
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Добавление вещей в существующий образ.
    
    Если вещь уже есть в образе - игнорируется (без ошибки).
    
    Args:
        outfit_id: ID образа
        items_data: Список ID вещей для добавления
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        OutfitDetailResponse: Обновлённый образ со всеми вещами
    
    Raises:
        HTTPException 404: Образ не найден
        HTTPException 400: Некоторые вещи не найдены
    
    Пример запроса:
        POST /api/outfits/5/add-items
        {
            "item_ids": [8, 12]
        }
    """
    # Шаг 1: Проверяем что образ существует
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Шаг 2: Проверяем что все вещи существуют
    result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.id.in_(items_data.item_ids),
            models.ClothingItem.owner_id == current_user.id
        )
    )
    items = result.scalars().all()
    
    if len(items) != len(items_data.item_ids):
        raise HTTPException(status_code=400, detail="Some items not found")
    
    # Шаг 3: Добавляем связи (пропускаем дубликаты)
    for item_id in items_data.item_ids:
        # Проверяем нет ли уже такой связи
        result = await db.execute(
            select(models.OutfitItem).filter(
                models.OutfitItem.outfit_id == outfit_id,
                models.OutfitItem.item_id == item_id
            )
        )
        # Если связи нет - создаём
        if not result.scalar_one_or_none():
            outfit_item = models.OutfitItem(outfit_id=outfit_id, item_id=item_id)
            db.add(outfit_item)
    
    await db.commit()
    
    # Возвращаем обновлённый образ со всеми вещами
    result = await db.execute(
        select(models.ClothingItem)
        .join(models.OutfitItem)
        .filter(models.OutfitItem.outfit_id == outfit_id)
    )
    all_items = result.scalars().all()
    
    return {
        **outfit.__dict__,
        "items": all_items
    }


# =============================================================================
# ЭНДПОИНТ: УДАЛЕНИЕ ВЕЩИ ИЗ ОБРАЗА
# =============================================================================
@router.delete("/{outfit_id}/remove-item/{item_id}")
async def remove_item_from_outfit(
    outfit_id: int,
    item_id: int,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Удаление вещи из образа.
    
    Удаляет только связь - сама вещь остаётся в гардеробе.
    
    Args:
        outfit_id: ID образа
        item_id: ID вещи для удаления
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        dict: Сообщение об успешном удалении
    
    Raises:
        HTTPException 404: Образ не найден
    
    Пример запроса:
        DELETE /api/outfits/5/remove-item/8
    """
    # Проверяем что образ существует
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Удаляем связь между образом и вещью
    await db.execute(
        delete(models.OutfitItem).filter(
            models.OutfitItem.outfit_id == outfit_id,
            models.OutfitItem.item_id == item_id
        )
    )
    await db.commit()
    
    return {"message": "Item removed from outfit"}


# =============================================================================
# ЭНДПОИНТ: УДАЛЕНИЕ ОБРАЗА
# =============================================================================
@router.delete("/{outfit_id}")
async def delete_outfit(
    outfit_id: int,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Удаление образа полностью.
    
    Удаляет образ и все связи с вещами.
    Сами вещи остаются в гардеробе.
    
    Args:
        outfit_id: ID образа для удаления
        current_user: Текущий авторизованный пользователь
        db: Сессия базы данных
    
    Returns:
        dict: Сообщение об успешном удалении
    
    Raises:
        HTTPException 404: Образ не найден
    
    Пример запроса:
        DELETE /api/outfits/5
    """
    # Ищем образ
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Удаляем все связи с вещами
    await db.execute(
        delete(models.OutfitItem).filter(
            models.OutfitItem.outfit_id == outfit_id
        )
    )
    
    # Удаляем сам образ
    await db.delete(outfit)
    await db.commit()
    
    return {"message": "Outfit deleted"}
