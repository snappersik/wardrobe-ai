from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, Clothing
from app.schemas.schemas import ClothingResponse, ClothingCreate
import shutil
import os
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/clothes", tags=["clothes"])

# Директория для загрузки файлов
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


# ========== GET ENDPOINTS ==========

@router.get("/", response_model=list[ClothingResponse])
async def get_all_clothes(user_id: int, db: Session = Depends(get_db)):
    """Получить всю одежду пользователя"""
    clothes = db.query(Clothing).filter(Clothing.user_id == user_id).all()
    if not clothes:
        raise HTTPException(status_code=404, detail="No clothes found for this user")
    return clothes


@router.get("/{clothing_id}", response_model=ClothingResponse)
async def get_clothing(clothing_id: int, db: Session = Depends(get_db)):
    """Получить одежду по ID"""
    clothing = db.query(Clothing).filter(Clothing.id == clothing_id).first()
    if not clothing:
        raise HTTPException(status_code=404, detail="Clothing not found")
    return clothing


@router.get("/user/{user_id}/by-type", response_model=list[ClothingResponse])
async def get_clothes_by_type(user_id: int, clothing_type: str, db: Session = Depends(get_db)):
    """Получить одежду определённого типа (top, pants, shoes, jacket)"""
    clothes = db.query(Clothing).filter(
        Clothing.user_id == user_id,
        Clothing.clothing_type == clothing_type
    ).all()
    if not clothes:
        raise HTTPException(status_code=404, detail=f"No {clothing_type} found")
    return clothes


# ========== POST ENDPOINTS ==========

@router.post("/upload", response_model=ClothingResponse)
async def upload_clothing(
        user_id: int,
        clothing_type: str,
        color: str,
        material: str,
        season: str,
        brand: str = None,
        file: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    """Загрузить фото одежды"""

    # Проверка пользователя
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Проверка формата файла
    allowed_extensions = {"jpg", "jpeg", "png", "webp"}
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename")

    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {allowed_extensions}"
        )

    try:
        # Создаём уникальное имя файла
        file_id = str(uuid.uuid4())
        new_filename = f"{file_id}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, new_filename)

        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Создаём запись в БД
        clothing = Clothing(
            user_id=user_id,
            image_path=file_path,
            clothing_type=clothing_type.lower(),
            color=color,
            material=material,
            brand=brand,
            season=season.lower()
        )

        db.add(clothing)
        db.commit()
        db.refresh(clothing)

        return clothing

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")


# ========== PUT ENDPOINTS ==========

@router.put("/{clothing_id}", response_model=ClothingResponse)
async def update_clothing(
        clothing_id: int,
        clothing_type: str = None,
        color: str = None,
        material: str = None,
        brand: str = None,
        season: str = None,
        db: Session = Depends(get_db)
):
    """Обновить информацию об одежде"""
    clothing = db.query(Clothing).filter(Clothing.id == clothing_id).first()
    if not clothing:
        raise HTTPException(status_code=404, detail="Clothing not found")

    if clothing_type:
        clothing.clothing_type = clothing_type.lower()
    if color:
        clothing.color = color
    if material:
        clothing.material = material
    if brand:
        clothing.brand = brand
    if season:
        clothing.season = season.lower()

    db.commit()
    db.refresh(clothing)
    return clothing


# ========== DELETE ENDPOINTS ==========

@router.delete("/{clothing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clothing(clothing_id: int, db: Session = Depends(get_db)):
    """Удалить одежду"""
    clothing = db.query(Clothing).filter(Clothing.id == clothing_id).first()
    if not clothing:
        raise HTTPException(status_code=404, detail="Clothing not found")

    # Удали файл с диска
    if os.path.exists(clothing.image_path):
        os.remove(clothing.image_path)

    # Удали из БД
    db.delete(clothing)
    db.commit()
