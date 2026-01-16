from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.db.database import Base, engine
from app.models.models import User, Clothing, Outfit, OutfitItem, Feedback
from app.api import users, clothes, outfits, feedback

# Создай таблицы в БД
Base.metadata.create_all(bind=engine)

# Инициализация FastAPI приложения
app = FastAPI(
    title="Wardrobe AI API",
    description="API для приложения 'Гардероб с ИИ'",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Проверка папки uploads
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# Регистрация маршрутов
app.include_router(users.router)
app.include_router(clothes.router)
app.include_router(outfits.router)
app.include_router(feedback.router)

# Корневые маршруты
@app.get("/")
async def root():
    return {
        "message": "Welcome to Wardrobe AI API 👕",
        "status": "Server is running ✅",
        "docs": "http://localhost:8000/docs",
        "version": "0.1.0"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "0.1.0",
        "database": "✅ Connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
