from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.params import Query
from sqlalchemy.orm import Session

from app.schemas.brands import BrandCreateRequest, BrandCreateResponse, BrandDeleteResponse, BrandResponse, BrandUpdateRequest, BrandUpdateResponse, BrandsResponse
from app.schemas.products import ProductsResponse
from app.core.database import get_db
from app.services.products import get_products_page_service
from app.services.brands import create_brand_service, delete_brand_service, get_brand_service, get_brands_service, update_brand_service
from app.api.v1.deps import require_admin, require_seller_or_admin
from app.models.user import User


router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("/", response_model=BrandsResponse)
def get_brands(db: Annotated[Session, Depends(get_db)]) -> BrandsResponse:
    brands = get_brands_service(db)
    
    return BrandsResponse(brands=brands)


@router.get("/{brand_id}/products", response_model=ProductsResponse)
def get_products_by_brand(
    db: Annotated[Session, Depends(get_db)],
    brand_id: int, 
    q: str | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> ProductsResponse:
    products_page, total, pages = get_products_page_service(
        db=db,
        q=q,
        brand_ids=[brand_id], 
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


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(
    db: Annotated[Session, Depends(get_db)],
    brand_id: int,
) -> BrandResponse:
    brand = get_brand_service(db, brand_id)
    
    return brand


@router.post("/", response_model=BrandCreateResponse)
def create_brand(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
    payload: BrandCreateRequest
) -> BrandCreateResponse:
    brand = create_brand_service(db, payload)
    
    return brand


@router.patch("/{brand_id}", response_model=BrandUpdateResponse)
def update_brand(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
    brand_id: int, 
    payload: BrandUpdateRequest
) -> BrandUpdateResponse:
    brand = update_brand_service(db, brand_id, payload)
    
    return brand


@router.delete("/{brand_id}", response_model=BrandDeleteResponse)
def delete_brand(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
    brand_id: int
) -> BrandDeleteResponse:
    brand_id = delete_brand_service(db, brand_id)
    
    return brand_id