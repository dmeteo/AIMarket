from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload


from app.models.cart import Cart, CartItem


def get_cart(db: Session, user_id):
    stmt = select(Cart).where(Cart.user_id == user_id).options(selectinload(Cart.items).selectinload(CartItem.product))

    cart = db.scalar(stmt)
    
    return cart


def get_cart_item(db: Session, cart_id, product_id):
    stmt = select(CartItem).where(CartItem.cart_id == cart_id).where(CartItem.product_id == product_id).options(selectinload(CartItem.product))
    
    cart_item = db.scalar(stmt)
    
    return cart_item


def create_cart(db: Session, cart):
    db.add(cart)
    
    return cart


def add_product_to_cart(db: Session, cart_item):
    db.add(cart_item)
    
    return cart_item