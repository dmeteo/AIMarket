from decimal import Decimal

from fastapi import APIRouter
from fastapi.params import Query

from app.schemas.products import ProductCreateRequest, ProductCreateResponse, ProductDeleteResponse, ProductPage, ProductUpdateRequest, ProductUpdateResponse, ProductsResponse, ReviewsResponse

router = APIRouter(prefix="/products", tags=["products"])


# q - поиск по названию/описанию
@router.get("/", response_model=ProductsResponse)
def get_products(
    q: str | None = None,
    category_id: int | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=1, ge=1, le=100),
) -> ProductsResponse:
    pass


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