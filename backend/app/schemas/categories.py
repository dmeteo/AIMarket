from pydantic import BaseModel, ConfigDict, Field


class Category(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str = Field(min_length=2, max_length=50)
    

class CategoriesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    categories: list[Category]
    


class CategoryCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=50)
    
    
class CategoryCreateResponse(BaseModel):
    category: Category
    
    
class CategoryUpdateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=50)


class CategoryUpdateResponse(BaseModel):
    category: Category
    
    
class CategoryDeleteResponse(BaseModel):
    category_id: int
    