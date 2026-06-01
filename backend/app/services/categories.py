from sqlalchemy.orm import Session

from app.repositories.categories import get_categories
from app.schemas.categories import CategoriesResponse


def get_categories_service(db: Session):
    categories = get_categories(db)
    
    return CategoriesResponse(categories=categories)