from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# ========== USER SCHEMAS ==========
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    city: str = "Moscow"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    city: str
    created_at: datetime

    class Config:
        from_attributes = True


# ========== CLOTHING SCHEMAS ==========
class ClothingCreate(BaseModel):
    clothing_type: str
    color: str
    material: str
    brand: Optional[str] = None
    season: str

class ClothingResponse(BaseModel):
    id: int
    user_id: int
    image_path: str
    clothing_type: str
    color: str
    material: str
    brand: Optional[str]
    season: str
    created_at: datetime

    class Config:
        from_attributes = True


# ========== OUTFIT SCHEMAS ==========
class OutfitItemResponse(BaseModel):
    clothing_id: int
    clothing: ClothingResponse

    class Config:
        from_attributes = True

class OutfitCreate(BaseModel):
    name: Optional[str] = None
    weather_condition: Optional[str] = None
    temperature: Optional[float] = None

class OutfitResponse(BaseModel):
    id: int
    user_id: int
    name: Optional[str]
    weather_condition: Optional[str]
    temperature: Optional[float]
    rating: float
    items: List[OutfitItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True


# ========== FEEDBACK SCHEMAS ==========
class FeedbackCreate(BaseModel):
    outfit_id: int
    is_liked: bool
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    outfit_id: int
    is_liked: bool
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
