from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload


from app.models.user import User
from app.models.cart import Cart, CartItem


def get_cart(db: Session, user_id):
    stmt = select(Cart).where(Cart.user_id == user_id).options(selectinload(Cart.items).selectinload(CartItem.product))

    cart = db.scalar(stmt)
    
    return cart


def create_cart(db: Session, cart):
    db.add(cart)
    
    return cart