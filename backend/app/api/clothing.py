from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import uuid
import shutil

from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.services import services

router = APIRouter(prefix="/clothing", tags=["Clothing"])

@router.post("/upload", response_model=schemas.ClothingItemResponse)
async def upload_item(
    file: UploadFile = File(...),
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Загрузка фото одежды"""
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = f"{upload_dir}/{unique_filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # TODO: YOLO распознавание
    new_item = models.ClothingItem(
        owner_id=current_user.id,
        filename=file.filename,
        image_path=file_path,
        category="unknown",
        color="unknown"
    )
    
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    
    log = models.AuditLog(user_id=current_user.id, action="upload_item", details=f"Uploaded {file.filename}")
    db.add(log)
    await db.commit()
    
    return new_item

@router.get("/my-items", response_model=list[schemas.ClothingItemResponse])
async def get_my_items(
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить все вещи пользователя"""
    result = await db.execute(
        select(models.ClothingItem).filter(models.ClothingItem.owner_id == current_user.id)
    )
    return result.scalars().all()

@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить вещь"""
    result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.id == item_id,
            models.ClothingItem.owner_id == current_user.id
        )
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Удаляем файл
    if os.path.exists(item.image_path):
        os.remove(item.image_path)
    
    await db.delete(item)
    await db.commit()
    
    return {"message": "Item deleted"}
