import re

from pydantic import BaseModel, EmailStr, field_validator

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
    
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        value = re.sub(r'\D', '', value)
        if len(value) != 11:
            raise ValueError("Invalid phone number")
        if value.startswith("7"):
            return "+" + value
        else:
            new_value = "+7" + value[1:]
            return new_value


class ApplicationToBeSellerResponse(BaseModel):
    application_id: int