"""
Product SQLAlchemy model.
Represents the 'products' table in the database.
"""

from datetime import datetime

from sqlalchemy import DateTime, Float, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    """ORM model for the products table."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    minimum_stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    price: Mapped[float] = mapped_column(Float(precision=2), nullable=False, default=0.0)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationship
    stock_movements: Mapped[list["StockMovement"]] = relationship(
        "StockMovement", back_populates="product", cascade="all, delete-orphan"
    )

    # Indexes for common query patterns
    __table_args__ = (
        Index("ix_products_category_name", "category", "name"),
        Index("ix_products_quantity_minimum", "quantity", "minimum_stock"),
    )

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, name='{self.name}', sku='{self.sku}')>"


# Avoid circular import — import here only for type resolution
from app.models.stock_movement import StockMovement  # noqa: E402, F401
