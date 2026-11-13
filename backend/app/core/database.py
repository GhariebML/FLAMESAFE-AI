import importlib.util
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings
from app.core.logging import logger
from app.models.base import Base

# Determine initial database URL
db_url = settings.DATABASE_URL
if settings.USE_SQLITE_FALLBACK and importlib.util.find_spec("asyncpg") is None:
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


def _switch_to_sqlite_fallback() -> None:
    """Rebind engine and session factory to SQLite when PostgreSQL is unreachable in dev."""
    global engine, AsyncSessionLocal, db_url
    db_url = settings.SQLITE_DATABASE_URL
    engine = create_async_engine(db_url, echo=False, future=True)
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
    """Initialize database tables for development/testing with automatic SQLite fallback."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database schemas verified / initialized ({db_url.split('://')[0]}).")
    except Exception as e:
        if settings.USE_SQLITE_FALLBACK and "sqlite" not in db_url:
            logger.warning(
                f"PostgreSQL unreachable ({e}); falling back to local SQLite ({settings.SQLITE_DATABASE_URL})."
            )
            _switch_to_sqlite_fallback()
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("SQLite fallback database schemas initialized.")
        else:
            logger.error(f"Database initialization failed: {e}")
            raise
