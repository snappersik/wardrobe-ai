# =============================================================================
# МОДУЛЬ ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ (database.py)
# =============================================================================
# Этот модуль настраивает асинхронное подключение к PostgreSQL.
# Используется SQLAlchemy с асинхронным драйвером asyncpg.
# =============================================================================

# Импорт компонентов SQLAlchemy для асинхронной работы
from sqlalchemy.ext.asyncio import (
    AsyncSession,           # Асинхронная сессия для работы с БД
    async_sessionmaker,     # Фабрика для создания сессий
    create_async_engine     # Создание асинхронного движка
)

# Базовый класс для моделей SQLAlchemy (ORM)
from sqlalchemy.ext.declarative import declarative_base

# Типизация для генераторов (используется в get_db)
from typing import AsyncGenerator

# Pydantic Settings для загрузки переменных окружения из .env
from pydantic_settings import BaseSettings

# =============================================================================
# БАЗОВЫЙ КЛАСС ДЛЯ ВСЕХ МОДЕЛЕЙ
# =============================================================================
# Все модели (User, ClothingItem и т.д.) наследуются от Base.
# Это позволяет SQLAlchemy отслеживать все таблицы.
Base = declarative_base()

# =============================================================================
# КЛАСС НАСТРОЕК (ЗАГРУЗКА ИЗ .env)
# =============================================================================
# Pydantic автоматически загружает переменные из .env файла.
# Если переменная не найдена - используется значение по умолчанию.
class Settings(BaseSettings):
    """Настройки приложения, загружаемые из переменных окружения (.env)"""
    
    # URL подключения к базе данных PostgreSQL
    # Формат: postgresql+asyncpg://user:password@host:port/database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:12345@localhost:4242/wardrobe_ai"
    
    # Секретный ключ для подписи JWT токенов (хеширование)
    # ВАЖНО: Замените в продакшене на безопасный случайный ключ!
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    
    # Алгоритм шифрования JWT токенов
    ALGORITHM: str = "HS256"
    
    # Время жизни токена доступа в минутах
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Режим отладки (True = подробные ошибки)
    DEBUG: bool = True
    
    # Путь для сохранения загруженных изображений одежды
    UPLOADS_PATH: str = "./uploads"
    
    # API ключ для OpenWeather (погода для AI-рекомендаций)
    OPENWEATHER_API_KEY: str = "your_openweather_key"

    # MongoDB connection URL
    MONGO_URL: str = "mongodb://localhost:27017"
    
    class Config:
        # Указываем файл с переменными окружения
        env_file = ".env"
        extra = "ignore"  # Игнорировать лишние поля в .env

# =============================================================================
# СОЗДАНИЕ ДВИЖКА БАЗЫ ДАННЫХ (ENGINE)
# =============================================================================
# Engine - это точка подключения к базе данных.
# echo=True - выводить SQL-запросы в консоль (для отладки)
settings = Settings()
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
engine = create_async_engine(
    settings.DATABASE_URL,  # URL с asyncpg драйвером
    echo=True  # Логирование SQL запросов
)

# =============================================================================
# ФАБРИКА СЕССИЙ (SESSION MAKER)
# =============================================================================
# Сессия - это "рабочее пространство" для операций с БД.
# expire_on_commit=False - объекты не "протухают" после commit
async_session_maker = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# =============================================================================
# ЗАВИСИМОСТЬ ДЛЯ ПОЛУЧЕНИЯ СЕССИИ (DEPENDENCY INJECTION)
# =============================================================================
# Эта функция используется как зависимость в FastAPI эндпоинтах.
# Она создаёт сессию, передаёт её в эндпоинт, и закрывает после.
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость FastAPI для получения сессии базы данных.
    
    Использование в эндпоинте:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    
    Yields:
        AsyncSession: Асинхронная сессия для работы с БД
    """
    async with async_session_maker() as session:
        yield session

# =============================================================================
# ФУНКЦИЯ СОЗДАНИЯ ТАБЛИЦ
# =============================================================================
# Создаёт все таблицы в базе данных на основе моделей.
# В продакшене лучше использовать Alembic миграции.
async def create_tables():
    """
    Создание всех таблиц в базе данных.
    Используется для начальной инициализации БД.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
