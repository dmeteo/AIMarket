from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.models.shop import FavouritesShop, Shop

def get_shop_by_title(db: Session, title):
    stmt = select(Shop).where(Shop.title==title)
    
    shop = db.scalar(stmt)
    
    return shop


def create_shop(db: Session, shop: Shop):
    db.add(shop)
    
    return shop


def update_shop(db: Session, shop_id, data):
    stmt = update(Shop).where(Shop.id==shop_id).values(data).returning(Shop)
        
    shop = db.scalar(stmt)
    
    return shop


def delete_shop(db: Session, shop_id):
    stmt = delete(Shop).where(Shop.id==shop_id).returning(Shop)
    
    shop = db.scalar(stmt)
    
    return shop


def get_shop(db: Session, shop_id):
    stmt = select(Shop).where(Shop.id==shop_id)
    
    shop = db.scalar(stmt)
    
    return shop


def delete_from_favourite_shop(db: Session, user_id, shop_id):
    stmt = delete(FavouritesShop).where(FavouritesShop.user_id==user_id).where(FavouritesShop.shop_id==shop_id).returning(FavouritesShop.shop_id)
    
    shop_id = db.scalar(stmt)
    
    return shop_id


def add_to_favourite_shop(db: Session, favourite):
    db.add(favourite)
    
    return favourite.shop_id