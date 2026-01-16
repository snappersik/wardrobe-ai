from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Outfit, OutfitItem, Clothing, User
from app.schemas.schemas import OutfitCreate, OutfitResponse
from typing import List
import random

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


# ========== GET ENDPOINTS ==========

@router.get("/user/{user_id}", response_model=List[OutfitResponse])
async def get_user_outfits(user_id: int, db: Session = Depends(get_db)):
    """Получить все образы пользователя"""
    outfits = db.query(Outfit).filter(Outfit.user_id == user_id).all()
    if not outfits:
        raise HTTPException(status_code=404, detail="No outfits found")
    return outfits


@router.get("/{outfit_id}", response_model=OutfitResponse)
async def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    """Получить образ по ID"""
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return outfit


# ========== POST ENDPOINTS ==========

@router.post("/generate", response_model=OutfitResponse)
async def generate_outfit(
        user_id: int,
        weather_condition: str = None,
        temperature: float = None,
        db: Session = Depends(get_db)
):
    """Генерировать случайный образ из одежды пользователя"""

    # Проверяем пользователя
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Получаем одежду пользователя по типам
    tops = db.query(Clothing).filter(
        Clothing.user_id == user_id,
        Clothing.clothing_type.in_(["top", "shirt", "tshirt"])
    ).all()

    bottoms = db.query(Clothing).filter(
        Clothing.user_id == user_id,
        Clothing.clothing_type.in_(["pants", "skirt", "shorts"])
    ).all()

    shoes = db.query(Clothing).filter(
        Clothing.user_id == user_id,
        Clothing.clothing_type == "shoes"
    ).all()

    # Проверяем что у пользователя есть одежда
    if not tops or not bottoms or not shoes:
        raise HTTPException(
            status_code=400,
            detail="Not enough clothes to generate outfit. Upload at least: top, bottoms, shoes"
        )

    # Случайная генерация
    selected_top = random.choice(tops)
    selected_bottom = random.choice(bottoms)
    selected_shoes = random.choice(shoes)

    # Создаём новый образ
    outfit = Outfit(
        user_id=user_id,
        name=f"Outfit #{random.randint(1000, 9999)}",
        weather_condition=weather_condition,
        temperature=temperature
    )

    db.add(outfit)
    db.flush()  # Чтобы получить outfit.id

    # Добавляем предметы в образ
    outfit_items = [
        OutfitItem(outfit_id=outfit.id, clothing_id=selected_top.id),
        OutfitItem(outfit_id=outfit.id, clothing_id=selected_bottom.id),
        OutfitItem(outfit_id=outfit.id, clothing_id=selected_shoes.id),
    ]

    db.add_all(outfit_items)
    db.commit()
    db.refresh(outfit)

    return outfit


@router.post("/", response_model=OutfitResponse)
async def create_outfit(
        user_id: int,
        clothing_ids: List[int],
        outfit_data: OutfitCreate,
        db: Session = Depends(get_db)
):
    """Создать образ вручную из выбранной одежды"""

    # Проверяем пользователя
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Проверяем что все вещи существуют и принадлежат пользователю
    clothes = db.query(Clothing).filter(Clothing.id.in_(clothing_ids)).all()
    if len(clothes) != len(clothing_ids):
        raise HTTPException(status_code=400, detail="Some clothes not found")

    for cloth in clothes:
        if cloth.user_id != user_id:
            raise HTTPException(status_code=403, detail="Clothing does not belong to user")

    # Создаём образ
    outfit = Outfit(
        user_id=user_id,
        name=outfit_data.name,
        weather_condition=outfit_data.weather_condition,
        temperature=outfit_data.temperature
    )

    db.add(outfit)
    db.flush()

    # Добавляем предметы
    outfit_items = [
        OutfitItem(outfit_id=outfit.id, clothing_id=cloth_id)
        for cloth_id in clothing_ids
    ]
    db.add_all(outfit_items)
    db.commit()
    db.refresh(outfit)

    return outfit


# ========== DELETE ENDPOINTS ==========

@router.delete("/{outfit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
    """Удалить образ"""
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")

    db.delete(outfit)
    db.commit()
