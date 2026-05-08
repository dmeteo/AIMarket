from fastapi import APIRouter

from app.schemas.shops import ShopCreateRequest, ShopCreateResponse, ShopDeleteResponse, ShopProfile, ShopUpdateRequest, ShopUpdateResponse


router = APIRouter(prefix="/shop", tags=["shop"])


@router.post("/", response_model=ShopCreateResponse)
def create_shop(payload: ShopCreateRequest) -> ShopCreateResponse:
    pass


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