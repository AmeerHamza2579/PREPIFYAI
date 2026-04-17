import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# Always load .env from app/ folder (works no matter where server is run from)
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# Ensure env is in os.environ for GROQ etc. (in case Settings is created before main's load_dotenv)
try:
    from dotenv import load_dotenv
    load_dotenv(_ENV_PATH)
except Exception:
    pass

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_ENV_PATH))

    PROJECT_NAME: str = "PrepifyAI"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Embedding Storage
    USE_PGVECTOR: bool = True

    # Security
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # File Storage
    UPLOAD_DIR: str
    MAX_FILE_SIZE: int

    # OCR Settings
    TESSERACT_PATH: str
    POPPLER_PATH: Optional[str] = None

    # Optional: subject list / read-only aggregates cache (see app.core.redis_cache)
    REDIS_URL: Optional[str] = None

    # Optional: Groq API for LLM question generation (POST .../questions/generate-questions/)
    GROQ_API_KEY: Optional[str] = None
    # Faster default: llama-3.1-8b-instant. For higher quality (slower): llama-3.3-70b-versatile
    GROQ_QUESTION_MODEL: str = "llama-3.1-8b-instant"

    # Seed past_papers / past_papers_questions from repo JSON on server start (idempotent).
    # Set PAST_PAPERS_JSON_AUTOLOAD=false in app/.env to disable.
    PAST_PAPERS_JSON_AUTOLOAD: bool = True

    # When true, AI-generated questions start as ``pending`` until an admin approves them.
    REQUIRE_GENERATED_QUESTION_APPROVAL: bool = False

    # When true, JSON error responses may include DB/exception hints (never enable in production).
    DEBUG_API: bool = False

    # Default admin bootstrap (dev convenience).
    # If the admin user is missing (or has the wrong role/password), the server will create/update it.
    ADMIN_EMAIL: str = "admin@prepifyai.com"
    ADMIN_PASSWORD: str = "admin123"
    ENSURE_DEFAULT_ADMIN: bool = True

settings = Settings()

