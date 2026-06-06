from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.models.category import Category


def get_categories(db: Session):
    stmt = select(Category).where(Category.is_active==True).order_by(Category.title.asc)
    
    categories = db.scalars(stmt).all()
    
    return categories


def get_category(db: Session, category_id):
    stmt = select(Category).where(Category.id==category_id)
    
    category = db.scalar(stmt)
    
    return category


def create_category(db: Session, category: Category):
    db.add(category)
    
    return category


def update_category(db: Session, category_id, data):
    stmt = update(Category).where(Category.id==category_id).values(data).returning(Category)
    
    category = db.scalar(stmt)
    
    return category


def delete_category(db: Session, category_id):
    stmt = delete(Category).where(Category.id==category_id).returning(Category)
    
    category = db.scalar(stmt)
    
    return category


def get_category_by_title(db: Session, title) -> Category | None:
    stmt = select(Category).where(Category.title==title)
    
    category = db.scalar(stmt)
    
    return category


    