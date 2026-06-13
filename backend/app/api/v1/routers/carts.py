from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.cart import AddProductToCartRequest, AddProductToCartResponse, CartResponse, UpdateCartItemRequest, UpdateCartItemResponse
from app.api.v1.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.cart import add_product_to_cart_service, delete_cart_item_service, get_cart_service, update_cart_item_quantity_service


router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=CartResponse, description="[Buyer User]",)
def get_cart(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> CartResponse:
    cart = get_cart_service(db, current_user)
    
    return cart


@router.post("/items", response_model=AddProductToCartResponse, description="[Buyer User]",)
def add_product_to_cart(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    payload: AddProductToCartRequest
) -> AddProductToCartResponse:
    cart_id = add_product_to_cart_service(db, current_user, payload)
    
    return cart_id
    
    
@router.patch("/items/{product_id}", response_model=UpdateCartItemResponse, description="[Buyer User]",)
def update_cart_item_quantity(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    product_id: int,
    payload: UpdateCartItemRequest 
) -> UpdateCartItemResponse:
    cart_item = update_cart_item_quantity_service(db, current_user, product_id, payload)
    
    return cart_item


@router.delete("/items/{product_id}", response_model=CartResponse, description="[Buyer User]",)
def delete_cart_item(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    product_id: int
) -> CartResponse:
    cart = delete_cart_item_service(db, current_user, product_id)
    
    return cart