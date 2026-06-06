from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.models.brand import Brand


def get_brands(db: Session):
    stmt = select(Brand).where(Brand.is_active==True)
    
    brands = db.scalars(stmt).all()
    
    return brands


def get_brand(db: Session, brand_id):
    stmt = select(Brand).where(Brand.id==brand_id).where(Brand.is_active==True)
    
    brand = db.scalar(stmt)
    
    return brand


def get_brand_by_title(db: Session, title):
    stmt = select(Brand).where(Brand.title==title)
    
    brand = db.scalar(stmt)
    
    return brand


def create_brand(db: Session, brand):
    db.add(brand)
    
    return brand


def update_brand(db: Session, brand_id, data):
    stmt = update(Brand).where(Brand.id==brand_id).values(data).returning(Brand)
    
    brand = db.scalar(stmt)
    
    return brand


def delete_brand(db: Session, brand_id):
    stmt = delete(Brand).where(Brand.id==brand_id).returning(Brand)
    
    brand = db.scalar(stmt)
    
    return brand