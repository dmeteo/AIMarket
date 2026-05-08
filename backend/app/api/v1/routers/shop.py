from fastapi import APIRouter

from backend.app.schemas.shop import ShopCreateRequest, ShopCreateResponse, ShopProfile, ShopUpdateRequest, ShopUpdateResponse

router = APIRouter(prefix="/shop", tags=["shop"])


@router.post("", response_model=ShopCreateResponse)
def create_shop(payload: ShopCreateRequest) -> ShopCreateResponse:
    pass


@router.patch("/{shop_id}", response_model=ShopUpdateResponse)
def update_shop(payload: ShopUpdateRequest) -> ShopUpdateResponse:
    pass


@router.get("/{shop_id}", response_model=ShopProfile)
def get_shop(shop_id) -> ShopProfile:
    pass

# @router.post("/{shop_id}/favourite")
# def change_favourite_status_shop(shop_id):
#     pass