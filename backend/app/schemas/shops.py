from pydantic import BaseModel, Field

from app.schemas.products import ProductCard


class ShopResponse(BaseModel):
    id: int
    logo_url: str
    title: str
    description: str | None = None
    favourites_count: int = Field(ge=0)
    reviews_count: int = Field(ge=0)
    rating: float = Field(ge=0)
    products: list[ProductCard]
    
    
class ShopForUserResponse(BaseModel):
    shop: ShopResponse
    is_favourite: bool


class ShopCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=30)
    logo_url: str
    description: str | None = Field(default = None, max_length=300)
    
    
class ShopCreateResponse(BaseModel):
    shop: ShopResponse
    

class ShopDeleteResponse(BaseModel):
    shop_id: int
    
    
class ShopUpdateRequest(BaseModel):
    logo: str | None = None
    title: str | None = Field(default=None, min_length=3, max_length=30)
    description: str | None = Field(default=None, max_length=300)
    

class ShopUpdateResponse(BaseModel):
    shop: ShopResponse