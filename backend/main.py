from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.api import users, clothing, outfits
from app.db.database import engine
from app.models.models import Base

app = FastAPI(
    title="Wardrobe AI API",
    description="AI-powered wardrobe management system",
    version="1.0.0"
)

# CORS для React-фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роуты из каждого модуля
app.include_router(users.router, prefix="/api")
app.include_router(clothing.router, prefix="/api")
app.include_router(outfits.router, prefix="/api")

# Раздача статики (загруженные фото)
from fastapi.staticfiles import StaticFiles
import os
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Wardrobe AI Backend is running!"}

# Для разработки:
# @app.on_event("startup")
# async def startup():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
