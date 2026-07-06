"""
Auth endpoints — registration, login, logout, profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import (
    AuthResponse,
    LoginRequest,
    ProfileResponse,
    RegisterRequest,
    RolesResponse,
    UserPublic,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


# ─── POST /api/v1/auth/register ─────────────────────────────────

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(data: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
        role="user",  # New users are always regular users
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return AuthResponse(
        access_token=token,
        user=UserPublic(
            id=str(user.id),
            email=user.email,
            display_name=user.display_name,
            role=user.role,
        ),
    )


# ─── POST /api/v1/auth/login ────────────────────────────────────

@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login with email and password",
)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return AuthResponse(
        access_token=token,
        user=UserPublic(
            id=str(user.id),
            email=user.email,
            display_name=user.display_name,
            role=user.role,
        ),
    )


# ─── POST /api/v1/auth/logout ───────────────────────────────────

@router.post("/logout", summary="Logout (client-side token removal)")
def logout():
    """Logout is handled client-side by removing the token."""
    return {"message": "Logged out successfully"}


# ─── GET /api/v1/auth/me ────────────────────────────────────────

@router.get("/me", summary="Get current user info")
def get_me(current_user: User = Depends(get_current_user)):
    return UserPublic(
        id=str(current_user.id),
        email=current_user.email,
        display_name=current_user.display_name,
        role=current_user.role,
    )
