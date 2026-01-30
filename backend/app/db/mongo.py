from motor.motor_asyncio import AsyncIOMotorClient
import os

# Получаем URL подключения из переменных окружения
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# Создаем клиент
client = AsyncIOMotorClient(MONGO_URL)

# Выбираем базу данных
db = client.wardrobe_logs

async def get_mongo_db():
    """
    Dependency for getting MongoDB database instance.
    """
    return db
