from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.shop import Shop

def get_shop_by_title(db: Session, title):
    stmt = select(Shop).where(Shop.title==title)
    
    shop = db.scalar(stmt)
    
    return shop


def create_shop(db: Session, shop: Shop):
    db.add(shop)
    
    return shop


# def favourites_count(db: Session, shop_id):
#     stmt = select(func.count(Shop.id)).where(Shop)