from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category


def get_categories(db: Session):
    stmt = select(Category).where(Category.is_active==True).order_by(Category.title.asc)
    
    categories = db.scalars(stmt).all()
    
    return categories