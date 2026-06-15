from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.categories import Category

    
class ProductPage(BaseModel):
    id: int
    shop_id: int
    title: str
    images: list[str]
    description: str
    price: Decimal = Field(gt=0, examples=["199.99"])
    discount_percent: Decimal = Field(ge=0, le=100, examples=["10.5"])
    final_price: Decimal = Field(gt=0, examples=["199.99"])
    rating: float | None = Field(
        default=None,
        ge=0,
        le=5,
        examples=[4.8],
    )
    reviews_count: int 
    quantity: int
    categories: list[Category]
    
    
class ProductCard(BaseModel):
    id: int
    shop_id: int
    title: str
    images: list[str]
    price: Decimal = Field(gt=0, examples=["199.99"])
    discount_percent: Decimal = Field(ge=0, le=100, examples=["10.5"])
    final_price: Decimal = Field(gt=0, examples=["199.99"])
    rating: float | None = Field(
        default=None,
        ge=0,
        le=5,
        examples=[4.8],
    )
    reviews_count: int = Field(ge=0)
    quantity: int = Field(ge=0)
    

class ProductCreateRequest(BaseModel):
    shop_id: int
    brand_id: int | None = None
    title: str = Field(max_length=30)
    description: str = Field(max_length=300)
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2, examples=["100.99"])
    category_ids: list[int] = []
    image_urls: list[str] = []
    discount_percent: Decimal = Field(default=0, ge=0, le=100, max_digits=5, decimal_places=2, examples=["10.5"])
    quantity: int = Field(ge=0)
    is_active: bool = True
    

    
class ProductCreateResponse(BaseModel):
    product: ProductPage
    
    
class ProductDeleteResponse(BaseModel):
    id: int


class ProductsResponse(BaseModel):
    products: list[ProductCard]
    total: int
    page: int
    limit: int
    pages: int

    
class ProductUpdateRequest(BaseModel):
    title: str | None = Field(default=None, max_length=30)
    description: str | None = Field(default=None, max_length=300)
    images: list[str] | None = None
    price: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2, examples=["100.99"])
    category_ids: list[int] | None = None
    discount_percent: Decimal | None = Field(default=None, ge=0, le=100, max_digits=5, decimal_places=2, examples=["10.5"])
    quantity: int | None = Field(default=None, ge=0)
    is_active: bool | None = None
    
    
class ProductUpdateResponse(BaseModel):
    product: ProductPage