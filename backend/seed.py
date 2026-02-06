import asyncio
from datetime import datetime, timedelta
from pathlib import Path

from sqlalchemy import select, func

from app.db.database import async_session_maker
from app.models import models
from app.services.services import get_password_hash
from app.db.mongo import db as mongo_db


SEED_TAG = "seed_v1"


def _pick_upload_files(limit=8):
    uploads_dir = Path(__file__).resolve().parent / "uploads"
    if not uploads_dir.exists():
        return []
    allowed = {".png", ".jpg", ".jpeg", ".avif"}
    files = [p for p in uploads_dir.iterdir() if p.is_file() and p.suffix.lower() in allowed]
    return files[:limit]


async def seed_users(session):
    users = [
        {
            "username": "demo_anna",
            "email": "anna@wardrobe.ai",
            "full_name": "Anna Mironova",
            "city": "Moscow",
            "role": "user",
        },
        {
            "username": "demo_ivan",
            "email": "ivan@wardrobe.ai",
            "full_name": "Ivan Sokolov",
            "city": "Saint Petersburg",
            "role": "premium",
        },
        {
            "username": "demo_nina",
            "email": "nina@wardrobe.ai",
            "full_name": "Nina Lebedeva",
            "city": "Kazan",
            "role": "user",
        },
        {
            "username": "demo_tim",
            "email": "tim@wardrobe.ai",
            "full_name": "Timofey Orlov",
            "city": "Yekaterinburg",
            "role": "user",
        },
        {
            "username": "demo_olga",
            "email": "olga@wardrobe.ai",
            "full_name": "Olga Smirnova",
            "city": "Novosibirsk",
            "role": "user",
        },
    ]

    existing = await session.execute(
        select(models.User).where(models.User.username.in_([u["username"] for u in users]))
    )
    existing_names = {u.username for u in existing.scalars().all()}

    for idx, user in enumerate(users):
        if user["username"] in existing_names:
            continue
        created_at = datetime.utcnow() - timedelta(days=14 - idx * 2)
        session.add(
            models.User(
                username=user["username"],
                email=user["email"],
                full_name=user["full_name"],
                city=user["city"],
                role=user["role"],
                hashed_password=get_password_hash("password123"),
                created_at=created_at,
            )
        )

    await session.commit()


async def seed_clothing_and_outfits(session):
    users = await session.execute(select(models.User).order_by(models.User.id))
    users = users.scalars().all()
    if not users:
        return

    owner = next((u for u in users if u.username.startswith("demo_")), users[0])

    item_count = await session.scalar(
        select(func.count(models.ClothingItem.id)).where(models.ClothingItem.owner_id == owner.id)
    )
    if item_count and item_count >= 5:
        return

    upload_files = _pick_upload_files(limit=8)
    if not upload_files:
        return

    categories = ["t-shirt", "jeans", "dress", "jacket", "shoes", "skirt", "hoodie", "shirt"]
    colors = ["black", "white", "blue", "red", "green", "beige", "gray", "pink"]
    seasons = ["spring", "summer", "fall", "winter", "all"]

    items = []
    for idx, file_path in enumerate(upload_files[:5]):
        created_at = datetime.utcnow() - timedelta(days=10 - idx)
        item = models.ClothingItem(
            owner_id=owner.id,
            image_path=f"uploads/{file_path.name}",
            filename=file_path.name,
            category=categories[idx % len(categories)],
            color=colors[idx % len(colors)],
            season=seasons[idx % len(seasons)],
            style='["casual"]',
            wear_count=idx,
            is_clean=True,
            created_at=created_at,
        )
        session.add(item)
        items.append(item)

    await session.commit()

    await session.refresh(owner)
    for item in items:
        await session.refresh(item)

    outfit_count = await session.scalar(
        select(func.count(models.Outfit.id)).where(models.Outfit.owner_id == owner.id)
    )
    if outfit_count and outfit_count >= 2:
        return

    outfit_one = models.Outfit(
        owner_id=owner.id,
        name="City Casual",
        created_by_ai=True,
        target_season="spring",
        target_weather="sunny",
        created_at=datetime.utcnow() - timedelta(days=6),
    )
    outfit_two = models.Outfit(
        owner_id=owner.id,
        name="Office Style",
        created_by_ai=False,
        target_season="fall",
        target_weather="chilly",
        created_at=datetime.utcnow() - timedelta(days=2),
    )

    session.add_all([outfit_one, outfit_two])
    await session.commit()

    await session.refresh(outfit_one)
    await session.refresh(outfit_two)

    if items:
        session.add_all(
            [
                models.OutfitItem(outfit_id=outfit_one.id, item_id=items[0].id),
                models.OutfitItem(outfit_id=outfit_one.id, item_id=items[1].id),
                models.OutfitItem(outfit_id=outfit_two.id, item_id=items[2].id),
                models.OutfitItem(outfit_id=outfit_two.id, item_id=items[3].id),
            ]
        )
        await session.commit()


async def seed_audit_logs():
    existing = await mongo_db.audit_logs.count_documents({"seed": SEED_TAG})
    if existing:
        return

    now = datetime.utcnow()
    logs = []
    for i in range(7):
        logs.append(
            {
                "user_id": i + 1,
                "username": f"demo_{i}",
                "action": "login",
                "details": "Seeded login activity",
                "timestamp": now - timedelta(days=i),
                "seed": SEED_TAG,
            }
        )
    logs.append(
        {
            "user_id": 1,
            "username": "admin",
            "action": "change_role",
            "details": "Seeded role update",
            "timestamp": now - timedelta(days=1),
            "seed": SEED_TAG,
        }
    )
    await mongo_db.audit_logs.insert_many(logs)


async def seed_all():
    async with async_session_maker() as session:
        await seed_users(session)
        await seed_clothing_and_outfits(session)
    await seed_audit_logs()


if __name__ == "__main__":
    asyncio.run(seed_all())
