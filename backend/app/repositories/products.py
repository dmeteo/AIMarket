from math import ceil

from sqlalchemy import delete, select, or_, func, update
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.category import Category
from backend.app.schemas.products import ProductUpdateRequest


def get_products_page(
    db: Session, 
    q=None,
    category_ids=None, 
    brand_ids=None, 
    min_price=None, 
    max_price=None,
    page=1,
    limit=20
):
    condition = []
    
    if brand_ids:
        condition.append(Product.brand_id.in_(brand_ids))
    
    if category_ids:
        condition.append(Product.categories.any(Category.id.in_(category_ids)))
        
    if min_price is not None:
        condition.append(Product.price >= min_price)
    
    if max_price is not None:
        condition.append(Product.price <= max_price)
        
    if q:
        search = f"%{q}%"
        condition.append(or_(
            Product.title.ilike(search),
            Product.description.ilike(search)
        ))
    
    stmt = select(Product).where(*condition)
    stmt_total = select(func.count(Product.id)).where(*condition)
    total = db.scalar(stmt_total)
    pages = ceil(int(total) / limit)
    
    product_page = db.scalars(stmt.offset((page - 1) * limit).limit(limit)).all()
    
    return product_page, int(total), pages


def get_product(db: Session, product_id):
    stmt = select(Product).where(Product.id == product_id)
    
    product = db.scalar(stmt)
    
    return product


def create_product(db: Session, product: Product):
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_categories_by_ids(db: Session, category_ids):
    stmt = select(Category).where(Category.id.in_(category_ids))
    
    categories = db.scalars(stmt).all()
    
    return categories


def update_product(db: Session, product_id, data) -> Product:
    stmt = update(Product).where(Product.id==product_id).values(data).returning(Product)
    
    result = db.execute(stmt)
    
    product = result.scalar_one_or_none()
    
    db.commit()
    
    return product


def delete_product(db: Session, product_id):
    stmt = delete(Product).where(Product.id==product_id)
    
    db.execute(stmt)
    db.commit()
    
    return product_id


# def get_product_reviews(db: Session, product_id):
#     stmt = select(Product).where(Product.id==product_id)