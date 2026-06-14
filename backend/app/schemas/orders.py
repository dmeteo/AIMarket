from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.common.enums import DeliveryType, OrderStatus
from app.schemas.cart import CartItemResponse
from app.schemas.products import ProductCard


# class OrderStatusInfo(BaseModel):
#     code: OrderStatus
#     label: str


class OrderItemResponse(BaseModel):
    product: ProductCard
    quantity: int = Field(ge=1)
    price_at_purchase: Decimal
    

class OrderResponse(BaseModel):
    id: int
    user_id: int
    items: list[OrderItemResponse]
    address: str
    delivery_cost: Decimal
    predicted_date: date
    status: OrderStatus
    items_total_price: Decimal
    items_total_discount: Decimal
    final_price: Decimal
    
    
class OrderSummaryResponse(BaseModel):
    id: int
    status: OrderStatus
    items_count: int
    final_price: Decimal
    created_at: datetime
    
    
class OrderCreateResponse(BaseModel):
    order_id: int
    payment_url: str
    
    
class OrderCreateRequest(BaseModel):
    address: str
    delivery_type: DeliveryType
    
    
# class OrderResponse(BaseModel):
#     order: OrderResponse
    
    
class OrdersResponse(BaseModel):
    orders: list[OrderSummaryResponse]
    

class OrderPreviewRequest(BaseModel):
    address: str
    delivery_type: DeliveryType


class OrderPreviewResponse(BaseModel):
    items: list[CartItemResponse]
    address: str
    delivery_type: DeliveryType
    delivery_cost: Decimal
    predicted_date: date
    items_total_price: Decimal
    items_total_discount: Decimal
    final_price: Decimal