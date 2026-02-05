from fastapi import APIRouter
from .users import router as users_router
from .clothing import router as clothing_router
from .outfits import router as outfits_router
from .calendar import router as calendar_router

# Главный роутер, объединяющий все
api_router = APIRouter()

api_router.include_router(users_router)
api_router.include_router(clothing_router)
api_router.include_router(outfits_router)
api_router.include_router(calendar_router)
