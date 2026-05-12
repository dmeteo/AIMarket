from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.auth import LoginRequest, AuthResponse, RegisterRequest, TokenResponse
from app.core.database import get_db
from app.core.security import get_password_hash, create_access_token
from app.repositories.user import create_user
from app.models.user import User
from app.services.auth import authenticate_user, check_unique_email
from app.schemas.user import CurrentUserResponse


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Annotated[Session, Depends(get_db)]) -> AuthResponse:
    if not check_unique_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is busy"
        )
    password_hash = get_password_hash(payload.password)
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=password_hash
    )
    user = create_user(db, user)
    access_token = create_access_token({"sub": user.email})
    return AuthResponse(user=CurrentUserResponse(id=user.id, name=user.name, email=user.email, role=user.role, is_active=user.is_active), 
                        token=TokenResponse(access_token=access_token))
    
    
@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> AuthResponse:
    user = authenticate_user(db, payload.email, payload.password)
    if not user: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token({"sub": user.email})
    return AuthResponse(user=CurrentUserResponse(id=user.id, name=user.name, email=user.email, role=user.role, is_active=user.is_active), 
                        token=TokenResponse(access_token=access_token))
    