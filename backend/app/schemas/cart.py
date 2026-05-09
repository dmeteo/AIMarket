from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.products import ProductCard


class CartItem(BaseModel):
    product: ProductCard
    quantity: int = Field(ge=1)


class Cart(BaseModel):
    id: int
    user_id: int
    items: list[CartItem]
    total_price: Decimal
    total_discount: Decimal
    final_price: Decimal
    
    
class AddProductToCartRequest(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)
    

class CartResponse(BaseModel):
    cart: Cart
    

class UpdateCartItemRequest(BaseModel):
    product_id: int
    quantity: int

