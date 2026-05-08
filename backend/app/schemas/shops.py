from pydantic import BaseModel, Field

from app.schemas.products import ProductCard


class ShopProfile(BaseModel):
    id: int
    logo_url: str
    title: str
    description: str | None = None
    favourites_count: int = Field(ge=0)
    reviews_count: int = Field(ge=0)
    rating: float
    products: list[ProductCard]


class ShopCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=30)
    logo_url: str
    description: str | None = Field(default = None, max_length=300)
    
    
class ShopCreateResponse(BaseModel):
    shop: ShopProfile
    

class ShopDeleteResponse(BaseModel):
    shop_id: int
    
    
class ShopUpdateRequest(BaseModel):
    logo: str | None = None
    title: str | None = Field(default=None, min_length=3, max_length=30)
    description: str | None = Field(default=None, max_length=300)
    

class ShopUpdateResponse(BaseModel):
    shop: ShopProfile