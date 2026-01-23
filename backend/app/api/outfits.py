from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List

from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.services import services

router = APIRouter(prefix="/outfits", tags=["Outfits"])


@router.post("/create", response_model=schemas.OutfitDetailResponse)
async def create_outfit(
    outfit_data: schemas.OutfitCreate,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создать образ вручную (выбрав вещи из гардероба)"""
    
    # Проверяем, что все вещи существуют и принадлежат пользователю
    result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.id.in_(outfit_data.item_ids),
            models.ClothingItem.owner_id == current_user.id
        )
    )
    items = result.scalars().all()
    
    if len(items) != len(outfit_data.item_ids):
        raise HTTPException(
            status_code=400, 
            detail="Some items not found or don't belong to you"
        )
    
    # Создаем образ
    new_outfit = models.Outfit(
        owner_id=current_user.id,
        name=outfit_data.name,
        target_season=outfit_data.target_season,
        target_weather=outfit_data.target_weather,
        created_by_ai=False  # Пользователь создал вручную
    )
    
    db.add(new_outfit)
    await db.commit()
    await db.refresh(new_outfit)
    
    # Связываем вещи с образом
    for item_id in outfit_data.item_ids:
        outfit_item = models.OutfitItem(
            outfit_id=new_outfit.id,
            item_id=item_id
        )
        db.add(outfit_item)
    
    await db.commit()
    
    # Логируем
    log = models.AuditLog(
        user_id=current_user.id, 
        action="create_outfit", 
        details=f"Created outfit: {outfit_data.name or 'Unnamed'}"
    )
    db.add(log)
    await db.commit()
    
    # Возвращаем образ со списком вещей
    await db.refresh(new_outfit)
    return {
        **new_outfit.__dict__,
        "items": items
    }


@router.get("/my-outfits", response_model=List[schemas.OutfitResponse])
async def get_my_outfits(
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить все образы пользователя (краткий список)"""
    result = await db.execute(
        select(models.Outfit).filter(models.Outfit.owner_id == current_user.id)
    )
    outfits = result.scalars().all()
    return outfits


@router.get("/{outfit_id}", response_model=schemas.OutfitDetailResponse)
async def get_outfit_detail(
    outfit_id: int,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить подробную информацию об образе (с вещами)"""
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Получаем вещи этого образа
    result = await db.execute(
        select(models.ClothingItem)
        .join(models.OutfitItem)
        .filter(models.OutfitItem.outfit_id == outfit_id)
    )
    items = result.scalars().all()
    
    return {
        **outfit.__dict__,
        "items": items
    }


@router.patch("/{outfit_id}", response_model=schemas.OutfitResponse)
async def update_outfit(
    outfit_id: int,
    outfit_update: schemas.OutfitUpdate,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Обновить информацию об образе (название, сезон, избранное)"""
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Обновляем только переданные поля
    update_data = outfit_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(outfit, key, value)
    
    await db.commit()
    await db.refresh(outfit)
    return outfit


@router.post("/{outfit_id}/add-items", response_model=schemas.OutfitDetailResponse)
async def add_items_to_outfit(
    outfit_id: int,
    items_data: schemas.OutfitAddItems,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Добавить вещи в существующий образ"""
    # Проверяем образ
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Проверяем вещи
    result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.id.in_(items_data.item_ids),
            models.ClothingItem.owner_id == current_user.id
        )
    )
    items = result.scalars().all()
    
    if len(items) != len(items_data.item_ids):
        raise HTTPException(status_code=400, detail="Some items not found")
    
    # Добавляем связи (игнорируем дубликаты)
    for item_id in items_data.item_ids:
        # Проверяем, нет ли уже такой связи
        result = await db.execute(
            select(models.OutfitItem).filter(
                models.OutfitItem.outfit_id == outfit_id,
                models.OutfitItem.item_id == item_id
            )
        )
        if not result.scalar_one_or_none():
            outfit_item = models.OutfitItem(outfit_id=outfit_id, item_id=item_id)
            db.add(outfit_item)
    
    await db.commit()
    
    # Возвращаем обновленный образ
    result = await db.execute(
        select(models.ClothingItem)
        .join(models.OutfitItem)
        .filter(models.OutfitItem.outfit_id == outfit_id)
    )
    all_items = result.scalars().all()
    
    return {
        **outfit.__dict__,
        "items": all_items
    }


@router.delete("/{outfit_id}/remove-item/{item_id}")
async def remove_item_from_outfit(
    outfit_id: int,
    item_id: int,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить вещь из образа"""
    # Проверяем образ
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Удаляем связь
    await db.execute(
        delete(models.OutfitItem).filter(
            models.OutfitItem.outfit_id == outfit_id,
            models.OutfitItem.item_id == item_id
        )
    )
    await db.commit()
    
    return {"message": "Item removed from outfit"}


@router.delete("/{outfit_id}")
async def delete_outfit(
    outfit_id: int,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить образ полностью"""
    result = await db.execute(
        select(models.Outfit).filter(
            models.Outfit.id == outfit_id,
            models.Outfit.owner_id == current_user.id
        )
    )
    outfit = result.scalar_one_or_none()
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Удаляем связи (каскадно удалятся автоматически, но можно явно)
    await db.execute(
        delete(models.OutfitItem).filter(models.OutfitItem.outfit_id == outfit_id)
    )
    
    await db.delete(outfit)
    await db.commit()
    
    return {"message": "Outfit deleted"}
