from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.admin import get_applications_to_seller_service, verdict_for_application_to_seller_service
from app.core.database import get_db
from app.api.v1.deps import require_admin
from app.models.user import User
from app.schemas.admin import ApplicationsToSellerResponse, ApplicationToSellerResponse, VerdictForApplicationToSellerRequest, VerdictForApplicationToSellerResponse

router = APIRouter(prefix="/admin", tags=["admin [ADMIN only]"])


@router.get("/applications_to_seller", response_model=ApplicationsToSellerResponse)
def get_applications_to_seller(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)]
) -> ApplicationsToSellerResponse:
    applications = get_applications_to_seller_service(db)

    return applications


@router.get("/applications_to_seller/{application_id}", response_model=ApplicationToSellerResponse)
def get_application_to_seller(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
    application_id: int
) -> ApplicationToSellerResponse:
    application = get_application_to_seller(db, application_id)

    return application


@router.patch("/applications_to_seller/{application_id}", response_model=VerdictForApplicationToSellerResponse)
def verdict_for_application_to_seller(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
    application_id: int,
    payload: VerdictForApplicationToSellerRequest,
) -> VerdictForApplicationToSellerResponse:
    application_id = verdict_for_application_to_seller_service(db, application_id, payload)

    return application_id

    
