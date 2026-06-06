from pydantic import BaseModel, Field


class BrandResponse(BaseModel):
    id: int
    logo_url: str | None
    title: str
    description: str | None
    

class BrandCreateRequest(BaseModel):
    logo_url: str | None = None
    title: str = Field(max_length=30)
    description: str | None = Field(default=None, max_length=300)
    
    
class BrandCreateResponse(BaseModel):
    brand: BrandResponse
    
    
class BrandUpdateRequest(BaseModel):
    logo_url: str | None = None
    title: str | None = Field(default=None, max_length=30)
    description: str | None = Field(default=None, max_length=300)
    
    
class BrandUpdateResponse(BaseModel):
    brand: BrandResponse
  
    
class BrandDeleteResponse(BaseModel):
    brand_id: int
    
    
class BrandsResponse(BaseModel):
    brands: list[BrandResponse]
