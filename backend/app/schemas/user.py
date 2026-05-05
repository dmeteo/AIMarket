from pydantic import BaseModel, EmailStr

from app.schemas.base import Role

    
class UserProfileResponse(BaseModel):
    id: int
    name: str
    role: Role
    
    
class CurrentUserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    is_active: bool
    orders_count: int