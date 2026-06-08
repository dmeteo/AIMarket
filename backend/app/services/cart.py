from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.cart import add_product_to_cart, create_cart, get_cart, get_cart_item
from app.schemas.cart import AddProductToCartRequest, AddProductToCartResponse, CartItemResponse, CartResponse, UpdateCartItemRequest, UpdateCartItemResponse
from app.services.products import existence_product, mapping_product_card, calculate_final_price
from app.models.cart import Cart, CartItem
from app.common.exceptions import invalid_quantity


def existence_cart(db: Session, user_id) -> Cart:
    cart = get_cart(db, user_id)
    if not cart:
        cart = create_cart_service(db, user_id)
        db.commit()
        db.refresh(cart)
        
    return cart
 
def mapping_cart_items(cart_items, total_price: Decimal, total_discount: Decimal):
    items = []
    for item in cart_items:
        items.append(CartItemResponse(
                        product=mapping_product_card(item.product),
                        quantity=item.quantity,
                        available=item.product.quantity >= item.quantity,
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
    cart = existence_cart(db, user.id)
    
    mapped_cart = mapping_cart(cart, user.id)
    
    return mapped_cart


def update_cart_item_quantity_service(db: Session, user: User, product_id, payload: UpdateCartItemRequest):
    cart = existence_cart(db, user.id)
    
    cart_item = get_cart_item(db, cart.id, product_id)
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if cart_item.product.quantity >= payload.quantity:
        cart_item.quantity = payload.quantity
    else:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Available {cart_item.product.quantity} pieces")
        
    db.commit()
    db.refresh(cart_item)
    
    return UpdateCartItemResponse(product_id=cart_item.product_id, quantity=cart_item.quantity)


def add_product_to_cart_service(db: Session, user: User, payload: AddProductToCartRequest):
    product = existence_product(db, payload.product_id)
    cart = existence_cart(db, user.id)

    if any(map(lambda item: item.product_id == payload.product_id, cart.items)):
        update_cart_item_quantity_service(db, user, payload.product_id, UpdateCartItemRequest(quantity=payload.quantity))
    else:
        if product.quantity >= payload.quantity:
            add_product_to_cart(db, CartItem(cart_id=cart.id,
                                            product_id=payload.product_id,
                                            quantity=payload.quantity))
        else:
            raise invalid_quantity(product.quantity)
        
        db.commit()
        
    return AddProductToCartResponse(cart_id=cart.id)
        
        