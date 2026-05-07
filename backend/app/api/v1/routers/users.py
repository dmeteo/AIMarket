from fastapi import APIRouter

from app.schemas.auth import CurrentUserResponse
from app.schemas.user import UserProfileResponse


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: int) -> UserProfileResponse:
    pass