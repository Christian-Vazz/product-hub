"""
User endpoints — profile, roles check, and admin user management.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import (
    AdminUserUpdate,
    ProfileResponse,
    RolesResponse,
    UserResponse,
)

router = APIRouter(prefix="/users", tags=["Users"])


# ─── GET /api/v1/users/{user_id}/profile ─────────────────────────

@router.get(
    "/{user_id}/profile",
    response_model=ProfileResponse,
    summary="Get user profile",
)
def get_profile(user_id: int, db: Session = Depends(get_db)) -> ProfileResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return ProfileResponse(
        display_name=user.display_name,
        avatar_url=None,
        role=user.role,
    )


# ─── GET /api/v1/users/{user_id}/roles ───────────────────────────

@router.get(
    "/{user_id}/roles",
    response_model=RolesResponse,
    summary="Check if user is admin",
)
def get_roles(user_id: int, db: Session = Depends(get_db)) -> RolesResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return RolesResponse(is_admin=False)
    return RolesResponse(is_admin=user.role == "admin")


# ─── Admin: GET /api/v1/users ────────────────────────────────────

@router.get(
    "",
    response_model=List[UserResponse],
    summary="List all users (admin only)",
)
def list_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> List[UserResponse]:
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]


# ─── Admin: PUT /api/v1/users/{user_id} ─────────────────────────

@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update a user (admin only)",
)
def update_user(
    user_id: int,
    data: AdminUserUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


# ─── Admin: DELETE /api/v1/users/{user_id} ───────────────────────

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user (admin only)",
)
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admin from deleting themselves
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    db.delete(user)
    db.commit()
