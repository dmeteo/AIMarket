from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.cart import AddProductToCartRequest, CartResponse, UpdateCartItemRequest
from app.api.v1.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.cart import get_cart_service


router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=CartResponse)
def get_cart(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> CartResponse:
    cart = get_cart_service(db, current_user)
    
    return cart


@router.post("/items", response_model=CartResponse)
def add_product_to_cart(payload: AddProductToCartRequest) -> CartResponse:
    pass


@router.patch("/items/{product_id}", response_model=CartResponse)
def update_cart_item_count(product_id: int, payload: UpdateCartItemRequest) -> CartResponse:
    pass


@router.delete("/items/{product_id}", response_model=CartResponse)
def delete_cart_item(product_id: int) -> CartResponse:
    pass