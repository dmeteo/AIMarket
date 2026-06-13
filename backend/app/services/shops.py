from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.shop import FavouritesShop, Shop
from app.schemas.shops import ShopCreateRequest, ShopCreateResponse, ShopDeleteResponse, ShopResponse, ShopUpdateRequest, ShopUpdateResponse
from app.repositories.shops import add_to_favourite_shop, create_shop, delete_from_favourite_shop, delete_shop, get_shop, get_shop_by_title, update_shop
from app.services.products import mapping_products_cards
from app.common.exceptions import access_denied, shop_not_found
from app.common.enums import Role
from app.common.utils import build_url


def check_unique_shop_title(db: Session, title, shop_id=None):
    shop = get_shop_by_title(db, title)
    
    if shop and shop.id != shop_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Shop title already exists"
        )
        

def check_owner_shop_or_admin(db: Session, user: User, shop_id):
    shop = get_shop(db, shop_id)
    if not shop: 
        raise shop_not_found()
    
    if user.role == Role.ADMIN.value:
        return
        
    if not shop.owner_id == user.id:
        raise access_denied()
        
        
def mapping_shop(shop: Shop):
    shop = {
        "id": shop.id,
        "logo_url": build_url(shop.logo_url),
        "title": shop.title,
        "description": shop.description,
        "favourites_count": shop.favourites_count,
        "reviews_count": shop.reviews_count,
        "rating": shop.rating,
        "products": mapping_products_cards(shop.products),
    }
    
    return ShopResponse(**shop)


def create_shop_service(db: Session, user: User, payload: ShopCreateRequest) -> ShopCreateResponse:
    check_unique_shop_title(db, payload.title)
    
    shop = create_shop(db, Shop(owner_id=user.id,
                                title=payload.title,
                                logo_url=payload.logo_url,
                                description=payload.description))
    
    db.commit()
    db.refresh(shop)
    
    return ShopCreateResponse(shop=mapping_shop(shop))


def update_shop_service(db: Session, user: User, shop_id: int, payload: ShopUpdateRequest):
    check_owner_shop_or_admin(db, user, shop_id)
    check_unique_shop_title(db, payload.title, shop_id=shop_id)
    
    data = payload.model_dump(exclude_unset=True)
    
    shop = update_shop(db, shop_id, data) 
    
    db.commit()
    db.refresh(shop)
    
    return ShopUpdateResponse(shop=mapping_shop(shop))


def delete_shop_service(db: Session, user: User, shop_id: int):
    check_owner_shop_or_admin(db, user, shop_id)
    
    shop = delete_shop(db, shop_id)
    
    db.commit()
    
    return ShopDeleteResponse(shop_id=shop.id)


def get_shop_service(db: Session, shop_id):
    shop = get_shop(db, shop_id)
    
    if not shop: 
        raise shop_not_found()
    
    return mapping_shop(shop)


def update_favourite_status_service(db: Session, user: User, shop_id):
    shop = get_shop(db, shop_id)
    if not shop: 
        raise shop_not_found()
    
    if shop in user.favourites:
        shop_id_updated = delete_from_favourite_shop(db, user.id, shop_id)
        shop.favourites_count -= 1
    else:
        shop_id_updated = add_to_favourite_shop(db, FavouritesShop(user_id=user.id,
                                                 shop_id=shop_id))
        shop.favourites_count += 1
        
        
    db.commit()
    
    return shop_id_updated
    
    