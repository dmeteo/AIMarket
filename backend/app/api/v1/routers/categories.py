from decimal import Decimal

from fastapi import APIRouter
from fastapi.params import Query

from app.schemas.categories import CategoriesResponse, Category, CategoryCreateRequest, CategoryCreateResponse, CategoryUpdate
from app.schemas.products import ProductsResponse


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
def get_categories() -> CategoriesResponse:
    pass


@router.get("/{category_id}/products", response_model=ProductsResponse)
def get_products_by_category(
    category_id: int, 
    q: str | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> ProductsResponse:
    pass