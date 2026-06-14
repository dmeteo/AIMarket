from datetime import date
from decimal import Decimal

from pydantic import BaseModel

from app.common.enums import DeliveryType, OrderStatus
from app.schemas.cart import CartItemResponse


class OrderStatusInfo(BaseModel):
    code: OrderStatus
    label: str

class OrderResponse(BaseModel):
    id: int
    user_id: int
    items: list[CartItemResponse]
    address: str
    delivery_cost: Decimal
    predicted_date: date
    status: OrderStatusInfo
    items_total_price: Decimal
    items_total_discount: Decimal
    final_price: Decimal
    
    
class OrderCreateResponse(BaseModel):
    order_id: int
    payment_url: str
    
    
class OrderCreateRequest(BaseModel):
    address: str
    delivery_type: DeliveryType
    
    
# class OrderResponse(BaseModel):
#     order: OrderResponse
    
    
class OrdersResponse(BaseModel):
    orders: list[OrderResponse]
    

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