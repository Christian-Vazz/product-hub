"""
Application configuration module.
Centralizes all environment-based settings using pydantic-settings.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ─── Application ─────────────────────────────────────────
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    APP_TITLE: str = "Smart Inventory Hub API"
    APP_VERSION: str = "1.0.0"

    # ─── Database ────────────────────────────────────────────
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "usbw"
    DB_NAME: str = "smart_inventory"

    # ─── Security ────────────────────────────────────────────
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # ─── CORS ────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ─── Default Admin User ──────────────────────────────────
    DEFAULT_ADMIN_EMAIL: str = "admin@nexusstock.com"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"

    # ─── Logging ─────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    @property
    def DATABASE_URL(self) -> str:
        """Build the MySQL connection string."""
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            "?charset=utf8mb4"
        )

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance (singleton)."""
    return Settings()
