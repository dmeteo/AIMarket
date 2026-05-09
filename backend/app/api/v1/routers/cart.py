from fastapi import APIRouter

from backend.app.schemas.cart import AddProductToCartRequest, CartResponse, DeleteFromCart, UpdateCartItemRequest


router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=CartResponse)
def get_cart():
    pass


@router.post("/items", response_model=CartResponse)
def add_product_to_cart(payload: AddProductToCartRequest) -> CartResponse:
    pass


@router.patch("/items/{product_id}", response_model=CartResponse)
def update_cart_item(product_id, payload: UpdateCartItemRequest) -> CartResponse:
    pass


@router.delete("/items/{product_id}", response_model=DeleteFromCart)
def delete_cart_item(product_id) -> DeleteFromCart:
    pass