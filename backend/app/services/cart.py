from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.cart import create_cart, get_cart
from app.schemas.cart import CartItemResponse, CartResponse
from app.services.products import mapping_product_card, calculate_final_price
from app.models.cart import Cart
    
        
def mapping_cart_items(cart_items, total_price: Decimal, total_discount: Decimal):
    items = []
    for item in cart_items:
        items.append(CartItemResponse(
                        product=mapping_product_card(item.product),
                        quantity=item.quantity
                    ))
        total_price += item.product.price * item.quantity
        item_final_price = calculate_final_price(item.product.price, item.product.discount_percent) * item.quantity
        total_discount += item.product.price*item.quantity - item_final_price
        
    return items, round(total_price, 2), round(total_discount, 2)


def mapping_cart(cart, user_id):
    total_price, total_discount = Decimal(0), Decimal(0)
    items, total_price, total_discount = mapping_cart_items(cart.items, total_price, total_discount)
    mapped_cart = {
        "id": cart.id,
        "user_id": user_id,
        "items": items,
        "total_price": total_price,
        "total_discount": total_discount,
        "final_price": round(total_price - total_discount, 2)
    }
    
    return CartResponse(**mapped_cart)
    
    
def create_cart_service(db: Session, user_id):
    cart = create_cart(db, Cart(user_id=user_id))
    
    return cart
    

def get_cart_service(db: Session, user: User) -> CartResponse:
    cart = get_cart(db, user.id)
    if not cart:
        cart = create_cart_service(db, user.id)
        db.commit()
        db.refresh(cart)
    
    mapped_cart = mapping_cart(cart, user.id)
    
    return mapped_cart
    
    