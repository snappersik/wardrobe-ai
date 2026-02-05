from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from datetime import datetime, timedelta, date

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
# АНАЛИТИКА ДЛЯ DASHBOARD
# =============================================================================
def _get_range_bounds(range_key: str) -> tuple[date, date, int]:
    today = date.today()
    if range_key == "today":
        return today, today, 1
    if range_key == "30days":
        start = today - timedelta(days=29)
        return start, today, 30
    if range_key == "year":
        start = today - timedelta(days=364)
        return start, today, 365
    # default: 7 days
    start = today - timedelta(days=6)
    return start, today, 7


def _percent_change(current: int, previous: int) -> float:
    if previous == 0:
        return 0.0 if current == 0 else 100.0
    return ((current - previous) / previous) * 100.0


def _fill_series(start_date: date, days: int, counts_map: dict[date, int]) -> list[dict]:
    series = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        series.append({
            "date": day.isoformat(),
            "value": counts_map.get(day, 0)
        })
    return series


def _normalize_date(value) -> date | None:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, datetime):
        return value.date()
    try:
        return datetime.fromisoformat(str(value)).date()
    except Exception:
        return None


@router.get("/analytics")
async def get_admin_analytics(
    range: str = "7days",
    db: AsyncSession = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    """
    Возвращает аналитику для админ-дашборда.
    """
    start_date, end_date, days = _get_range_bounds(range)
    prev_end = start_date - timedelta(days=1)
    prev_start = prev_end - timedelta(days=days - 1)

    start_dt = datetime.combine(start_date, datetime.min.time())
    end_dt = datetime.combine(end_date, datetime.max.time())
    prev_start_dt = datetime.combine(prev_start, datetime.min.time())
    prev_end_dt = datetime.combine(prev_end, datetime.max.time())

    # Total users
    total_users = await db.scalar(select(func.count(models.User.id)))
    new_users_current = await db.scalar(
        select(func.count(models.User.id)).filter(
            models.User.created_at >= start_dt,
            models.User.created_at <= end_dt
        )
    )
    new_users_prev = await db.scalar(
        select(func.count(models.User.id)).filter(
            models.User.created_at >= prev_start_dt,
            models.User.created_at <= prev_end_dt
        )
    )

    # Active users (based on audit logs in Mongo)
    try:
        active_users_current = len(await mongo_db.audit_logs.distinct(
            "user_id",
            {"timestamp": {"$gte": start_dt, "$lte": end_dt}}
        ))
        active_users_prev = len(await mongo_db.audit_logs.distinct(
            "user_id",
            {"timestamp": {"$gte": prev_start_dt, "$lte": prev_end_dt}}
        ))
    except Exception:
        active_users_current = 0
        active_users_prev = 0

    # Outfits created
    outfits_current = await db.scalar(
        select(func.count(models.Outfit.id)).filter(
            models.Outfit.created_at >= start_dt,
            models.Outfit.created_at <= end_dt
        )
    )
    outfits_prev = await db.scalar(
        select(func.count(models.Outfit.id)).filter(
            models.Outfit.created_at >= prev_start_dt,
            models.Outfit.created_at <= prev_end_dt
        )
    )

    # Items uploaded
    items_current = await db.scalar(
        select(func.count(models.ClothingItem.id)).filter(
            models.ClothingItem.created_at >= start_dt,
            models.ClothingItem.created_at <= end_dt
        )
    )
    items_prev = await db.scalar(
        select(func.count(models.ClothingItem.id)).filter(
            models.ClothingItem.created_at >= prev_start_dt,
            models.ClothingItem.created_at <= prev_end_dt
        )
    )

    # Series: registrations per day
    reg_rows = await db.execute(
        select(func.date(models.User.created_at), func.count(models.User.id))
        .filter(models.User.created_at >= start_dt, models.User.created_at <= end_dt)
        .group_by(func.date(models.User.created_at))
    )
    reg_counts = {}
    for row in reg_rows.all():
        day = _normalize_date(row[0])
        if day:
            reg_counts[day] = row[1]

    # Series: generator activity (AI outfits) per day
    gen_rows = await db.execute(
        select(func.date(models.Outfit.created_at), func.count(models.Outfit.id))
        .filter(
            models.Outfit.created_at >= start_dt,
            models.Outfit.created_at <= end_dt,
            models.Outfit.created_by_ai == True
        )
        .group_by(func.date(models.Outfit.created_at))
    )
    gen_counts = {}
    for row in gen_rows.all():
        day = _normalize_date(row[0])
        if day:
            gen_counts[day] = row[1]

    return {
        "range": range,
        "metrics": {
            "total_users": {
                "value": total_users,
                "change": _percent_change(new_users_current or 0, new_users_prev or 0),
                "trend": "up" if (new_users_current or 0) >= (new_users_prev or 0) else "down"
            },
            "active_users": {
                "value": active_users_current,
                "change": _percent_change(active_users_current, active_users_prev),
                "trend": "up" if active_users_current >= active_users_prev else "down"
            },
            "created_outfits": {
                "value": outfits_current or 0,
                "change": _percent_change(outfits_current or 0, outfits_prev or 0),
                "trend": "up" if (outfits_current or 0) >= (outfits_prev or 0) else "down"
            },
            "uploaded_items": {
                "value": items_current or 0,
                "change": _percent_change(items_current or 0, items_prev or 0),
                "trend": "up" if (items_current or 0) >= (items_prev or 0) else "down"
            }
        },
        "series": {
            "registrations": _fill_series(start_date, days, reg_counts),
            "generator_activity": _fill_series(start_date, days, gen_counts)
        }
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
