from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.products import ProductCard


class CartItemResponse(BaseModel):
    product: ProductCard
    quantity: int = Field(ge=1)
    available: bool


class CartResponse(BaseModel):
    id: int
    user_id: int
    items: list[CartItemResponse]
    total_price: Decimal
    total_discount: Decimal
    final_price: Decimal
    
    
class AddProductToCartRequest(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)
    
    
class AddProductToCartResponse(BaseModel):
    cart_id: int
    

class UpdateCartItemRequest(BaseModel):
    quantity: int
    

class UpdateCartItemResponse(BaseModel):
    product_id: int
    quantity: int

