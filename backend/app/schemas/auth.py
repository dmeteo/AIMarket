from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import CurrentUserResponse


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
    
class TokenData(BaseModel):
    email: str | None = None
    

class UserInfo(BaseModel):
    email: str
    password_hash: str
    
    
class RegisterRequest(BaseModel):
    name: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=6, max_length=50)

    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=50)
    
    
class AuthResponse(BaseModel):
    user: CurrentUserResponse
    token: TokenResponse
