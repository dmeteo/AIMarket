from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.categories import create_category, delete_category, get_categories, get_category, get_category_by_title, update_category
from app.schemas.categories import CategoriesResponse
from app.models.category import Category
from app.common.exceptions import category_not_found


def check_unique_category_title(db: Session, title, category_id=None):
    category = get_category_by_title(db, title)
    
    if category and category.id != category_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category already exists"
        )


def create_category_service(db: Session, payload):
    check_unique_category_title(db, payload.title)
    category = create_category(db, Category(title=payload.title))
    
    db.commit()
    db.refresh(category)
    
    return category


def update_category_service(db: Session, category_id, payload):
    data = payload.model_dump(exclude_unset=True)
    check_unique_category_title(db, payload.title, category_id=category_id)
    category = update_category(db, category_id, data)
    
    if not category:
        raise category_not_found()
    
    db.commit()
    db.refresh(category)
    
    return category


def delete_category_service(db: Session, category_id):
    category = delete_category(db, category_id)
    
    if not category:
        raise category_not_found()
    
    db.commit()
    
    return category


def get_category_service(db: Session, category_id):
    category = get_category(db, category_id)
    
    if not category:
        raise category_not_found()
    
    return category


def get_categories_service(db: Session):
    categories = get_categories(db)
    
    return CategoriesResponse(categories=categories)