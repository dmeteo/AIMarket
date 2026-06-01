from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.params import Query
from sqlalchemy.orm import Session

from app.schemas.categories import CategoriesResponse
from app.schemas.products import ProductsResponse
from app.services.products import get_products_page_service
from app.core.database import get_db
from app.services.categories import get_categories_service


router = APIRouter(prefix="/categories", tags=["categories"])



# FOR ADMIN
# @router.get("/{category_id}", response_model=Category)
# def get_category(category_id) -> Category:
#     pass

# @router.delete("/{category_id}", response_model=CategoryDeleteResponse)
# def delete_category(category_id) -> CategoryDeleteResponse:
#     pass

# @router.post("/", response_model=CategoryCreateResponse)
# def create_category(payload: CategoryCreateRequest) -> CategoryCreateResponse:
#     pass

# @router.patch("/{category_id}", response_model=Category)
# def update_category(category_id, payload: CategoryUpdate):
#     pass


@router.get("/", response_model=CategoriesResponse)
def get_categories(db: Annotated[Session, Depends(get_db)]) -> CategoriesResponse:
    categories = get_categories_service(db)
    
    return categories


@router.get("/{category_id}/products", response_model=ProductsResponse)
def get_products_by_categories(
    db: Annotated[Session, Depends(get_db)],
    category_id: int,
    q: str | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> ProductsResponse:
    products_page, total, pages = get_products_page_service(
        db=db,
        q=q,
        category_ids=[category_id], 
        min_price=min_price, 
        max_price=max_price,
        page=page,
        limit=limit,
    )
     
    return ProductsResponse(products=products_page,
                            total=total, 
                            page=page, 
                            limit=limit, 
                            pages=pages)