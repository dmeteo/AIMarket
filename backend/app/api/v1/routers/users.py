from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUserResponse
from app.schemas.user import UserProfileResponse
from app.api.v1.deps import get_current_user


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=CurrentUserResponse)
def me(current_user = Depends(get_current_user)) -> CurrentUserResponse:
    pass

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: int) -> UserProfileResponse:
    pass

