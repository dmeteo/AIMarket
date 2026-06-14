from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.shops import ShopCreateRequest, ShopCreateResponse, ShopDeleteResponse, ShopResponse, ShopUpdateRequest, ShopUpdateResponse
from app.core.database import get_db
from app.api.v1.deps import get_current_user, require_seller_or_admin
from app.services.shops import create_shop_service, delete_shop_service, get_shop_service, update_favourite_status_service, update_shop_service


router = APIRouter(prefix="/shops", tags=["shops"])


@router.post("", response_model=ShopCreateResponse, description="[Seller/Admin]")
def create_shop(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_seller_or_admin)],
    payload: ShopCreateRequest
) -> ShopCreateResponse:
    shop = create_shop_service(db, current_user, payload)
    
    return shop


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