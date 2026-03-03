# =============================================================================
# СЕРВИС ЛИМИТОВ ТАРИФНЫХ ПЛАНОВ (plan_limits.py)
# =============================================================================
# Определяет лимиты генерации образов и доступ к функциям
# в зависимости от тарифного плана пользователя.
# =============================================================================

from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os

# ─── Конфигурация планов ─────────────────────────────────────────────────────
PLAN_LIMITS = {
    "free": {
        "max_outfits": 5,          # Максимум образов за генерацию
        "daily_generations": 10,    # Лимит генераций в день
        "has_stats": False,         # Доступ к статистике
        "label": "Free",
        "label_ru": "Бесплатный",
    },
    "basic": {
        "max_outfits": 8,
        "daily_generations": None,  # Безлимитно
        "has_stats": False,
        "label": "Basic",
        "label_ru": "Базовый",
    },
    "premium": {
        "max_outfits": 10,
        "daily_generations": None,
        "has_stats": True,
        "label": "Premium",
        "label_ru": "Премиум",
    },
}


def get_plan_limits(plan: str) -> dict:
    """Возвращает лимиты для указанного плана."""
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])


def get_max_outfits(plan: str) -> int:
    """Максимальное количество образов за одну генерацию."""
    limits = get_plan_limits(plan)
    return limits["max_outfits"]


# ─── MongoDB счётчик дневных генераций ───────────────────────────────────────

_mongo_client = None

def _get_mongo_db():
    global _mongo_client
    if _mongo_client is None:
        mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        _mongo_client = AsyncIOMotorClient(mongo_url)
    return _mongo_client["wardrobe_ai"]


async def get_daily_generation_count(user_id: int) -> int:
    """Получает количество генераций пользователя за сегодня."""
    db = _get_mongo_db()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    doc = await db.generation_counters.find_one({
        "user_id": user_id,
        "date": today
    })
    
    return doc["count"] if doc else 0


async def increment_generation_count(user_id: int) -> int:
    """Инкрементирует счётчик генераций. Возвращает новое значение."""
    db = _get_mongo_db()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    result = await db.generation_counters.find_one_and_update(
        {"user_id": user_id, "date": today},
        {"$inc": {"count": 1}},
        upsert=True,
        return_document=True
    )
    
    return result["count"]


async def check_generation_allowed(user_id: int, plan: str) -> dict:
    """
    Проверяет, может ли пользователь генерировать образы.
    
    Returns:
        {
            "allowed": bool,
            "remaining": int | None,  # None = безлимитно
            "daily_limit": int | None,
            "used_today": int
        }
    """
    limits = get_plan_limits(plan)
    daily_limit = limits["daily_generations"]
    
    # Безлимитный план (basic/premium)
    if daily_limit is None:
        return {
            "allowed": True,
            "remaining": None,
            "daily_limit": None,
            "used_today": 0
        }
    
    # Free план — проверяем счётчик
    used_today = await get_daily_generation_count(user_id)
    remaining = max(0, daily_limit - used_today)
    
    return {
        "allowed": remaining > 0,
        "remaining": remaining,
        "daily_limit": daily_limit,
        "used_today": used_today
    }


async def get_plan_info(user_id: int, plan: str) -> dict:
    """Полная информация о плане для API /stats/plan."""
    limits = get_plan_limits(plan)
    check = await check_generation_allowed(user_id, plan)
    
    return {
        "current_plan": plan,
        "label": limits["label"],
        "label_ru": limits["label_ru"],
        "max_outfits": limits["max_outfits"],
        "daily_limit": limits["daily_generations"],
        "has_stats": limits["has_stats"],
        "used_today": check["used_today"],
        "remaining_today": check["remaining"],
        "all_plans": {
            name: {
                "label": p["label"],
                "label_ru": p["label_ru"],
                "max_outfits": p["max_outfits"],
                "daily_generations": p["daily_generations"],
                "has_stats": p["has_stats"],
            }
            for name, p in PLAN_LIMITS.items()
        }
    }
