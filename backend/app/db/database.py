from sqlalchemy.ext.asyncio import (
    AsyncSession, 
    async_sessionmaker, 
    create_async_engine
)
from sqlalchemy.ext.declarative import declarative_base
from typing import AsyncGenerator
from pydantic_settings import BaseSettings

Base = declarative_base()

class Settings(BaseSettings):
    """Настройки базы данных из .env"""
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:4242/wardrobe_ai"
    
    class Config:
        env_file = "../../.env"  # Относительно backend/app/db/

# Создаем engine
settings = Settings()
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
engine = create_async_engine(
    settings.DATABASE_URL,  # теперь с +asyncpg
    echo=True
)

# Фабрика сессий
async_session_maker = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Зависимость для FastAPI — дает сессию БД в эндпоинты"""
    async with async_session_maker() as session:
        yield session

# Функция для создания таблиц (используется в main.py)
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
