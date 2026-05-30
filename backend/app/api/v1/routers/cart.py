from fastapi import APIRouter

from app.schemas.cart import AddProductToCartRequest, CartResponse, UpdateCartItemRequest


router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=CartResponse)
def get_cart():
    pass


@router.post("/items", response_model=CartResponse)
def add_product_to_cart(payload: AddProductToCartRequest) -> CartResponse:
    pass


@router.patch("/items/{product_id}", response_model=CartResponse)
def update_cart_item_count(product_id, payload: UpdateCartItemRequest) -> CartResponse:
    pass


@router.delete("/items/{product_id}", response_model=CartResponse)
def delete_cart_item(product_id) -> CartResponse:
    pass