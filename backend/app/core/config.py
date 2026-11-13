from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # System & App Environment
    APP_NAME: str = "FlameSafe AI"
    APP_VERSION: str = "0.2.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # API Host & Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database Settings (PostgreSQL with pgvector)
    POSTGRES_USER: str = "flamesafe"
    POSTGRES_PASSWORD: str = "flamesafe_dev_secret"
    POSTGRES_DB: str = "flamesafe_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "postgresql+asyncpg://flamesafe:flamesafe_dev_secret@localhost:5432/flamesafe_db"

    # Fallback to SQLite for standalone local testing without Docker
    USE_SQLITE_FALLBACK: bool = True
    SQLITE_DATABASE_URL: str = "sqlite+aiosqlite:///./flamesafe_dev.db"

    # AI & LLM Provider Configuration (mock | gemini | openai)
    # Uses current official non-deprecated Gemini models when GEMINI_API_KEY is configured.
    AI_PROVIDER: str = "mock"
    AI_MODEL_NAME: str = "gemini-2.5-flash"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # Embedding Provider Configuration (mock | gemini | openai)
    EMBEDDING_PROVIDER: str = "mock"
    EMBEDDING_MODEL_NAME: str = "gemini-embedding-001"
    EMBEDDING_DIMENSION: int = 768
    VECTOR_TOP_K: int = 5
    SIMILARITY_THRESHOLD: float = 0.65

    # Data Ingestion & NASA PSI / NTRS Sources
    NASA_PSI_BASE_URL: str = "https://psi.nasa.gov/physci/repo"
    NASA_NTRS_BASE_URL: str = "https://ntrs.nasa.gov/api/citations"
    SEED_DATA_DIR: str = "../data/seed"
    PROCESSED_DATA_DIR: str = "../data/processed"

    # Download Governance Policy (Priority 4):
    # FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES (default 25 MB) is a configurable FlameSafe application
    # safety policy to prevent automated worker memory/disk exhaustion.
    # It is NOT an official NASA PSI limit. NASA PSI's own documented large-download workflow
    # applies to requests exceeding 1 GB (NASA_PSI_BULK_EMAIL_THRESHOLD_BYTES), which are
    # delivered via prepared download links sent by email.
    FLAMESAFE_AUTO_ACQUISITION_MAX_BYTES: int = 25 * 1024 * 1024
    NASA_PSI_BULK_EMAIL_THRESHOLD_BYTES: int = 1024 * 1024 * 1024

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
