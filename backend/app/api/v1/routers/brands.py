from decimal import Decimal

from fastapi import APIRouter
from fastapi.params import Query

from app.schemas.brands import Brand, BrandCreateRequest, BrandCreateResponse, BrandDeleteResponse, BrandUpdateRequest, BrandUpdateResponse, BrandsResponse
from app.schemas.products import ProductsResponse


router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("/", response_model=BrandsResponse)
def get_brands(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> BrandsResponse:
    pass


@router.get("/{brand_id}/products", response_model=ProductsResponse)
def get_brand_products(
    brand_id: int, 
    q: str | None = None,
    category_id: int | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> ProductsResponse:
    pass


@router.get("/{brand_id}", response_model=Brand)
def get_brand(brand_id) -> Brand:
    pass


@router.post("/", response_model=BrandCreateResponse)
def create_brand(payload: BrandCreateRequest) -> BrandCreateResponse:
    pass


@router.patch("/{brand_id}", response_model=BrandUpdateResponse)
def update_brand(brand_id, payload: BrandUpdateRequest) -> BrandUpdateResponse:
    pass


@router.delete("/{brand_id}", response_model=BrandDeleteResponse)
def delete_brand(brand_id) -> BrandDeleteResponse:
    pass