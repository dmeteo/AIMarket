from fastapi import APIRouter

from app.schemas.products import ProductCreateRequest, ProductCreateResponse, ProductDeleteResponse, ProductPage, ProductsResponse, ReviewsResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=ProductsResponse)
def get_products() -> ProductsResponse:
    pass


@router.get("/{product_id}", response_model=ProductPage)
def get_product(product_id: int) -> ProductPage:
    pass


@router.post("/", response_model=ProductCreateResponse)
def create_product(payload: ProductCreateRequest) -> ProductCreateResponse:
    pass


@router.delete("/{product_id}", response_model=ProductDeleteResponse)
def delete_product(product_id: int) -> ProductDeleteResponse:
    pass


@router.get("/{product_id}/reviews", response_model=ReviewsResponse)
def get_product_reviews(product_id: int) -> ReviewsResponse:
    pass