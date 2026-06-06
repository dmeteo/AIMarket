from pydantic import BaseModel, Field


class Category(BaseModel):
    id: int
    title: str = Field(min_length=2, max_length=20)
    

class CategoriesResponse(BaseModel):
    categories: list[Category]


class CategoryCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=20)
    
    
class CategoryCreateResponse(BaseModel):
    category: Category
    
    
class CategoryUpdateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=20)


class CategoryUpdateResponse(BaseModel):
    category: Category
    
    
class CategoryDeleteResponse(BaseModel):
    category_id: int
    