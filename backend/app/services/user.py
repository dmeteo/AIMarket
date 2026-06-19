from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import ApplicationToSeller, User
from app.repositories.user import create_application_to_be_seller, get_application_to_be_seller, get_applications_to_be_seller, get_user_by_email, get_user_by_id
from app.schemas.user import ApplicationToBeSellerCreateRequest, ApplicationToBeSellerCreateResponse, ApplicationToBeSellerSummaryResponse, UserProfileResponse, ApplicationToBeSellerResponse, ApplicationsToBeSellerResponse
from app.common.enums import VerdictApplicationToBeSeller

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


def create_application_to_be_seller_service(db: Session, user: User, payload: ApplicationToBeSellerCreateRequest):
    applications = get_applications_to_be_seller(db, user.id)
    if any(a.verdict == VerdictApplicationToBeSeller.PENDING.value for a in applications):
        raise HTTPException(status_code=409, detail="You have application on pending")

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
    
    return ApplicationToBeSellerCreateResponse(application_id=application_id)


def mapping_application_summary(applications: list[ApplicationToSeller]):
    mapped_application = [ApplicationToBeSellerSummaryResponse(application_id=application.id,
                                                               verdict=application.verdict,
                                                               created_at=application.created_at) for application in applications]
    
    return mapped_application


def get_applications_to_be_seller_service(db: Session, user: User):
    applications = get_applications_to_be_seller(db, user.id)
    
    return ApplicationsToBeSellerResponse(applications=mapping_application_summary(applications))


def get_application_to_be_seller_service(db: Session, user: User, application_id):
    application = get_application_to_be_seller(db, user.id, application_id)
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    return ApplicationToBeSellerResponse(
        full_name=application.full_name,
        email=application.email,
        phone=application.phone,
        description=application.description,
        person_type=application.person_type,
        inn=application.inn,
        ogrn=application.ogrn,
        address=application.address,
        bic=application.bic,
        checking_account=application.checking_account,
        verdict=application.verdict,
        rejection_reason=application.rejection_reason,
        created_at=application.created_at
    )