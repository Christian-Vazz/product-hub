"""
StockMovement SQLAlchemy model.
Represents the 'stock_movements' table in the database.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class StockMovement(Base):
    """ORM model for the stock_movements table."""

    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    movement_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    user_responsible: Mapped[str] = mapped_column(String(255), nullable=False)
    observation: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship
    product: Mapped["Product"] = relationship("Product", back_populates="stock_movements")

    # Indexes
    __table_args__ = (
        Index("ix_stock_movements_type_created", "movement_type", "created_at"),
        Index("ix_stock_movements_product_created", "product_id", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<StockMovement(id={self.id}, product_id={self.product_id}, "
            f"type='{self.movement_type}', qty={self.quantity})>"
        )


from app.models.product import Product  # noqa: E402, F401
