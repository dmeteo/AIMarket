from datetime import date
from decimal import Decimal

from pydantic import BaseModel

from app.common.enums import DeliveryType, OrderStatus
from app.schemas.cart import CartItem


class OrderStatusInfo(BaseModel):
    code: OrderStatus
    label: str

class Order(BaseModel):
    id: int
    user_id: int
    items: list[CartItem]
    address: str
    delivery_cost: Decimal
    predicted_date: date
    status: OrderStatusInfo
    items_total_price: Decimal
    final_price: Decimal
    
    
class OrderRequest(BaseModel):
    address: str
    delivery_type: DeliveryType
    
    
class OrderResponse(BaseModel):
    order: Order
    
    
class OrdersResponse(BaseModel):
    orders: list[Order]