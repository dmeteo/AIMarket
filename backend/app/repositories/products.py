from math import ceil

from sqlalchemy import delete, select, or_, func, update
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.category import Category
from app.models import Review


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
    
    stmt = select(Product).where(*condition).where(Product.is_active==True)
    stmt_total = select(func.count(Product.id)).where(*condition).where(Product.is_active==True)
    total = db.scalar(stmt_total)
    pages = ceil(int(total) / limit)
    
    product_page = db.scalars(stmt.offset((page - 1) * limit).limit(limit)).all()
    
    return product_page, int(total), pages


def get_product(db: Session, product_id) -> Product | None:
    stmt = select(Product).where(Product.id == product_id)
    
    product = db.scalar(stmt)
    
    return product


def get_categories_by_ids(db: Session, category_ids):
    stmt = select(Category).where(Category.id.in_(category_ids))
    
    categories = db.scalars(stmt).all()
    
    return categories


def create_product(db: Session, product: Product):
    db.add(product)
    
    return product


def update_product(db: Session, shops_ids, product_id, data) -> Product | None:
    if shops_ids is None:
        stmt = update(Product).where(Product.id==product_id).values(data).returning(Product)
    else:
        stmt = update(Product).where(Product.id==product_id).where(Product.shop_id.in_(shops_ids)).values(data).returning(Product)
    
    result = db.execute(stmt)
    
    product = result.scalar_one_or_none()
    
    return product


def delete_product(db: Session, shops_ids, product_id):
    if shops_ids is None:
        stmt = delete(Product).where(Product.id==product_id).returning(Product.id)
    else: 
        stmt = delete(Product).where(Product.id==product_id).where(Product.shop_id.in_(shops_ids)).returning(Product.id)
    
    result = db.execute(stmt)
    deleted_id = result.scalar_one_or_none()
    
    if deleted_id is None:
        return None
    
    return deleted_id


def get_product_reviews(db: Session, product_id) -> list[Review]:
    stmt = select(Review).where(Review.product_id==product_id)
    
    reviews = db.scalars(stmt).all()
    
    return reviews


def create_review(db: Session, review: Review) -> Review:
    db.add(review) 
    
    return review


def get_review_by_user_and_product(db: Session, user_id, product_id):
    stmt = select(Review).where(Review.product_id==product_id).where(Review.user_id==user_id)
    
    result = db.scalar(stmt)
    
    return result


def get_old_review(db: Session, user_id, product_id, review_id):
    stmt = select(Review).where(Review.product_id==product_id).where(Review.id==review_id).where(Review.user_id==user_id)
    
    result = db.scalar(stmt)
    
    return result
    

def update_review(db: Session, user_id, product_id, review_id, data):    
    stmt = update(Review).where(Review.product_id==product_id).where(Review.id==review_id).where(Review.user_id==user_id).values(data).returning(Review)
    
    result = db.execute(stmt)
    review = result.scalar_one_or_none()
    
    return review


def delete_review(db: Session, user_id, product_id, review_id):
    stmt = delete(Review).where(Review.product_id==product_id).where(Review.id==review_id).where(Review.user_id==user_id).returning(Review)
    
    result = db.execute(stmt)
    deleted_review = result.scalar_one_or_none()
    
    if deleted_review is None:
        return None
    
    return deleted_review