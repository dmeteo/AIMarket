from pydantic import BaseModel, EmailStr

from app.common.enums import PersonType, Role


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
    
    
class ApplicationToBeSellerRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    description: str
    person_type: PersonType
    inn: str
    ogrn: str
    address: str
    bic: str
    checking_account: str


class ApplicationToBeSellerResponse(BaseModel):
    application_id: str