from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.orders import OrderCreateRequest, OrderCreateResponse, OrderItemResponse, OrderPreviewRequest, OrderPreviewResponse, OrderResponse, OrderSummaryResponse, OrdersResponse
from app.services.cart import get_cart_service
from app.common.enums import DeliveryType, OrderStatus
from app.models.orders import Order, OrderItem
from app.repositories.orders import create_order, create_order_items, get_order_by_id, get_user_orders
from app.services import payment
from app.services.products import mapping_product_card



def calculate_delivery_cost(delivery_type: DeliveryType, address) -> int:
    if delivery_type.value == DeliveryType.CDEK.value:
        return 250
    if delivery_type.value == DeliveryType.YANDEX.value:
        return 350


def calculate_predicted_date(delivery_type, address) -> date:
    if delivery_type.value == DeliveryType.CDEK.value:
        predicted_date = date.today() + timedelta(days=15)
        return predicted_date
    if delivery_type.value == DeliveryType.YANDEX.value:
        predicted_date = date.today() + timedelta(days=10)
        return predicted_date


def order_preview_service(db: Session, user: User, payload: OrderPreviewRequest):
    cart = get_cart_service(db, user)
    
    delivery_cost = calculate_delivery_cost(payload.delivery_type, payload.address)
    predicted_date = calculate_predicted_date(payload.delivery_type, payload.address)
    
    mapped_order_preview = OrderPreviewResponse(
        items=cart.items,
        address=payload.address,
        delivery_type=payload.delivery_type,
        delivery_cost=delivery_cost,
        predicted_date=predicted_date,
        items_total_price=cart.total_price,
        items_total_discount=cart.total_discount,
        final_price=cart.final_price + delivery_cost,
    )
    
    return mapped_order_preview


def create_order_service(db: Session, user: User, payload: OrderCreateRequest):
    cart = get_cart_service(db, user)
    
    delivery_cost = calculate_delivery_cost(payload.delivery_type, payload.address)
    predicted_date = calculate_predicted_date(payload.delivery_type, payload.address)
    
    order = create_order(db, Order(
                            user_id=user.id,
                            address=payload.address,
                            delivery_type=payload.delivery_type,
                            delivery_cost=delivery_cost,
                            predicted_date=predicted_date,
                            items_total_price=cart.total_price,
                            final_price=cart.final_price + delivery_cost,
                            status=OrderStatus.AWAITING_PAYMENT.value,
                            ))
    
    db.flush()
    
    order_items = [OrderItem(order_id=order.id,
                             product_id=item.product.id,
                             quantity=item.quantity,
                             price_at_purchase=item.product.final_price
                             ) for item in cart.items]
    
    order_items = create_order_items(db, order_items)
    
    payment_id, confirmation_url = payment.create_payment(order_id=order.id, full_price=order.final_price)
    
    order.payment_id = payment_id
    
    db.commit()
    db.refresh(order)
    
    return OrderCreateResponse(order_id=order.id, payment_url=confirmation_url)


def mapping_order_items(items: list[OrderItem]):
    mapped_items = [OrderItemResponse(
        product=mapping_product_card(product=item.product),
        quantity=item.quantity,
        price_at_purchase=item.price_at_purchase
        ) for item in items]
    
    return mapped_items
    

def mapping_order(order: Order):
    mapped_order = OrderResponse(
        id=order.id,
        user_id=order.user_id,
        items=mapping_order_items(order.items),
        address=order.address,
        delivery_cost=order.delivery_cost,
        predicted_date=order.predicted_date,
        status=order.status,
        items_total_price=order.items_total_price,
        items_total_discount=order.items_total_price - (order.final_price - order.delivery_cost),
        final_price=order.final_price,
    )
    
    return mapped_order


def mapping_summary_order(order: Order):
    mapped_order = OrderSummaryResponse(
        id=order.id,
        status=order.status,
        items_count=len(order.items),
        final_price=order.final_price,
        created_at=order.created_at
    )

    return mapped_order


def mapping_orders(orders: list[Order]):
    mapped_orders = [mapping_summary_order(order) for order in orders]
    
    return mapped_orders


def get_user_orders_service(db: Session, user: User):
    orders = get_user_orders(db, user.id)
    
    mapped_orders = OrdersResponse(orders=mapping_orders(orders))
    
    return mapped_orders


def get_user_order_service(db: Session, user: User, order_id):
    order = get_order_by_id(db, user.id, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    mapped_order = mapping_order(order)
    
    return mapped_order