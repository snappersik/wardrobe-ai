import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
from app.models import models
# from app.core.config import settings

# Load .env manually
from dotenv import load_dotenv
load_dotenv(os.path.join(os.getcwd(), '.env'))

DB_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost/wardrobe_db")
if not DB_URL.startswith("postgresql+asyncpg"):
    DB_URL = DB_URL.replace("postgresql://", "postgresql+asyncpg://")

async def check_db():
    print(f"Connecting to {DB_URL}...")
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check users
        result = await session.execute(select(models.User))
        users = result.scalars().all()
        print(f"Users found: {len(users)}")
        for u in users:
            print(f" - User {u.id}: {u.username} ({u.subscription_plan})")

        # Check items
        result = await session.execute(select(models.ClothingItem))
        items = result.scalars().all()
        print(f"Clothing items found: {len(items)}")
        
        valid_images = 0
        missing_images = 0
        null_images = 0
        
        for item in items:
            if not item.image_path:
                null_images += 1
                continue
                
            # Check if file exists
            full_path = os.path.join("uploads", item.image_path)
            if os.path.exists(full_path):
                valid_images += 1
            else:
                missing_images += 1
                print(f"MISSING FILE: ID {item.id} - {item.image_path}")

        print(f"\nStats:")
        print(f" - Total Items: {len(items)}")
        print(f" - Valid Images: {valid_images}")
        print(f" - Missing Files: {missing_images}")
        print(f" - Null Paths: {null_images}")
        
        # Check columns
        try:
            # Check if price column exists by trying to select it
            await session.execute(text("SELECT price FROM clothing_items LIMIT 1"))
            print("Column 'price' EXISTS.")
        except Exception as e:
            print(f"Column 'price' ERROR: {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_db())
