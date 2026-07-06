"""
Smart Inventory Hub — FastAPI Application Entry Point.

Sets up the application, middleware, exception handlers,
and includes all API routers.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.core.security import hash_password

logger = structlog.get_logger(__name__)
settings = get_settings()


def _seed_default_admin() -> None:
    """Create the default admin user if it doesn't exist."""
    from app.models.user import User

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if not existing:
            admin = User(
                email=settings.DEFAULT_ADMIN_EMAIL,
                password_hash=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
                display_name="Administrador",
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
            logger.info(
                "Default admin created",
                email=settings.DEFAULT_ADMIN_EMAIL,
            )
        else:
            logger.info("Default admin already exists", email=settings.DEFAULT_ADMIN_EMAIL)
    except Exception as e:
        db.rollback()
        logger.warning("Could not seed default admin", error=str(e))
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan — runs on startup and shutdown."""
    # Startup
    setup_logging()
    logger.info(
        "Starting Smart Inventory Hub API",
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
    )

    # Import all models so they are registered with Base
    from app.models.user import User  # noqa: F401
    from app.models.product import Product  # noqa: F401
    from app.models.stock_movement import StockMovement  # noqa: F401
    from app.models.order import Order, OrderItem  # noqa: F401

    # Create tables if they don't exist (development convenience)
    if settings.APP_ENV == "development":
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables ensured (development mode)")
        except Exception as e:
            logger.warning(
                "Could not auto-create tables (database may not be available)",
                error=str(e),
            )

    # Seed default admin
    try:
        _seed_default_admin()
    except Exception as e:
        logger.warning("Could not seed default admin", error=str(e))

    yield

    # Shutdown
    logger.info("Shutting down Smart Inventory Hub API")


def create_app() -> FastAPI:
    """Application factory — builds and configures the FastAPI app."""

    application = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description=(
            "Smart Inventory Hub — A robust, scalable REST API for intelligent "
            "inventory management. Features include product CRUD, stock movement "
            "tracking, dashboard analytics, low-stock alerts, user authentication, "
            "and role-based access control (Admin / User)."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ─── CORS Middleware ────────────────────────────────────
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ─── Exception Handlers ────────────────────────────────
    register_exception_handlers(application)

    # ─── Routers ───────────────────────────────────────────
    application.include_router(api_router)

    # ─── Health Check ──────────────────────────────────────
    @application.get(
        "/health",
        tags=["Health"],
        summary="Health check",
        description="Returns the application health status.",
    )
    def health_check() -> dict:
        return {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
        }

    return application


# Create the app instance
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.APP_HOST, port=settings.APP_PORT, reload=settings.APP_ENV == "development")
