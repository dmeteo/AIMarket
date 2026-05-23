from math import ceil

from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.category import Category

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
    