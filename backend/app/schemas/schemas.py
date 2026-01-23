from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# === User Schemas ===

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    city: Optional[str] = "Moscow"

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    city: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# === Clothing Schemas ===

class ClothingItemCreate(BaseModel):
    category: Optional[str] = None
    color: Optional[str] = None
    season: Optional[str] = None
    style: Optional[str] = None

class ClothingItemResponse(BaseModel):
    id: int
    owner_id: int
    filename: str
    image_path: str
    category: Optional[str] = None
    color: Optional[str] = None
    season: Optional[str] = None
    style: Optional[str] = None
    wear_count: int
    is_clean: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# === Outfit Schemas ===

class OutfitCreate(BaseModel):
    """Создание образа с выбором вещей"""
    name: Optional[str] = None
    target_season: Optional[str] = None
    target_weather: Optional[str] = None
    item_ids: List[int]  

class OutfitUpdate(BaseModel):
    """Обновление образа (название, сезон, погода)"""
    name: Optional[str] = None
    target_season: Optional[str] = None
    target_weather: Optional[str] = None
    is_favorite: Optional[bool] = None

class OutfitAddItems(BaseModel):
    """Добавление вещей в существующий образ"""
    item_ids: List[int]

class OutfitResponse(BaseModel):
    """Краткая информация об образе (без списка вещей)"""
    id: int
    owner_id: int
    name: Optional[str] = None
    is_favorite: bool
    created_by_ai: bool
    target_season: Optional[str] = None
    target_weather: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class OutfitDetailResponse(BaseModel):
    """Полная информация об образе (СО СПИСКОМ ВЕЩЕЙ)"""
    id: int
    owner_id: int
    name: Optional[str] = None
    is_favorite: bool
    created_by_ai: bool
    target_season: Optional[str] = None
    target_weather: Optional[str] = None
    created_at: datetime
    items: List[ClothingItemResponse]  
    
    class Config:
        from_attributes = True
