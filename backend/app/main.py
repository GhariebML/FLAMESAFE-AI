from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import logger
from app.core.database import init_db, AsyncSessionLocal
from app.core.exceptions import FlameSafeException
from app.api.v1.router import api_v1_router
from app.schemas.common import APIErrorResponse, ErrorDetail


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.ENVIRONMENT})")
    await init_db()

    # Automatically check and seed database if empty
    from scripts.seed_data import seed_database_if_empty
    async with AsyncSessionLocal() as session:
        await seed_database_if_empty(session)

    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "FlameSafe AI: AI-Powered Scientific Research & Fire Safety Intelligence Platform "
        "transforming NASA microgravity combustion research into structured, searchable, "
        "comparable, and explainable scientific knowledge."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


# Exception Handlers
@app.exception_handler(FlameSafeException)
async def flamesafe_exception_handler(request: Request, exc: FlameSafeException):
    return JSONResponse(
        status_code=exc.status_code,
        content=APIErrorResponse(
            success=False,
            error=ErrorDetail(
                code=exc.error_code,
                message=exc.detail,
                details=exc.extra,
            ),
        ).model_dump(mode="json"),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIErrorResponse(
            success=False,
            error=ErrorDetail(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected server error occurred. Please check server logs.",
                details={"path": request.url.path},
            ),
        ).model_dump(mode="json"),
    )


@app.get("/", include_in_schema=False)
async def root_redirect():
    return {
        "message": "FlameSafe AI Backend API is online",
        "documentation": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }
