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
# ЭНДПОИНТ: ПОГОДА ДЛЯ ПОЛЬЗОВАТЕЛЯ
# =============================================================================
# ВАЖНО: Эти роуты должны быть ПЕРЕД /{outfit_id} иначе FastAPI 
# попытается распарсить "weather" как outfit_id и выдаст 422 ошибку
from app.services.weather import get_weather, get_weather_by_coords, reverse_geocode, temp_to_category, category_to_russian

@router.get("/weather")
async def get_current_weather(
    current_user: models.User = Depends(services.get_current_user)
):
    """
    Получает текущую погоду для города пользователя.
    """
    try:
        city = current_user.city if current_user.city else "Москва"
        weather = await get_weather(city)
        return weather
    except Exception as e:
        print(f"❌ Weather error: {e}")
        # Возвращаем fallback погоду
        return {
            "temp": 20,
            "feels_like": 18,
            "description": "данные недоступны",
            "icon": "🌤️",
            "city": current_user.city or "Москва",
            "category": "warm"
        }


@router.get("/weather/current")
async def get_current_weather_safe(
    current_user: models.User = Depends(services.get_current_user)
):
    """
    Safe alias for current weather (avoids /{outfit_id} path conflicts).
    """
    return await get_current_weather(current_user)


@router.get("/weather/by-coords")
async def get_weather_by_coordinates(
    lat: float,
    lon: float
):
    """
    Получает погоду по координатам (для геолокации браузера).
    Не требует авторизации для первичного определения города.
    """
    weather = await get_weather_by_coords(lat, lon)
    
    # Получаем название города по координатам
    city = await reverse_geocode(lat, lon)
    weather["city"] = city or "Неизвестный город"
    
    return weather


@router.get("/weather/city-by-coords")
async def get_city_by_coordinates(
    lat: float,
    lon: float
):
    """
    Определяет название города по координатам.
    Используется для автоматического определения города пользователя.
    """
    city = await reverse_geocode(lat, lon)
    return {
        "city": city or "Москва",
        "lat": lat,
        "lon": lon
    }


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
    
    # Удаляем связи с календарём
    await db.execute(
        delete(models.CalendarOutfit).filter(
            models.CalendarOutfit.outfit_id == outfit_id
        )
    )

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


# =============================================================================
# ЭНДПОИНТ: AI ГЕНЕРАЦИЯ ОБРАЗОВ (ГЕНЕРАТОР)
# =============================================================================
import random
import itertools
from app.services.plan_limits import (
    get_max_outfits, check_generation_allowed, increment_generation_count, get_plan_limits
)

@router.post("/generate")
async def generate_outfits(
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db),
    occasion: str = "casual",
    weather_category: str = "warm",
    count: int = 5
):
    """
    Генерирует умные образы из гардероба пользователя.
    Лимиты зависят от тарифного плана (free/basic/premium).
    """
    # Lazy import ML modules
    from app.ml.outfit_scorer import score_outfit, filter_items_by_weather, parse_json_field
    
    # ─── Проверка лимитов тарифного плана ─────────────────────────────────
    plan = current_user.subscription_plan or "free"
    max_count = get_max_outfits(plan)
    count = min(count, max_count)
    
    # Проверка дневного лимита (для free)
    gen_check = await check_generation_allowed(current_user.id, plan)
    if not gen_check["allowed"]:
        limits = get_plan_limits(plan)
        raise HTTPException(
            status_code=429,
            detail={
                "message": "Дневной лимит генераций исчерпан",
                "current_plan": plan,
                "label_ru": limits["label_ru"],
                "daily_limit": gen_check["daily_limit"],
                "used_today": gen_check["used_today"],
            }
        )
    
    # Получаем все вещи пользователя
    result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.owner_id == current_user.id
        )
    )
    all_items = result.scalars().all()
    
    if len(all_items) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Недостаточно вещей в гардеробе. Загрузите минимум 2 вещи."
        )
    
    # Конвертируем в словари для scorer
    items_dict = [
        {
            "id": item.id,
            "filename": item.filename,
            "image_path": item.image_path,
            "category": item.category,
            "color": item.color,
            "style": item.style,
            "season": item.season
        }
        for item in all_items
    ]
    
    # Фильтруем вещи по погоде/сезону (если нет подходящих — возвращает все)
    filtered_items = filter_items_by_weather(items_dict, weather_category)

    if weather_category in ["warm", "hot"]:
        restricted_categories = {"pullover", "coat"}
        warm_items = [i for i in filtered_items if i["category"] not in restricted_categories]
        if warm_items:
            filtered_items = warm_items
        else:
            filtered_items = [i for i in items_dict if i["category"] not in restricted_categories]
            if not filtered_items:
                raise HTTPException(
                    status_code=400,
                    detail="not enoght items"
                )



    # Group items by type
    top_categories = {"t-shirt", "shirt", "pullover"}
    outer_categories = {"coat"}
    bottom_categories = {"trouser"}
    full_categories = {"dress"}
    shoe_categories = {"sneaker", "sandal", "ankle-boot"}
    accessory_categories = {"bag"}

    tops = [i for i in filtered_items if i["category"] in top_categories]
    outerwear = [i for i in filtered_items if i["category"] in outer_categories]
    bottoms = [i for i in filtered_items if i["category"] in bottom_categories]
    fulls = [i for i in filtered_items if i["category"] in full_categories]
    shoes = [i for i in filtered_items if i["category"] in shoe_categories]
    accessories = [i for i in filtered_items if i["category"] in accessory_categories]

    # Fallbacks if wardrobe is sparse
    non_layer_categories = shoe_categories | accessory_categories | full_categories
    if not tops:
        fallback_tops = [i for i in filtered_items if i["category"] not in (non_layer_categories | bottom_categories | outer_categories)]
        tops = fallback_tops or [i for i in filtered_items if i["category"] not in (non_layer_categories | outer_categories)]
    if not bottoms:
        fallback_bottoms = [i for i in filtered_items if i["category"] not in (non_layer_categories | top_categories | outer_categories)]
        bottoms = fallback_bottoms or [i for i in filtered_items if i["category"] not in non_layer_categories]

    def is_winter_item(item):
        seasons = [s.lower() for s in parse_json_field(item.get("season", []))]
        return (
            "winter" in seasons
            or "зима" in seasons
            or "all" in seasons
            or "всесезонный" in seasons
        )


    def is_transitional_item(item):
        seasons = [s.lower() for s in parse_json_field(item.get("season", []))]
        if not seasons:
            return False
        for value in seasons:
            if (
                "spring" in value
                or "autumn" in value
                or "fall" in value
                or "весна" in value
                or "осень" in value
                or "all" in value
                or "демисезон" in value
            ):
                return True
        return False

    winter_coats = [c for c in outerwear if is_winter_item(c)]
    coat_candidates = winter_coats or outerwear

    transitional_coats = [c for c in outerwear if is_transitional_item(c)]
    coat_candidates_cool = transitional_coats or outerwear

    def add_with_shoes_and_accessories(base_items, combinations):
        if shoes:
            for shoe in shoes:
                outfit = base_items + [shoe]
                if accessories:
                    for acc in accessories:
                        combinations.append(outfit + [acc])
                else:
                    combinations.append(outfit)
        else:
            combinations.append(base_items)
            if accessories:
                for acc in accessories:
                    combinations.append(base_items + [acc])

    # Build combinations
    all_combinations = []
    weather_is_cold = weather_category == "cold"

    # Cold weather: coat required when available, plus top + bottom.
    if weather_is_cold:
        coat_required = bool(coat_candidates)
        coat_variants = coat_candidates if coat_required else [None]

        for bottom in bottoms:
            for top in tops:
                if top["id"] == bottom["id"]:
                    continue
                for coat in coat_variants:
                    base_outfit = []
                    if coat:
                        base_outfit.append(coat)
                    base_outfit.extend([top, bottom])
                    add_with_shoes_and_accessories(base_outfit, all_combinations)

        shirts = [i for i in tops if i["category"] == "shirt"]
        pullovers = [i for i in tops if i["category"] == "pullover"]
        if shirts and pullovers:
            for bottom in bottoms:
                for shirt in shirts:
                    for pullover in pullovers:
                        if len({shirt["id"], pullover["id"], bottom["id"]}) < 3:
                            continue
                        for coat in coat_variants:
                            base_outfit = []
                            if coat:
                                base_outfit.append(coat)
                            base_outfit.extend([shirt, pullover, bottom])
                            add_with_shoes_and_accessories(base_outfit, all_combinations)

    # Non-cold weather: top + bottom, coat optional.
    if not weather_is_cold:
        coat_variants = coat_candidates_cool if weather_category == "cool" else outerwear
        for top in tops:
            for bottom in bottoms:
                if top["id"] == bottom["id"]:
                    continue
                base_outfit = [top, bottom]
                add_with_shoes_and_accessories(base_outfit, all_combinations)
                for coat in coat_variants:
                    base_outfit = [coat, top, bottom]
                    add_with_shoes_and_accessories(base_outfit, all_combinations)

    # Dresses: only with shirt/coat (or alone). Skip in cold unless nothing else.
    allow_dress_outfits = not weather_is_cold
    if weather_is_cold and not all_combinations:
        allow_dress_outfits = True

    if allow_dress_outfits:
        shirts = [i for i in tops if i["category"] == "shirt"]
        for dress in fulls:
            add_with_shoes_and_accessories([dress], all_combinations)
            if weather_category not in ["warm", "hot"]:
                for shirt in shirts:
                    add_with_shoes_and_accessories([dress, shirt], all_combinations)
            coat_variants = coat_candidates_cool if weather_category == "cool" else outerwear
            for coat in coat_variants:
                add_with_shoes_and_accessories([dress, coat], all_combinations)
            if weather_category not in ["warm", "hot"]:
                for shirt in shirts:
                    for coat in coat_variants:
                        add_with_shoes_and_accessories([dress, shirt, coat], all_combinations)
    if not all_combinations:
        all_combinations.append(items_dict[:min(3, len(items_dict))])
    
    # Оцениваем каждую комбинацию
    scored_outfits = []
    for combo in all_combinations:
        scores = score_outfit(combo, occasion, weather_category)
        scored_outfits.append({
            "items": combo,
            "scores": scores
        })
    
    # Сортируем по score (лучшие первые)
    scored_outfits.sort(key=lambda x: x["scores"]["total"], reverse=True)
    
    # Фильтруем только хорошие образы (score > 0.5)
    # Filter by score
    good_outfits = [o for o in scored_outfits if o["scores"]["total"] > 0.5]

    # If there are no good outfits, fall back to the best ones
    if not good_outfits:
        good_outfits = scored_outfits[:max(count, 1)]

    # Pick a wider pool for diversity when needed
    def unique_item_count(outfits):
        return len({item["id"] for outfit in outfits for item in outfit["items"]})

    candidate_outfits = good_outfits
    if unique_item_count(candidate_outfits) < unique_item_count(scored_outfits):
        candidate_outfits = scored_outfits
    elif len(candidate_outfits) < count * 2:
        candidate_outfits = scored_outfits

    # Remove duplicates (same set of item IDs)
    seen_combos = set()
    unique_outfits = []
    for outfit in candidate_outfits:
        combo_ids = tuple(sorted(item["id"] for item in outfit["items"]))
        if combo_ids not in seen_combos:
            seen_combos.add(combo_ids)
            unique_outfits.append(outfit)

    def select_diverse(outfits, target_count):
        selected = []
        usage = {}
        remaining = outfits[:]
        random.shuffle(remaining)

        while remaining and len(selected) < target_count:
            best = None
            best_score = None
            for outfit in remaining:
                item_ids = [item["id"] for item in outfit["items"]]
                reuse = sum(usage.get(item_id, 0) for item_id in item_ids)
                novelty = sum(1 for item_id in item_ids if usage.get(item_id, 0) == 0)
                adjusted = outfit["scores"]["total"] + (novelty * 0.02) - (reuse * 0.03)
                if best_score is None or adjusted > best_score:
                    best = outfit
                    best_score = adjusted
            selected.append(best)
            for item_id in [item["id"] for item in best["items"]]:
                usage[item_id] = usage.get(item_id, 0) + 1
            remaining.remove(best)

        return selected

    # Select diverse outfits (count already capped by plan)
    final_outfits = select_diverse(unique_outfits, count)
    
    # Формируем ответ
    generated_outfits = []
    for i, outfit in enumerate(final_outfits):
        generated_outfits.append({
            "id": None,  # Не сохранён
            "name": f"AI образ #{i + 1}",
            "occasion": occasion,
            "weather": weather_category,
            "items": [
                {
                    "id": item["id"],
                    "filename": item["filename"],
                    "image_path": item["image_path"],
                    "category": item["category"],
                    "color": item["color"]
                }
                for item in outfit["items"]
            ],
            "score": outfit["scores"]["total"],
            "score_breakdown": outfit["scores"]["breakdown"],
            "color_score": outfit["scores"]["color"],
            "style_score": outfit["scores"]["style"],
            "weather_score": outfit["scores"]["weather"]
        })
    
    # Инкрементируем счётчик генераций для free-пользователей
    if plan == "free":
        await increment_generation_count(current_user.id)
    
    return generated_outfits


# =============================================================================
# ЭНДПОИНТ: ОБРАТНАЯ СВЯЗЬ (ЛАЙК/ДИЗЛАЙК/ИЗБРАННОЕ/СОХРАНЕНИЕ)
# =============================================================================
from pydantic import BaseModel

class OutfitFeedback(BaseModel):
    action: str  # "like", "dislike", "favorite", "save", "skip"
    item_ids: List[int]  # ID вещей в образе
    occasion: str = "casual"
    weather: str = "warm"

@router.post("/feedback")
async def submit_feedback(
    feedback: OutfitFeedback,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Обрабатывает обратную связь по сгенерированному образу.
    
    Actions:
    - like: Обучение AI (хороший образ)
    - dislike: Обучение AI (плохой образ)
    - favorite: Сохранить в избранное
    - save: Просто сохранить образ
    - skip: Пропустить (ничего не делать)
    """
    if feedback.action == "skip":
        return {"message": "Skipped", "saved": False}
    
    # Для like/dislike - обновляем предпочтения (TODO: таблица preferences)
    if feedback.action in ["like", "dislike"]:
        # TODO: Записать в user_preferences для обучения AI
        print(f"📊 Feedback: {feedback.action} for items {feedback.item_ids}")
        return {"message": f"Feedback '{feedback.action}' recorded", "saved": False}
    
    # Для favorite/save - создаём образ в БД
    if feedback.action in ["favorite", "save"]:
        occasion_map = {
            "casual": "Повседневный",
            "work": "Офис",
            "party": "Вечеринка",
            "date": "Свидание",
            "sport": "Спорт",
            "повседневный": "Повседневный",
            "офис": "Офис",
            "вечеринка": "Вечеринка",
            "свидание": "Свидание",
            "спорт": "Спорт"
        }
        occasion_value = occasion_map.get(str(feedback.occasion).lower(), feedback.occasion)
        # Проверяем что все вещи принадлежат пользователю
        result = await db.execute(
            select(models.ClothingItem).filter(
                models.ClothingItem.id.in_(feedback.item_ids),
                models.ClothingItem.owner_id == current_user.id
            )
        )
        items = result.scalars().all()
        
        if len(items) != len(feedback.item_ids):
            raise HTTPException(status_code=400, detail="Some items not found")
        
        # Создаём образ
        new_outfit = models.Outfit(
            owner_id=current_user.id,
            name=f"AI: {occasion_value}",
            target_season=occasion_value,
            target_weather=feedback.weather,
            created_by_ai=True,
            is_favorite=(feedback.action == "favorite")
        )
        
        db.add(new_outfit)
        await db.commit()
        await db.refresh(new_outfit)
        
        # Связываем с вещами
        for item_id in feedback.item_ids:
            outfit_item = models.OutfitItem(
                outfit_id=new_outfit.id,
                item_id=item_id
            )
            db.add(outfit_item)
        
        await db.commit()
        
        return {
            "message": f"Outfit {'favorited' if feedback.action == 'favorite' else 'saved'}",
            "saved": True,
            "outfit_id": new_outfit.id
        }
    
    return {"message": "Unknown action", "saved": False}


# =============================================================================
# ЭНДПОИНТ: ПЕРЕКЛЮЧЕНИЕ ИЗБРАННОГО
# =============================================================================
@router.post("/{outfit_id}/toggle-favorite")
async def toggle_favorite(
    outfit_id: int,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Переключает статус избранного для образа."""
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    outfit.is_favorite = not outfit.is_favorite
    await db.commit()
    
    return {
        "outfit_id": outfit_id,
        "is_favorite": outfit.is_favorite
    }
