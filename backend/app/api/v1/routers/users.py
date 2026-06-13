from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import ApplicationToBeSellerCreateRequest, ApplicationToBeSellerCreateResponse, ApplicationToBeSellerResponse, UserProfileResponse, CurrentUserResponse
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.core.database import get_db
from app.services.user import create_application_to_be_seller_service, get_application_to_be_seller_service, get_user_profile_service


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=CurrentUserResponse, description="[Buyer User]",)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> CurrentUserResponse:
    return CurrentUserResponse(id=current_user.id, name=current_user.name, email=current_user.email, role=current_user.role, is_active=current_user.is_active)
    

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(db: Annotated[Session, Depends(get_db)], user_id: int) -> UserProfileResponse:
    user = get_user_profile_service(db, user_id)

    return user                                  


@router.post("/seller_application", response_model=ApplicationToBeSellerCreateResponse, description="[Buyer User]",)
def create_application_to_be_seller(
    db: Annotated[Session, Depends(get_db)], 
    current_user: Annotated[User, Depends(get_current_user)],
    payload: ApplicationToBeSellerCreateRequest
) -> ApplicationToBeSellerCreateResponse:
    application_id = create_application_to_be_seller_service(db, current_user, payload)

    return application_id


@router.get("/me/seller_application", response_model=ApplicationToBeSellerResponse, description="[Buyer User]")
def get_application_to_be_seller(
    db: Annotated[Session, Depends(get_db)], 
    current_user: Annotated[User, Depends(get_current_user)]
) -> ApplicationToBeSellerResponse:
    application = get_application_to_be_seller_service(db, current_user)
    
    return application