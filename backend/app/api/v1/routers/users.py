from fastapi import APIRouter

from app.schemas.auth import CurrentUserResponse
from app.schemas.user import UserProfileResponse


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=CurrentUserResponse)
def get_user_profile_me() -> CurrentUserResponse:
    pass

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_another_user_profile(user_id: int) -> UserProfileResponse:
    pass