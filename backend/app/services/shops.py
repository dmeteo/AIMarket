from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.shop import Shop
from app.schemas.shops import ShopCreateRequest, ShopCreateResponse, ShopResponse
from app.repositories.shops import create_shop, get_shop_by_title
from app.services.products import mapping_products_cards


def check_unique_shop_title(db: Session, title, shop_id=None):
    shop = get_shop_by_title(db, title)
    
    if shop and shop.id != shop_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Shop already exists"
        )
        
        
def mapping_shop(shop: Shop):
    shop = {
        "id": shop.id,
        "logo_url": shop.logo_url,
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