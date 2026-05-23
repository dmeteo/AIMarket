from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.params import Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.products import ProductCard, ProductCreateRequest, ProductCreateResponse, ProductDeleteResponse, ProductPage, ProductUpdateRequest, ProductUpdateResponse, ProductsResponse
from app.schemas.reviews import ReviewCreateRequest, ReviewCreateResponse, ReviewUpdateRequest, ReviewUpdateResponse, ReviewsResponse
from app.repositories.products import get_products_page



router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=ProductsResponse)
def get_products(
    db: Annotated[Session, Depends(get_db)],
    q: str | None = None,
    category_ids: list[int] | None = None,
    brand_ids: list[int] | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> ProductsResponse:
    product_page, total, pages = get_products_page(
        db=db,
        q=q,
        category_ids=category_ids,
        brand_ids=brand_ids,
        min_price=min_price,
        max_price=max_price,
        page=page,
        limit=limit
    )
    product_cards = [
        {
            "id": product.id,
            "shop_id": product.shop_id,
            "title": product.title,
            "price": product.price,
            "discount_percent": product.discount_percent,
            "final_price": round(product.price * (1 - product.discount_percent / 100), 2),
            "rating": product.rating,
            "reviews_count": product.reviews_count,
            "quantity": product.quantity,
            "images": [image.image_url for image in product.images]
        }
        for product in product_page
    ]

    return ProductsResponse(products=[ProductCard(**product) for product in product_cards],
                            total=total, 
                            page=page, 
                            limit=limit, 
                            pages=pages)
    
    


@router.get("/{product_id}", response_model=ProductPage)
def get_product(product_id: int) -> ProductPage:
    pass


@router.post("/", response_model=ProductCreateResponse)
def create_product(payload: ProductCreateRequest) -> ProductCreateResponse:
    pass


@router.patch("/{product_id}", response_model=ProductUpdateResponse)
def update_product(product_id: int, payload: ProductUpdateRequest) -> ProductUpdateResponse:
    pass


@router.delete("/{product_id}", response_model=ProductDeleteResponse)
def delete_product(product_id: int) -> ProductDeleteResponse:
    pass


@router.get("/{product_id}/reviews", response_model=ReviewsResponse)
def get_product_reviews(product_id: int) -> ReviewsResponse:
    pass


# current_user - сессия пользователя
@router.post("/{product_id}/reviews", response_model=ReviewCreateResponse)
def create_review(product_id: int, payload: ReviewCreateRequest) -> ReviewCreateResponse:
    pass


@router.patch("/{product_id}/reviews/{review_id}", response_model=ReviewUpdateResponse)
def update_review(product_id: int, review_id: int, payload: ReviewUpdateRequest) -> ReviewUpdateResponse:
    pass


@router.delete("/{product_id}/reviews/{review_id}", status_code=200)
def delete_review(product_id: int, review_id: int):
    pass