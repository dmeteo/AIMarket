from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class Role(Enum):
    BUYER = "BUYER"
    SELLER = "SELLER"
    ADMIN = "ADMIN"
    
class UserCreateRequest(BaseModel):
    name: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=6, max_length=50)
    
    
class UserReadResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    is_active: bool