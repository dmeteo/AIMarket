from datetime import date

from pydantic import BaseModel, Field


class ReviewResponse(BaseModel):
    user_id: int
    user_name: str
    product_id: int
    rate: int = Field(ge=1, le=5)
    text: str | None = None
    created_at: date
    edited: bool = Field(default=False)
    edited_at: date | None = None


class ReviewsResponse(BaseModel):
    reviews: list[ReviewResponse]
    

class ReviewCreateRequest(BaseModel):
    rate: int = Field(ge=1, le=5)
    text: str | None = None
    
    
class ReviewCreateResponse(BaseModel):
    review_id: int
    

class ReviewUpdateRequest(BaseModel):
    rate: int | None = Field(default=None, ge=1, le=5)
    text: str | None = None
    
class ReviewUpdateResponse(BaseModel):
    review_id: int
    