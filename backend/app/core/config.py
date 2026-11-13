from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # System & App Environment
    APP_NAME: str = "FlameSafe AI"
    APP_VERSION: str = "0.1.0"
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

    # AI & LLM Provider Configuration (mock | gemini | openai | anthropic)
    AI_PROVIDER: str = "mock"
    AI_MODEL_NAME: str = "gemini-1.5-pro"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # Embedding Provider Configuration (mock | gemini | openai)
    EMBEDDING_PROVIDER: str = "mock"
    EMBEDDING_MODEL_NAME: str = "text-embedding-004"
    EMBEDDING_DIMENSION: int = 768
    VECTOR_TOP_K: int = 5
    SIMILARITY_THRESHOLD: float = 0.65

    # Data Ingestion Sources
    NASA_PSI_BASE_URL: str = "https://psi.nasa.gov/physci/repo"
    NASA_NTRS_BASE_URL: str = "https://ntrs.nasa.gov/api/citations"
    SEED_DATA_DIR: str = "../data/seed"
    PROCESSED_DATA_DIR: str = "../data/processed"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
