from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import date, datetime, timedelta

from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.services import services

router = APIRouter(prefix="/calendar", tags=["Calendar"])


def _month_bounds(target: date) -> tuple[date, date]:
    first_day = target.replace(day=1)
    if first_day.month == 12:
        next_month = first_day.replace(year=first_day.year + 1, month=1)
    else:
        next_month = first_day.replace(month=first_day.month + 1)
    last_day = next_month - timedelta(days=1)
    return first_day, last_day


def _date_from_str(value: str | None) -> date | None:
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


@router.get("")
async def get_calendar(
    start: str | None = None,
    end: str | None = None,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить календарь пользователя за период.
    Если период не задан — возвращает текущий месяц.
    """
    try:
        start_date = _date_from_str(start)
        end_date = _date_from_str(end)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if not start_date or not end_date:
        today = date.today()
        start_date, end_date = _month_bounds(today)

    query = select(models.CalendarOutfit).filter(
        models.CalendarOutfit.user_id == current_user.id,
        models.CalendarOutfit.date >= start_date,
        models.CalendarOutfit.date <= end_date
    )

    result = await db.execute(query)
    rows = result.scalars().all()

    calendar_map: dict[str, list[int]] = {}
    for entry in rows:
        key = entry.date.isoformat()
        calendar_map.setdefault(key, []).append(entry.outfit_id)

    return {
        "start": start_date.isoformat(),
        "end": end_date.isoformat(),
        "calendar": calendar_map
    }


@router.put("/{day}", response_model=schemas.CalendarDayResponse)
async def set_calendar_day(
    day: date,
    payload: schemas.CalendarDayUpdate,
    current_user: models.User = Depends(services.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Установить список образов на дату (полная замена).
    """
    if day > date.today():
        raise HTTPException(status_code=400, detail="Cannot set outfits for future dates")
    outfit_ids = payload.outfit_ids or []
    outfit_ids = list(dict.fromkeys(outfit_ids))

    if outfit_ids:
        result = await db.execute(
            select(models.Outfit.id).filter(
                models.Outfit.id.in_(outfit_ids),
                models.Outfit.owner_id == current_user.id
            )
        )
        found = set(result.scalars().all())
        if found != set(outfit_ids):
            raise HTTPException(status_code=400, detail="Some outfits not found or don't belong to you")

    await db.execute(
        delete(models.CalendarOutfit).filter(
            models.CalendarOutfit.user_id == current_user.id,
            models.CalendarOutfit.date == day
        )
    )

    for outfit_id in outfit_ids:
        db.add(models.CalendarOutfit(
            user_id=current_user.id,
            outfit_id=outfit_id,
            date=day
        ))

    await db.commit()

    return {
        "date": day,
        "outfit_ids": outfit_ids
    }
