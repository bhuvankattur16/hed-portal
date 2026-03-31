import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import certifi

async def check_roles():
    uri = "mongodb+srv://admin:admin123@cluster0.7lneyev.mongodb.net/?appName=Cluster0"
    client = AsyncIOMotorClient(uri, tlsCAFile=certifi.where())
    db = client.get_database("hed_retrieval_db")
    
    # Check unique roles in logins collection
    roles = await db.logins.distinct("role")
    print(f"Unique roles in 'logins' collection: {roles}")
    
    # Check counts
    for role in roles:
        count = await db.logins.count_documents({"role": role})
        print(f"Role '{role}': {count} records")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_roles())
