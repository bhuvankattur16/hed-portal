import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "HED Retrieval API"
    VERSION: str = "1.0.0"
    
    # Path inside the backend directory to store the local vector DB
    CHROMA_DB_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "chroma_db")
    
    # Model used for generating embeddings (runs locally)
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    # Gemini configurations
    GEMINI_API_KEY: str = ""
    
    # SMTP Email Configuration for OTPs
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""
    
    # Twilio SMS Configuration for OTPs
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    # Comma-separated list of registered emails allowed to log in
    ALLOWED_EMAILS: str = "admin@example.com"
    
    # Comma-separated list of emails that have Admin privileges
    ADMIN_EMAILS: str = "bhuvankattur@gmail.com"
    
    # MongoDB Atlas
    MONGODB_URI: str = "mongodb+srv://admin:admin123@cluster0.7lneyev.mongodb.net/?appName=Cluster0"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
