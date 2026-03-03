# =============================================================================
# API СТАТИСТИКИ ГАРДЕРОБА (stats.py)
# =============================================================================
# Эндпоинты для статистики и информации о тарифном плане.
# /stats/plan — доступно всем (информация о текущем плане и лимитах)
# /stats/overview — только Premium (полная статистика гардероба)
# /stats/usage — только Premium (частота использования вещей)
# =============================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, distinct

from ..db.database import get_db
from ..models import models
from ..services import services
from ..services.plan_limits import get_plan_info, get_plan_limits

import json
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/stats", tags=["stats"])


# =============================================================================
# ЭНДПОИНТ: ИНФОРМАЦИЯ О ПЛАНЕ (доступно всем)
# =============================================================================
@router.get("/plan")
async def get_current_plan(
    current_user: models.User = Depends(services.get_current_user),
):
    """
    Возвращает информацию о текущем плане и лимитах.
    Используется генератором для показа оставшихся генераций.
    """
    plan = current_user.subscription_plan or "free"
    return await get_plan_info(current_user.id, plan)


# =============================================================================
# ЭНДПОИНТ: ОБЗОР ГАРДЕРОБА (только Premium)
# =============================================================================
@router.get("/overview")
async def get_wardrobe_overview(
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Полная статистика гардероба (только для Premium).
    Включает: общие числа, распределение по категориям/цветам/стилям,
    забытые вещи, стоимость гардероба.
    """
    plan = current_user.subscription_plan or "free"
    if not get_plan_limits(plan)["has_stats"]:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Статистика доступна только для Premium",
                "current_plan": plan,
                "required_plan": "premium"
            }
        )

    # ─── Общие числа ─────────────────────────────────────────────────────
    items_result = await db.execute(
        select(models.ClothingItem).filter(
            models.ClothingItem.owner_id == current_user.id
        )
    )
    all_items = items_result.scalars().all()

    outfits_count = await db.execute(
        select(func.count(models.Outfit.id)).filter(
            models.Outfit.owner_id == current_user.id
        )
    )
    total_outfits = outfits_count.scalar() or 0

    # ─── Распределение по категориям ─────────────────────────────────────
    category_counts = {}
    color_counts = {}
    style_counts = {}
    total_price = 0.0
    items_with_price = 0

    for item in all_items:
        # Категории
        cat = item.category or "unknown"
        category_counts[cat] = category_counts.get(cat, 0) + 1

        # Цвета
        color = item.color or "unknown"
        color_counts[color] = color_counts.get(color, 0) + 1

        # Стили (JSON массив)
        try:
            styles = json.loads(item.style) if item.style else []
        except (json.JSONDecodeError, TypeError):
            styles = [item.style] if item.style else []
        for s in styles:
            style_counts[s] = style_counts.get(s, 0) + 1

        # Стоимость
        if item.price is not None:
            total_price += item.price
            items_with_price += 1

    # ─── Топ-5 самых используемых вещей ──────────────────────────────────
    top_items_result = await db.execute(
        select(
            models.ClothingItem.id,
            models.ClothingItem.name,
            models.ClothingItem.filename,
            models.ClothingItem.image_path,
            models.ClothingItem.category,
            models.ClothingItem.color,
            func.count(models.OutfitItem.id).label("outfit_count")
        )
        .join(models.OutfitItem, models.ClothingItem.id == models.OutfitItem.item_id, isouter=True)
        .filter(models.ClothingItem.owner_id == current_user.id)
        .group_by(models.ClothingItem.id)
        .order_by(func.count(models.OutfitItem.id).desc())
        .limit(5)
    )
    top_items = [
        {
            "id": row.id,
            "name": row.name or row.filename,
            "image_path": row.image_path,
            "category": row.category,
            "color": row.color,
            "outfit_count": row.outfit_count
        }
        for row in top_items_result
    ]

    # ─── Забытые вещи (не в образах или не ношены >30 дней) ──────────────
    threshold_date = datetime.now(timezone.utc) - timedelta(days=30)

    forgotten_result = await db.execute(
        select(
            models.ClothingItem.id,
            models.ClothingItem.name,
            models.ClothingItem.filename,
            models.ClothingItem.image_path,
            models.ClothingItem.category,
            models.ClothingItem.color,
            models.ClothingItem.last_worn,
            models.ClothingItem.created_at,
            func.count(models.OutfitItem.id).label("outfit_count")
        )
        .join(models.OutfitItem, models.ClothingItem.id == models.OutfitItem.item_id, isouter=True)
        .filter(models.ClothingItem.owner_id == current_user.id)
        .group_by(models.ClothingItem.id)
        .having(func.count(models.OutfitItem.id) == 0)
        .order_by(models.ClothingItem.created_at.asc())
        .limit(10)
    )
    forgotten_items = [
        {
            "id": row.id,
            "name": row.name or row.filename,
            "image_path": row.image_path,
            "category": row.category,
            "color": row.color,
            "last_worn": row.last_worn.isoformat() if row.last_worn else None,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in forgotten_result
    ]

    return {
        "total_items": len(all_items),
        "total_outfits": total_outfits,
        "total_price": round(total_price, 2),
        "items_with_price": items_with_price,
        "categories": category_counts,
        "colors": color_counts,
        "styles": style_counts,
        "top_items": top_items,
        "forgotten_items": forgotten_items,
    }


# =============================================================================
# ЭНДПОИНТ: ЧАСТОТА ИСПОЛЬЗОВАНИЯ ВЕЩЕЙ (только Premium)
# =============================================================================
@router.get("/usage")
async def get_item_usage(
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Частота использования каждой вещи в образах."""
    plan = current_user.subscription_plan or "free"
    if not get_plan_limits(plan)["has_stats"]:
        raise HTTPException(
            status_code=403,
            detail={
                "message": "Статистика доступна только для Premium",
                "current_plan": plan,
                "required_plan": "premium"
            }
        )

    result = await db.execute(
        select(
            models.ClothingItem.id,
            models.ClothingItem.name,
            models.ClothingItem.filename,
            models.ClothingItem.image_path,
            models.ClothingItem.category,
            models.ClothingItem.color,
            models.ClothingItem.wear_count,
            models.ClothingItem.last_worn,
            func.count(models.OutfitItem.id).label("outfit_count")
        )
        .join(models.OutfitItem, models.ClothingItem.id == models.OutfitItem.item_id, isouter=True)
        .filter(models.ClothingItem.owner_id == current_user.id)
        .group_by(models.ClothingItem.id)
        .order_by(func.count(models.OutfitItem.id).desc())
    )

    items = [
        {
            "id": row.id,
            "name": row.name or row.filename,
            "image_path": row.image_path,
            "category": row.category,
            "color": row.color,
            "wear_count": row.wear_count,
            "last_worn": row.last_worn.isoformat() if row.last_worn else None,
            "outfit_count": row.outfit_count,
        }
        for row in result
    ]

    return {"items": items}
