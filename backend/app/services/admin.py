from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.common.exceptions import application_not_found
from app.repositories.admin import create_seller, get_application_to_seller, get_applications_to_seller
from app.schemas.admin import ApplicationToSellerList, ApplicationToSellerResponse, ApplicationsToSellerResponse, VerdictForApplicationToSellerResponse
from app.common.enums import VerdictApplicationToBeSeller
from app.models.user import Seller


def mapping_application_for_list(application) -> ApplicationToSellerList:
    mapped_application = ApplicationToSellerList(id=application.id,
                                                 full_name=application.full_name,
                                                 verdict=application.verdict,
                                                 created_at=application.created_at)
    
    return mapped_application


def mapping_applications(applications) -> ApplicationsToSellerResponse:
    mapped_applications = [mapping_application_for_list(application) for application in applications]

    return ApplicationsToSellerResponse(applications=mapped_applications)


def mapping_application(application):
    mapped_application = ApplicationToSellerResponse(application)

    return mapped_application


def get_applications_to_seller_service(db: Session) -> ApplicationsToSellerResponse:
    applications = get_applications_to_seller(db)

    mapped_applications = mapping_applications(applications)

    return mapped_applications


def get_application_to_seller_service(db: Session, application_id):
    application = get_application_to_seller(db, application_id)
    if not application:
        raise application_not_found()

    mapped_application = mapping_application(application)

    return mapped_application


def verdict_for_application_to_seller_service(db: Session, application_id, payload):
    application = get_application_to_seller(db, application_id)
    if not application:
        raise application_not_found()
    
    if payload.verdict == VerdictApplicationToBeSeller.APPROVE.value:
        seller = create_seller(db, Seller(
                    user_id=application.user_id,
                    full_name=application.full_name,
                    email=application.email,
                    phone=application.phone,
                    person_type=application.person_type,
                    inn=application.inn,
                    ogrn=application.ogrn,
                    address=application.address,
                    bic=application.bic,
                    checking_account=application.checking_account
                    )
                )
        application.verdict = payload.verdict
    else:
        application.verdict = payload.verdict
        application.description = payload.description
    
    db.commit()

    return VerdictForApplicationToSellerResponse(application_id=application.id)