"""
StockMovement Repository — data access layer for stock movements.
"""

from datetime import date, datetime, timedelta, timezone
from typing import Optional, Sequence

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.stock_movement import StockMovement
from app.utils.enums import MovementType


class StockMovementRepository:
    """Repository for StockMovement queries."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def create(self, movement: StockMovement) -> StockMovement:
        """Persist a new stock movement."""
        self._db.add(movement)
        self._db.commit()
        self._db.refresh(movement)
        return movement

    def get_by_id(self, movement_id: int) -> Optional[StockMovement]:
        """Retrieve a movement by ID, eagerly loading the product."""
        stmt = (
            select(StockMovement)
            .options(joinedload(StockMovement.product))
            .where(StockMovement.id == movement_id)
        )
        return self._db.execute(stmt).scalar_one_or_none()

    def get_all(
        self,
        *,
        page: int = 1,
        size: int = 20,
        product_id: Optional[int] = None,
        movement_type: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        sort_order: str = "desc",
    ) -> tuple[Sequence[StockMovement], int]:
        """
        List movements with pagination and filters.
        Returns (items, total_count).
        """
        stmt = select(StockMovement).options(joinedload(StockMovement.product))
        count_stmt = select(func.count()).select_from(StockMovement)

        # Filters
        if product_id:
            stmt = stmt.where(StockMovement.product_id == product_id)
            count_stmt = count_stmt.where(StockMovement.product_id == product_id)

        if movement_type:
            stmt = stmt.where(StockMovement.movement_type == movement_type)
            count_stmt = count_stmt.where(StockMovement.movement_type == movement_type)

        if date_from:
            stmt = stmt.where(StockMovement.created_at >= datetime.combine(date_from, datetime.min.time()))
            count_stmt = count_stmt.where(
                StockMovement.created_at >= datetime.combine(date_from, datetime.min.time())
            )

        if date_to:
            stmt = stmt.where(
                StockMovement.created_at <= datetime.combine(date_to, datetime.max.time())
            )
            count_stmt = count_stmt.where(
                StockMovement.created_at <= datetime.combine(date_to, datetime.max.time())
            )

        # Sorting
        if sort_order.lower() == "asc":
            stmt = stmt.order_by(StockMovement.created_at.asc())
        else:
            stmt = stmt.order_by(StockMovement.created_at.desc())

        total = self._db.execute(count_stmt).scalar() or 0

        offset = (page - 1) * size
        stmt = stmt.offset(offset).limit(size)

        items = self._db.execute(stmt).unique().scalars().all()
        return items, total

    def count_by_type(self, movement_type: MovementType) -> int:
        """Count movements of a specific type."""
        stmt = (
            select(func.count())
            .select_from(StockMovement)
            .where(StockMovement.movement_type == movement_type.value)
        )
        return self._db.execute(stmt).scalar() or 0

    def get_movements_by_period(
        self,
        days: int = 30,
    ) -> list[dict]:
        """
        Aggregate movements by date for the given period.
        Returns a list of dicts: {date, entries, exits, adjustments}.
        """
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        # Use SQL date extraction for grouping
        date_col = func.date(StockMovement.created_at)

        stmt = (
            select(
                date_col.label("movement_date"),
                func.sum(
                    case(
                        (StockMovement.movement_type == MovementType.ENTRY.value, StockMovement.quantity),
                        else_=0
                    )
                ).label("entries"),
                func.sum(
                    case(
                        (StockMovement.movement_type == MovementType.EXIT.value, StockMovement.quantity),
                        else_=0
                    )
                ).label("exits"),
                func.sum(
                    case(
                        (StockMovement.movement_type == MovementType.ADJUSTMENT.value, StockMovement.quantity),
                        else_=0
                    )
                ).label("adjustments"),
            )
            .where(StockMovement.created_at >= start_date)
            .group_by(date_col)
            .order_by(date_col.asc())
        )

        rows = self._db.execute(stmt).all()
        return [
            {
                "date": str(row.movement_date),
                "entries": int(row.entries or 0),
                "exits": int(row.exits or 0),
                "adjustments": int(row.adjustments or 0),
            }
            for row in rows
        ]
