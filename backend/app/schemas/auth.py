from pydantic import BaseModel, EmailStr, Field

from user import UserReadResponse
    
    
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=50)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserAuthResponse(BaseModel):
    token: Token
    user: UserReadResponse