"""
Stock Service — business logic for stock movements.
Handles ENTRY, EXIT, and ADJUSTMENT operations with validation.
"""

import math
from typing import Optional
from datetime import date

import structlog
from sqlalchemy.orm import Session

from app.core.exceptions import (
    BusinessRuleException,
    InsufficientStockException,
    NotFoundException,
)
from app.models.stock_movement import StockMovement
from app.repositories.product_repository import ProductRepository
from app.repositories.stock_movement_repository import StockMovementRepository
from app.schemas.stock_movement import (
    StockMovementCreate,
    StockMovementListResponse,
    StockMovementResponse,
)

logger = structlog.get_logger(__name__)


class StockService:
    """Service layer for stock movement business logic."""

    def __init__(self, db: Session) -> None:
        self._db = db
        self._movement_repo = StockMovementRepository(db)
        self._product_repo = ProductRepository(db)

    def create_movement(self, data: StockMovementCreate) -> StockMovementResponse:
        """
        Create a stock movement and update the product quantity.

        Rules:
        - ENTRY  → increases product quantity
        - EXIT   → decreases product quantity (cannot go negative)
        - ADJUSTMENT → sets quantity based on the movement (can be negative delta)
        """
        product = self._product_repo.get_by_id(data.product_id)
        if not product:
            raise NotFoundException("Product", data.product_id)

        # ─── Apply Business Rules ────────────────────────────
        if data.movement_type == "ENTRY":
            product.quantity += data.quantity

        elif data.movement_type == "EXIT":
            if product.quantity < data.quantity:
                raise InsufficientStockException(
                    product_name=product.name,
                    available=product.quantity,
                    requested=data.quantity,
                )
            product.quantity -= data.quantity

        elif data.movement_type == "ADJUSTMENT":
            # For adjustments, the quantity field represents the new absolute quantity
            if data.quantity < 0:
                raise BusinessRuleException(
                    "Adjustment quantity must be a positive value representing the corrected stock level"
                )
            product.quantity = data.quantity

        # ─── Persist ────────────────────────────────────────
        movement = StockMovement(
            product_id=data.product_id,
            movement_type=data.movement_type,
            quantity=data.quantity,
            user_responsible=data.user_responsible,
            observation=data.observation,
        )

        # Update product first, then create movement
        self._product_repo.update(product)
        created = self._movement_repo.create(movement)

        logger.info(
            "Stock movement created",
            movement_id=created.id,
            product_id=product.id,
            type=data.movement_type,
            quantity=data.quantity,
            new_stock=product.quantity,
        )

        return self._to_response(created, product_name=product.name)

    def get_movement(self, movement_id: int) -> StockMovementResponse:
        """Retrieve a single movement by ID."""
        movement = self._movement_repo.get_by_id(movement_id)
        if not movement:
            raise NotFoundException("StockMovement", movement_id)

        product_name = movement.product.name if movement.product else None
        return self._to_response(movement, product_name=product_name)

    def list_movements(
        self,
        *,
        page: int = 1,
        size: int = 20,
        product_id: Optional[int] = None,
        movement_type: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        sort_order: str = "desc",
    ) -> StockMovementListResponse:
        """List movements with pagination and filters."""
        items, total = self._movement_repo.get_all(
            page=page,
            size=size,
            product_id=product_id,
            movement_type=movement_type,
            date_from=date_from,
            date_to=date_to,
            sort_order=sort_order,
        )
        total_pages = math.ceil(total / size) if total > 0 else 1

        return StockMovementListResponse(
            items=[
                self._to_response(m, product_name=m.product.name if m.product else None)
                for m in items
            ],
            total=total,
            page=page,
            size=size,
            pages=total_pages,
        )

    @staticmethod
    def _to_response(
        movement: StockMovement, *, product_name: Optional[str] = None
    ) -> StockMovementResponse:
        """Convert a StockMovement ORM model to a response schema."""
        return StockMovementResponse(
            id=movement.id,
            product_id=movement.product_id,
            movement_type=movement.movement_type,
            quantity=movement.quantity,
            user_responsible=movement.user_responsible,
            observation=movement.observation,
            created_at=movement.created_at,
            product_name=product_name,
        )
