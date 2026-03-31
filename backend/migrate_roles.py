import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

async def migrate_roles():
    uri = "mongodb+srv://admin:admin123@cluster0.7lneyev.mongodb.net/?appName=Cluster0"
    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(uri, tlsCAFile=certifi.where())
    db = client.get_database("hed_retrieval_db")
    
    print("Updating 'logins' collection...")
    result = await db.logins.update_many(
        {"role": "official"},
        {"$set": {"role": "user"}}
    )
    
    print(f"Successfully updated {result.modified_count} records in 'logins' collection.")
    
    # Check if there are any other collections with roles
    # The routes.py only mentions 'logins' for role storage
    
    client.close()
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate_roles())
