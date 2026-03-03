# =============================================================================
# PYDANTIC СХЕМЫ (schemas.py)
# =============================================================================
# Схемы определяют структуру данных для:
# - Валидации входящих запросов (Request validation)
# - Сериализации ответов API (Response serialization)
# - Автоматической документации Swagger/OpenAPI
# =============================================================================

# Pydantic - библиотека для валидации данных
from pydantic import BaseModel, EmailStr, validator

# Типизация для опциональных полей и списков
from typing import Optional, List

# Работа с датами
from datetime import datetime, date


# =============================================================================
# СХЕМЫ ПОЛЬЗОВАТЕЛЕЙ (User Schemas)
# =============================================================================

class UserCreate(BaseModel):
    """
    Схема для РЕГИСТРАЦИИ нового пользователя.
    
    Используется в: POST /api/users/register
    
    Атрибуты:
        username: Логин (обязательный)
        email: Email адрес (обязательный, валидация формата)
        password: Пароль в открытом виде (будет захеширован)
        full_name: Полное имя (опционально)
        city: Город (по умолчанию Москва)
    """
    username: str                           # Логин пользователя
    email: EmailStr                         # Email с валидацией формата
    password: str                           # Пароль (хешируется в сервисе)
    full_name: Optional[str] = None         # Полное имя (опционально)
    city: Optional[str] = "Москва"          # Город по умолчанию


class UserLogin(BaseModel):
    """
    Схема для АВТОРИЗАЦИИ (входа в систему).
    
    Используется в: POST /api/users/login
    
    Атрибуты:
        username_or_email: Логин или email
        password: Пароль
    """
    username_or_email: str                  # Можно войти по логину или email
    password: str                           # Пароль для проверки


class UserUpdate(BaseModel):
    """
    Схема для ОБНОВЛЕНИЯ профиля пользователя.
    
    Используется в: PATCH /api/users/me
    """
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    city: Optional[str] = None


class UserResponse(BaseModel):
    """
    Схема ОТВЕТА с данными пользователя.
    
    Возвращается из: GET /api/users/me, POST /api/users/register, POST /api/users/login
    
    Атрибуты:
        id: ID пользователя
        username: Логин
        email: Email
        full_name: Полное имя
        city: Город
        created_at: Дата регистрации
    """
    id: int                                 # ID из базы данных
    username: str                           # Логин пользователя
    email: EmailStr                         # Email адрес
    full_name: Optional[str] = None         # Полное имя
    city: str                               # Город пользователя
    role: str                               # Роль (user, admin)
    subscription_plan: str = "free"         # Тарифный план (free, basic, premium)
    avatar_path: Optional[str] = None       # Путь к аватарке
    created_at: datetime                    # Дата регистрации
    
    class Config:
        # Включает поддержку ORM моделей (SQLAlchemy -> Pydantic)
        from_attributes = True


# =============================================================================
# СХЕМЫ ОДЕЖДЫ (Clothing Schemas)
# =============================================================================

class ClothingItemCreate(BaseModel):
    """
    Схема для СОЗДАНИЯ новой вещи (метаданные).
    Используется в: POST /api/clothing/confirm
    """
    file_id: Optional[str] = None
    image_path: str
    name: Optional[str] = None
    filename: Optional[str] = None
    category: Optional[str] = None
    color: Optional[List[str]] = None
    season: Optional[List[str]] = None
    style: Optional[List[str]] = None
    temp_min: Optional[int] = None
    temp_max: Optional[int] = None
    waterproof_level: Optional[int] = 0
    is_multicolor: Optional[bool] = False
    color_palette: Optional[List[str]] = None
    is_favorite: Optional[bool] = False


class ClothingItemResponse(BaseModel):
    """
    Схема ОТВЕТА с данными вещи.
    Возвращается из: GET /api/clothing, POST /api/clothing/upload
    """
    id: int
    owner_id: int
    filename: str
    image_path: str
    name: Optional[str] = None
    category: Optional[str] = None
    color: Optional[List[str]] = None
    season: Optional[List[str]] = None
    style: Optional[List[str]] = None
    temp_min: Optional[int] = None
    temp_max: Optional[int] = None
    waterproof_level: int = 0
    is_multicolor: bool = False
    color_palette: Optional[List[str]] = None
    is_favorite: bool = False
    wear_count: int = 0
    is_clean: bool = True
    created_at: datetime
    
    @validator('color', 'season', 'style', 'color_palette', pre=True)
    def parse_json_array(cls, v):
        """Парсит JSON-строку из БД в список."""
        if v is None:
            return None
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except:
                return [v]
        return v
    
    class Config:
        from_attributes = True


class ClothingItemUpdate(BaseModel):
    """
    Схема для ОБНОВЛЕНИЯ вещи.
    Используется в: PUT /api/clothing/{id}
    """
    name: Optional[str] = None
    category: Optional[str] = None
    color: Optional[List[str]] = None
    season: Optional[List[str]] = None
    style: Optional[List[str]] = None
    temp_min: Optional[int] = None
    temp_max: Optional[int] = None
    waterproof_level: Optional[int] = None
    is_multicolor: Optional[bool] = None
    color_palette: Optional[List[str]] = None
    is_favorite: Optional[bool] = None

# =============================================================================
# СХЕМЫ ОБРАЗОВ (Outfit Schemas)
# =============================================================================

class OutfitCreate(BaseModel):
    """
    Схема для СОЗДАНИЯ нового образа.
    
    Используется в: POST /api/outfits/create
    
    Атрибуты:
        name: Название образа
        target_season: Целевой сезон
        target_weather: Целевая погода
        item_ids: Список ID вещей для включения в образ
    """
    name: Optional[str] = None              # Название образа
    target_season: Optional[str] = None     # Сезон (summer, winter и т.д.)
    target_weather: Optional[str] = None    # Погода (солнечно, дождь)
    item_ids: List[int]                     # Список ID вещей из гардероба


class OutfitUpdate(BaseModel):
    """
    Схема для ОБНОВЛЕНИЯ информации об образе.
    
    Используется в: PATCH /api/outfits/{outfit_id}
    
    Атрибуты:
        name: Новое название (опционально)
        target_season: Новый сезон (опционально)
        target_weather: Новая погода (опционально)
        is_favorite: Добавить/убрать из избранного (опционально)
    """
    name: Optional[str] = None              # Новое название
    target_season: Optional[str] = None     # Новый сезон
    target_weather: Optional[str] = None    # Новая погода
    is_favorite: Optional[bool] = None      # Флаг избранного


class OutfitAddItems(BaseModel):
    """
    Схема для ДОБАВЛЕНИЯ вещей в существующий образ.
    
    Используется в: POST /api/outfits/{outfit_id}/add-items
    
    Атрибуты:
        item_ids: Список ID вещей для добавления
    """
    item_ids: List[int]                     # Список ID вещей


class OutfitResponse(BaseModel):
    """
    Схема КРАТКОГО ответа об образе (без списка вещей).
    
    Возвращается из: GET /api/outfits/my-outfits
    
    Атрибуты:
        id: ID образа
        owner_id: ID владельца
        name: Название
        is_favorite: Флаг избранного
        created_by_ai: Создан AI или вручную
        target_season, target_weather: Целевые условия
        created_at: Дата создания
    """
    id: int                                 # ID образа
    owner_id: int                           # ID владельца
    name: Optional[str] = None              # Название
    is_favorite: bool                       # Избранное
    created_by_ai: bool                     # Создан AI
    target_season: Optional[str] = None     # Сезон
    target_weather: Optional[str] = None    # Погода
    created_at: datetime                    # Дата создания
    
    class Config:
        from_attributes = True


class OutfitDetailResponse(BaseModel):
    """
    Схема ПОЛНОГО ответа об образе (СО СПИСКОМ ВЕЩЕЙ).
    
    Возвращается из: GET /api/outfits/{outfit_id}
    
    Атрибуты:
        ...все из OutfitResponse...
        items: Список вещей (ClothingItemResponse)
    """
    id: int                                 # ID образа
    owner_id: int                           # ID владельца
    name: Optional[str] = None              # Название
    is_favorite: bool                       # Избранное
    created_by_ai: bool                     # Создан AI
    target_season: Optional[str] = None     # Сезон
    target_weather: Optional[str] = None    # Погода
    created_at: datetime                    # Дата создания
    items: List[ClothingItemResponse]       # Список вещей в образе
    
    class Config:
        from_attributes = True


# =============================================================================
# 📅 КАЛЕНДАРЬ ОБРАЗОВ (Calendar Schemas)
# =============================================================================
class CalendarDayUpdate(BaseModel):
    """
    Схема для обновления образов на дату.
    
    Используется в: PUT /api/calendar/{date}
    
    Атрибуты:
        outfit_ids: Список ID образов на выбранный день
    """
    outfit_ids: List[int] = []


class CalendarDayResponse(BaseModel):
    """
    Схема ответа для одного дня календаря.
    """
    date: date
    outfit_ids: List[int]
