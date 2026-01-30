import asyncio
import os
import sys

# Add the current directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from app.db.database import async_session_maker
from app.models.models import User
from sqlalchemy import select
from app.services.services import verify_password, get_password_hash

async def check_admin():
    print("Connecting to database...")
    async with async_session_maker() as session:
        print("Querying for user 'admin'...")
        result = await session.execute(select(User).filter(User.username == "admin"))
        user = result.scalar_one_or_none()
        
        if not user:
            print("❌ User 'admin' NOT FOUND in database!")
            return

        print(f"✅ User 'admin' found. ID: {user.id}, Email: {user.email}")
        print(f"Stored Hash: {user.hashed_password}")
        
        is_valid = verify_password("admin", user.hashed_password)
        print(f"Password 'admin' validation result: {is_valid}")
        
        if not is_valid:
            print("⚠️ Password mismatch! Resetting password to 'admin'...")
            new_hash = get_password_hash("admin")
            user.hashed_password = new_hash
            await session.commit()
            print("✅ Password reset to 'admin'. Try logging in again.")

if __name__ == "__main__":
    asyncio.run(check_admin())
