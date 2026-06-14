from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.models.orders import Order


def create_order(db: Session, order):
    db.add(order)
    
    return order


def create_order_items(db: Session, order_items):
    db.add_all(order_items)
    
    return order_items