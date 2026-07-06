"""
Order endpoints — create orders, list orders, order items.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import (
    OrderCreateRequest,
    OrderItemCreateRequest,
    OrderItemResponse,
    OrderResponse,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


# ─── POST /api/v1/orders ────────────────────────────────────────

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
)
def create_order(
    data: OrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = Order(
        user_id=current_user.id,  # Always use the authenticated user's ID
        total=data.total,
        status=data.status,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return {
        "id": order.id,
        "user_id": order.user_id,
        "total": order.total,
        "status": order.status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


# ─── GET /api/v1/orders ─────────────────────────────────────────

@router.get(
    "",
    response_model=List[OrderResponse],
    summary="List orders (own orders or all for admin)",
)
def list_orders(
    user_id: int | None = Query(None, description="Filter by user ID (admin only)"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Order)

    # Non-admin users can only see their own orders
    if current_user.role != "admin":
        query = query.filter(Order.user_id == current_user.id)
    elif user_id:
        query = query.filter(Order.user_id == user_id)

    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return orders


# ─── POST /api/v1/orders/{order_id}/items ────────────────────────

@router.post(
    "/{order_id}/items",
    status_code=status.HTTP_201_CREATED,
    summary="Add items to an order",
)
def create_order_items(
    order_id: int,
    items: List[OrderItemCreateRequest],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only the order owner or admin can add items
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    created_items = []
    for item_data in items:
        item = OrderItem(
            order_id=order_id,
            product_id=item_data.product_id,
            product_name=item_data.product_name,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
        )
        db.add(item)
        created_items.append(item)

    db.commit()
    return [
        {
            "id": i.id,
            "product_id": i.product_id,
            "product_name": i.product_name,
            "quantity": i.quantity,
            "unit_price": i.unit_price,
        }
        for i in created_items
    ]


# ─── GET /api/v1/orders/{order_id}/items ─────────────────────────

@router.get(
    "/{order_id}/items",
    summary="Get items of an order",
)
def get_order_items(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only the order owner or admin can view items
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    return [
        {
            "id": i.id,
            "product_id": i.product_id,
            "product_name": i.product_name,
            "quantity": i.quantity,
            "unit_price": i.unit_price,
        }
        for i in items
    ]
