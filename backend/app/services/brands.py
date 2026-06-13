from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.brands import create_brand, delete_brand, get_brand, get_brand_by_title, get_brands, update_brand
from app.common.exceptions import brand_not_found
from app.schemas.brands import BrandCreateResponse, BrandDeleteResponse, BrandResponse, BrandUpdateResponse
from app.models.brand import Brand
from app.common.utils import build_url


def check_unique_brand_title(db: Session, title, brand_id=None):
    brand = get_brand_by_title(db, title)
    
    if brand and brand.id != brand_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Brand already exists"
        )
        
        
def mapping_brand(brand: Brand):
    return BrandResponse(
        id=brand.id,
        logo_url=build_url(brand.logo_url),
        title=brand.title,
        description=brand.description,
    )
        
        
def mapping_brands(brands):
    mapped_brands = [mapping_brand(brand) for brand in brands]
    
    return mapped_brands
    

def get_brands_service(db: Session):
    brands = get_brands(db)
    
    return mapping_brands(brands)


def get_brand_service(db: Session, brand_id):
    brand = get_brand(db, brand_id)
    
    if not brand:
        raise brand_not_found()
    
    return mapping_brand(brand)


def create_brand_service(db: Session, payload):
    check_unique_brand_title(db, payload.title)
    data = payload.model_dump()
    brand = create_brand(db, Brand(**data))
    
    db.commit()
    db.refresh(brand)
    
    return BrandCreateResponse(brand=mapping_brand(brand))


def update_brand_service(db: Session, brand_id, payload):
    data = payload.model_dump(exclude_unset=True)
    if "title" in data:
        check_unique_brand_title(db, data["title"], brand_id=brand_id)
    
    brand = update_brand(db, brand_id, data)
    
    if not brand:
        raise brand_not_found()
    
    db.commit()
    db.refresh(brand)
    
    return BrandUpdateResponse(brand=mapping_brand(brand))


def delete_brand_service(db: Session, brand_id):
    brand = delete_brand(db, brand_id)
    
    if not brand:
        raise brand_not_found()
    
    db.commit()
    
    return BrandDeleteResponse(brand_id=brand.id)
    
    