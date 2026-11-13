from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings
from app.core.logging import logger
from app.models.base import Base

# Determine database URL
db_url = settings.DATABASE_URL
if settings.USE_SQLITE_FALLBACK:
    try:
        import asyncpg  # check if driver is available
    except ImportError:
        logger.info("asyncpg not installed in current environment; switching to SQLite fallback.")
        db_url = settings.SQLITE_DATABASE_URL

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    pool_pre_ping=True if "postgresql" in db_url else False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session rollback triggered by exception: {e}")
            raise
        finally:
            await session.close()

async def init_db() -> None:
    """Initialize database tables for development/testing."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schemas verified / initialized.")
    except Exception as e:
        logger.warning(
            f"Database initialization encountered an issue (may use SQLite fallback): {e}"
        )
