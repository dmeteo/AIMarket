from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import ApplicationToSeller, User
from app.repositories.user import create_application_to_be_seller, get_user_by_email, get_user_by_id
from app.schemas.user import ApplicationToBeSellerRequest, ApplicationToBeSellerResponse, UserProfileResponse


def get_user_profile_service(db: Session, user_id):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found")
    return UserProfileResponse(id=user.id, name=user.name, role=user.role)


def check_unique_email(db, email):
    user = get_user_by_email(db, email)
    if user:
        return False
    return True


def create_application_to_be_seller_service(db: Session, user: User, payload: ApplicationToBeSellerRequest):
    application = ApplicationToSeller(
        user_id=user.id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone, 
        description=payload.description, 
        person_type=payload.person_type,
        inn=payload.inn,
        ogrn=payload.ogrn,
        address=payload.address,
        bic=payload.bic,
        checking_account=payload.checking_account
    )

    application_id = create_application_to_be_seller(db, application)
    
    return ApplicationToBeSellerResponse(application_id=application_id)