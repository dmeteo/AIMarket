from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.user import UserProfileResponse, CurrentUserResponse
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.core.database import get_db
from app.repositories.user import get_user_by_id


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=CurrentUserResponse)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> CurrentUserResponse:
    return CurrentUserResponse(id=current_user.id, name=current_user.name, email=current_user.email, role=current_user.role, is_active=current_user.is_active)
    


@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(db: Annotated[Session, Depends(get_db)], user_id: int) -> UserProfileResponse:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found")
    return UserProfileResponse(id=user.id, name=user.name, role=user.role)