"""
Admin endpoints — system stats and activity logs.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.auth import require_admin
from app.core.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get(
    "/stats",
    summary="Get system statistics (admin only)",
)
def get_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users_count = db.query(func.count(User.id)).scalar() or 0
    products_count = db.query(func.count(Product.id)).scalar() or 0
    orders_count = db.query(func.count(Order.id)).scalar() or 0
    revenue = db.query(func.sum(Order.total)).scalar() or 0.0

    low_stock = (
        db.query(func.count(Product.id))
        .filter(Product.quantity <= Product.minimum_stock)
        .scalar()
        or 0
    )

    return {
        "users": users_count,
        "products": products_count,
        "orders": orders_count,
        "revenue": float(revenue),
        "low_stock": low_stock,
    }
