from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.shops import ShopCreateRequest, ShopCreateResponse, ShopDeleteResponse, ShopResponse, ShopUpdateRequest, ShopUpdateResponse, ShopsResponse
from app.schemas.analytics import AnalyticsResponse
from app.core.database import get_db
from app.api.v1.deps import get_current_user, require_seller_or_admin
from app.services.shops import create_shop_service, delete_shop_service, get_my_shops_service, get_shop_service, update_favourite_status_service, update_shop_service
from app.services.analytics import get_shop_analytics_service


router = APIRouter(prefix="/shops", tags=["shops"])


@router.post("", response_model=ShopCreateResponse, description="[Seller/Admin]")
def create_shop(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_seller_or_admin)],
    payload: ShopCreateRequest
) -> ShopCreateResponse:
    shop = create_shop_service(db, current_user, payload)
    
    return shop


@router.get("/me", response_model=ShopsResponse)
def get_my_shops(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_seller_or_admin)]
) -> ShopsResponse:
    shops = get_my_shops_service(db, current_user)
    
    return shops

@router.get("/me/analytics", response_model=AnalyticsResponse, description="[Seller/Admin]")
def get_my_shops_analytics(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_seller_or_admin)],
    period: Literal["week", "month", "quarter", "year"] | None = Query(default=None),
    date_from: date | None = Query(default=None, alias="from"),
    date_to: date | None = Query(default=None, alias="to"),
    shop_ids: str | None = Query(default=None),
) -> AnalyticsResponse:
    analytics = get_shop_analytics_service(db, current_user, period, date_from, date_to, shop_ids)
    
    return analytics


@router.patch("/{shop_id}", response_model=ShopUpdateResponse, description="[Seller/Admin]")
def update_shop(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_seller_or_admin)],
    shop_id: int, 
    payload: ShopUpdateRequest
) -> ShopUpdateResponse:
    shop = update_shop_service(db, current_user, shop_id, payload)
    
    return shop


@router.delete("/{shop_id}", response_model=ShopDeleteResponse, description="[Seller/Admin]")
def delete_shop(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_seller_or_admin)],
    shop_id: int
) -> ShopDeleteResponse:
    shop_id = delete_shop_service(db, current_user, shop_id)
    
    return shop_id


@router.get("/{shop_id}", response_model=ShopResponse)
def get_shop(
    db: Annotated[Session, Depends(get_db)],
    shop_id: int
) -> ShopResponse:
    shop = get_shop_service(db, shop_id)
    
    return shop


@router.post("/{shop_id}/favourite", description="[Buyer User]",)
def user_change_favourite_status_shop(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    shop_id: int
):
    shop_id = update_favourite_status_service(db, current_user, shop_id)
    
    return shop_id