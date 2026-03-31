from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    try:
        if not settings.MONGODB_URI:
            logger.warning("MONGODB_URI is not set. Chat History will not be persisted.")
            return
            
        import certifi
        logger.info("Connecting to MongoDB Atlas...")
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI, 
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        db_instance.db = db_instance.client.get_database("hed_retrieval_db")
        
        # Ping the database to confirm connection
        await db_instance.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB Atlas!")
    except Exception as e:
        logger.error(f"Could not connect to MongoDB Atlas: {e}")

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB Atlas connection closed.")

def get_db():
    return db_instance.db
