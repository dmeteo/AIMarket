from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.services.admin import get_application_to_seller_service, get_applications_to_seller_service, verdict_for_application_to_seller_service
from app.services.analytics import get_platform_analytics_service
from app.core.database import get_db
from app.api.v1.deps import require_admin
from app.models.user import User
from app.schemas.admin import ApplicationsToSellerResponse, ApplicationToSellerResponse, VerdictForApplicationToSellerRequest, VerdictForApplicationToSellerResponse
from app.schemas.analytics import AdminAnalyticsResponse

router = APIRouter(prefix="/admin", tags=["admin [ADMIN only]"])


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_platform_analytics(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
    period: Literal["week", "month", "quarter", "year"] | None = Query(default=None),
    date_from: date | None = Query(default=None, alias="from"),
    date_to: date | None = Query(default=None, alias="to"),
) -> AdminAnalyticsResponse:
    analytics = get_platform_analytics_service(db, period, date_from, date_to)

    return analytics


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
    application = get_application_to_seller_service(db, application_id)

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

    
