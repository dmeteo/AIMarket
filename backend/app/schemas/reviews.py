from pydantic import BaseModel, Field


class Review(BaseModel):
    user_id: int
    user_name: str
    product_id: int
    rate: int = Field(ge=1, le=5)
    text: str | None = None


class ReviewsResponse(BaseModel):
    reviews: list[Review]