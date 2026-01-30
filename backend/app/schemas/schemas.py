# =============================================================================
# PYDANTIC СХЕМЫ (schemas.py)
# =============================================================================
# Схемы определяют структуру данных для:
# - Валидации входящих запросов (Request validation)
# - Сериализации ответов API (Response serialization)
# - Автоматической документации Swagger/OpenAPI
# =============================================================================

# Pydantic - библиотека для валидации данных
from pydantic import BaseModel, EmailStr

# Типизация для опциональных полей и списков
from typing import Optional, List

# Работа с датами
from datetime import datetime


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
        city: Город (по умолчанию Moscow)
    """
    username: str                           # Логин пользователя
    email: EmailStr                         # Email с валидацией формата
    password: str                           # Пароль (хешируется в сервисе)
    full_name: Optional[str] = None         # Полное имя (опционально)
    city: Optional[str] = "Moscow"          # Город по умолчанию


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
    role: str                               # Роль (user, admin, premium)
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
    
    Примечание: Сам файл изображения передаётся отдельно через FormData.
    
    Атрибуты:
        category: Категория (t-shirt, jeans, dress, shoes)
        color: Цвет (red, blue, black, white)
        season: Сезон (summer, winter, spring, fall, all)
        style: Стиль (casual, formal, sport, vintage)
    """
    category: Optional[str] = None          # Категория одежды
    color: Optional[str] = None             # Цвет
    season: Optional[str] = None            # Сезон
    style: Optional[str] = None             # Стиль


class ClothingItemResponse(BaseModel):
    """
    Схема ОТВЕТА с данными вещи.
    
    Возвращается из: GET /api/clothing/my-items, POST /api/clothing/upload
    
    Атрибуты:
        id: ID вещи
        owner_id: ID владельца
        filename: Имя файла
        image_path: Путь к изображению
        category, color, season, style: Характеристики
        wear_count: Сколько раз надевали
        is_clean: Чистая или в стирке
        created_at: Дата добавления
    """
    id: int                                 # ID вещи
    owner_id: int                           # ID владельца
    filename: str                           # Оригинальное имя файла
    image_path: str                         # Путь к изображению на сервере
    category: Optional[str] = None          # Категория
    color: Optional[str] = None             # Цвет
    season: Optional[str] = None            # Сезон
    style: Optional[str] = None             # Стиль
    wear_count: int                         # Счётчик ношений
    is_clean: bool                          # Флаг чистоты
    created_at: datetime                    # Дата добавления
    
    class Config:
        # Поддержка SQLAlchemy ORM моделей
        from_attributes = True


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
