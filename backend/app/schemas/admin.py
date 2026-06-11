from datetime import date

from pydantic import BaseModel, EmailStr, Field

from app.common.enums import PersonType, VerdictApplicationToBeSeller
    
    
class ApplicationToSellerList(BaseModel):
    id: int
    full_name: str
    verdict: VerdictApplicationToBeSeller
    created_at: date


class ApplicationsToSellerResponse(BaseModel):
    applications: list[ApplicationToSellerList]
    
    
class ApplicationToSellerResponse(BaseModel):
    id: int
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
    verdict: VerdictApplicationToBeSeller
    created_at: date
    

class VerdictForApplicationToSellerRequest(BaseModel):
    verdict: VerdictApplicationToBeSeller
    description: str | None = None
    
    
class VerdictForApplicationToSellerResponse(BaseModel):
    application_id: int