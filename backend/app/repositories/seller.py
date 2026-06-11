from sqlalchemy import select

from app.models.user import Seller


def get_seller_by_user_id(db, user_id):
    stmt = select(Seller).where(Seller.user_id==user_id)
    
    seller = db.scalar(stmt)
    
    return seller