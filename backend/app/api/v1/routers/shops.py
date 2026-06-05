from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.shops import ShopCreateRequest, ShopCreateResponse, ShopDeleteResponse, ShopProfile, ShopUpdateRequest, ShopUpdateResponse
from app.core.database import get_db
from app.api.v1.deps import require_seller_or_admin
from app.services.shops import create_shop_service


router = APIRouter(prefix="/shops", tags=["shops"])


@router.post("/", response_model=ShopCreateResponse)
def create_shop(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_seller_or_admin)],
    payload: ShopCreateRequest
) -> ShopCreateResponse:
    shop = create_shop_service(db, current_user, payload)
    
    return shop


@router.patch("/{shop_id}", response_model=ShopUpdateResponse)
def update_shop(shop_id: int, payload: ShopUpdateRequest) -> ShopUpdateResponse:
    pass


@router.delete("/{shop_id}", response_model=ShopDeleteResponse)
def delete_shop(shop_id: int) -> ShopDeleteResponse:
    pass


@router.get("/{shop_id}", response_model=ShopProfile)
def get_shop(shop_id: int) -> ShopProfile:
    pass


@router.post("/{shop_id}/favourite")
def user_change_favourite_status_shop(shop_id: int):
    pass