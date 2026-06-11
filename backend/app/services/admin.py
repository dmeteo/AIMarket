from sqlalchemy.orm import Session

from app.repositories.admin import get_applications_to_seller
from app.schemas.admin import ApplicationToSellerList, ApplicationsToSellerResponse


def mapping_application(application) -> ApplicationToSellerList:
    mapped_application = ApplicationToSellerList(id=application.id,
                                                 full_name=application.full_name,
                                                 verdict=application.verdict,
                                                 created_at=application.created_at)
    
    return mapped_application


def mapping_applications(applications) -> ApplicationsToSellerResponse:
    mapped_applications = [mapping_application(application) for application in applications]

    return ApplicationsToSellerResponse(applications=mapped_applications)


def get_applications_to_seller_service(db: Session) -> ApplicationsToSellerResponse:
    applications = get_applications_to_seller(db)

    mapped_applications = mapping_applications(applications)

    return mapped_applications


