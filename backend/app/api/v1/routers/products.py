from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.params import Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.products import ProductCreateRequest, ProductCreateResponse, ProductDeleteResponse, ProductPage, ProductUpdateRequest, ProductUpdateResponse, ProductsResponse
from app.schemas.reviews import ReviewCreateRequest, ReviewCreateResponse, ReviewUpdateRequest, ReviewUpdateResponse, ReviewsResponse
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.services.products import create_product_service, delete_product_service, get_product_reviews_service, get_product_service, get_products_page_service, update_product_service



router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=ProductsResponse)
def get_products(
    db: Annotated[Session, Depends(get_db)],
    q: str | None = None,
    category_ids: list[int] | None = Query(default=None),
    brand_ids: list[int] | None = Query(default=None),
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> ProductsResponse:
    products_page, total, pages = get_products_page_service(
        db=db,
        q=q,
        category_ids=category_ids, 
        brand_ids=brand_ids, 
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
    
    
@router.get("/{product_id}", response_model=ProductPage)
def get_product(db: Annotated[Session, Depends(get_db)], product_id: int) -> ProductPage:
    product = get_product_service(db, product_id)
    return product


@router.post("/", response_model=ProductCreateResponse)
def create_product(
    db: Annotated[Session, Depends(get_db)], 
    current_user: Annotated[User, Depends(get_current_user)], 
    payload: ProductCreateRequest
) -> ProductCreateResponse:
    product_page = create_product_service(db, current_user, payload)
    return ProductCreateResponse(product=product_page)
    
    
@router.patch("/{product_id}", response_model=ProductUpdateResponse)
def update_product(
    db: Annotated[Session, Depends(get_db)], 
    product_id: int, 
    payload: ProductUpdateRequest
) -> ProductUpdateResponse:
    updated_product = update_product_service(db, product_id, payload)
    
    return updated_product


@router.delete("/{product_id}", response_model=ProductDeleteResponse)
def delete_product(
    db: Annotated[Session, Depends(get_db)],
    product_id: int
) -> ProductDeleteResponse:
    id = delete_product_service(db, product_id)
    
    return ProductDeleteResponse(id=id)


# @router.get("/{product_id}/reviews", response_model=ReviewsResponse)
# def get_product_reviews(
#     db: Annotated[Session, Depends(get_db)], 
#     product_id: int
# ) -> ReviewsResponse:
#     product_reviews = get_product_reviews_service(db, product_id)


@router.post("/{product_id}/reviews", response_model=ReviewCreateResponse)
def create_review(product_id: int, payload: ReviewCreateRequest) -> ReviewCreateResponse:
    pass


@router.patch("/{product_id}/reviews/{review_id}", response_model=ReviewUpdateResponse)
def update_review(product_id: int, review_id: int, payload: ReviewUpdateRequest) -> ReviewUpdateResponse:
    pass


@router.delete("/{product_id}/reviews/{review_id}", status_code=200)
def delete_review(product_id: int, review_id: int):
    pass