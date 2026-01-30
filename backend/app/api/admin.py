from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.services import services
from app.db.mongo import db as mongo_db

# Создаем роутер для админ-панели
router = APIRouter(prefix="/admin", tags=["Admin"])

# Проверка на админа
async def get_current_admin(current_user: models.User = Depends(services.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# =============================================================================
# СТАТИСТИКА
# =============================================================================
@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    # Количество пользователей
    total_users = await db.scalar(select(func.count(models.User.id)))
    
    # Количество вещей
    total_items = await db.scalar(select(func.count(models.ClothingItem.id)))
    
    # Количество образов
    total_outfits = await db.scalar(select(func.count(models.Outfit.id)))
    
    # Логи за последние 24 часа (Mongo)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_logs_count = await mongo_db.audit_logs.count_documents({"timestamp": {"$gte": yesterday}})
    
    return {
        "total_users": total_users,
        "total_items": total_items,
        "total_outfits": total_outfits,
        "recent_logs": recent_logs_count
    }

# =============================================================================
# ПОЛЬЗОВАТЕЛИ
# =============================================================================
@router.get("/users", response_model=List[schemas.UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    result = await db.execute(select(models.User).offset(skip).limit(limit))
    return result.scalars().all()

@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: str = Query(..., regex="^(user|admin|premium)$"),
    db: AsyncSession = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    user = await db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    await db.commit()
    
    # Логируем действие
    await mongo_db.audit_logs.insert_one({
        "user_id": admin.id,
        "username": admin.username,
        "action": "change_role",
        "details": f"Changed user {user.username} role to {role}",
        "timestamp": datetime.utcnow()
    })
    
    return {"message": "Role updated"}

# =============================================================================
# ЛОГИ (MONGODB)
# =============================================================================
@router.get("/logs")
async def get_logs(
    limit: int = 50,
    admin: models.User = Depends(get_current_admin)
):
    cursor = mongo_db.audit_logs.find().sort("timestamp", -1).limit(limit)
    logs = await cursor.to_list(length=limit)
    
    # Преобразуем ObjectId в строку для JSON
    for log in logs:
        log["_id"] = str(log["_id"])
        
    return logs

@router.get("/logs/export")
async def export_logs(
    format: str = Query("json", regex="^(json|csv)$"),
    admin: models.User = Depends(get_current_admin)
):
    cursor = mongo_db.audit_logs.find().sort("timestamp", -1)
    logs = await cursor.to_list(length=1000)
    
    for log in logs:
        log["_id"] = str(log["_id"])
        if "timestamp" in log:
            log["timestamp"] = log["timestamp"].isoformat()
            
    return logs
