from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.products import get_product, get_products_page
from app.models.product import Product
from app.schemas.products import ProductCard, ProductPage
from app.schemas.categories import Category


def calculate_final_price(price, discount_percent):
    return round(price * (1 - discount_percent / 100), 2)


def get_product_images_service(images):
    return [image.image_url for image in images]


def mapping_product_card(product: Product) -> ProductCard: 
    product_card = {
        "id": product.id,
        "shop_id": product.shop_id,
        "title": product.title,
        "price": product.price,
        "discount_percent": product.discount_percent,
        "final_price": calculate_final_price(product.price, product.discount_percent),
        "rating": product.rating,
        "reviews_count": product.reviews_count,
        "quantity": product.quantity,
        "images": get_product_images_service(product.images)
    }
    
    return ProductCard(**product_card)
    


def mapping_products_cards(product_page: Sequence[Product]) -> Sequence[ProductCard]:
    products_cards = [
        mapping_product_card(product)
        for product in product_page
    ]

    return products_cards


def get_products_page_service(
    db: Session,
    q=None,
    category_ids=None, 
    brand_ids=None, 
    min_price=None, 
    max_price=None,
    page=1,
    limit=20
):
    products_page, total, pages = get_products_page(
        db=db,
        q=q,
        category_ids=category_ids,
        brand_ids=brand_ids,
        min_price=min_price,
        max_price=max_price,
        page=page,
        limit=limit
    )
    
    products_page_cards = mapping_products_cards(products_page)
    
    return products_page_cards, total, pages


def mapping_product_categories(categories) -> list[Category]:
    categories = [Category(id=category.id, title=category.title) for category in categories]
    return categories
    

def mapping_product_page(product: Product) -> ProductPage:
    product_page = {
        "id": product.id,
        "shop_id": product.shop_id,
        "title": product.title,
        "price": product.price,
        "description": product.description,
        "discount_percent": product.discount_percent,
        "final_price": calculate_final_price(product.price, product.discount_percent),
        "rating": product.rating,
        "reviews_count": product.reviews_count,
        "quantity": product.quantity,
        "images": get_product_images_service(product.images),
        "categories": mapping_product_categories(product.categories),
    }
    return ProductPage(**product_page)

        
def get_product_service(db: Session, product_id) -> ProductPage:
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product_page = mapping_product_page(product)
    return product_page
    
    