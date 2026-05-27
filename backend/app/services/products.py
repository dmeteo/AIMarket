from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.products import create_product, delete_product, get_categories_by_ids, get_product, get_product_reviews, get_products_page, update_product
from app.models.product import Product
from app.models.review import Review
from app.schemas.products import ProductCard, ProductCreateRequest, ProductPage, ProductUpdateRequest
from app.schemas.categories import Category
from app.schemas.reviews import ReviewResponse, ReviewsResponse


def calculate_final_price(price, discount_percent):
    return round(price * (1 - discount_percent / 100), 2)


def get_product_images_service(images):
    return [image.image_url for image in images]


def mapping_product_categories(categories: list[dict]) -> list[Category]:
    categories = [Category(id=category.id, title=category.title) for category in categories]
    return categories


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

        
def get_product_service(db: Session, product_id) -> ProductPage:
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product_page = mapping_product_page(product)
    return product_page



def get_product_categories_service(db: Session, category_ids):
    categories = get_categories_by_ids(db, category_ids)
    if len(categories) != len(set(category_ids)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return categories


def create_product_service(db: Session, user, payload: ProductCreateRequest):
    product_mapping = Product(
        shop_id=payload.shop_id,
        brand_id=payload.brand_id,
        title=payload.title,
        description=payload.description,
        price=payload.price,
        categories=get_product_categories_service(db, payload.category_ids),
        discount_percent=payload.discount_percent,
        quantity=payload.quantity,
        is_active=payload.is_active
    )
    
    product = create_product(db, product=product_mapping)
    product_page = mapping_product_page(product)
    
    return product_page


def update_product_service(db: Session, product_id, payload: ProductUpdateRequest):
    data = payload.model_dump(exclude_unset=True)
    product = update_product(db, product_id, data)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    product_page = mapping_product_page(product)
    
    return product_page


def delete_product_service(db: Session, product_id):
    id = delete_product(db, product_id)
    return id


def mapping_reviews(reviews: list[Review]):
    mapped_reviews = [ReviewResponse(
        user_id=review.user_id,
        user_name=review.author.name,
        product_id=review.product_id,
        rate=review.rate,
        text=review.text,
        created_at=review.created_at,
        edited=review.edited,
        edited_at=review.updated_at,
    ) for review in reviews]
    
    return mapped_reviews
    

def get_product_reviews_service(db: Session, product_id) -> ReviewsResponse:
    reviews = get_product_reviews(db, product_id)
    mapped_reviews = mapping_reviews(reviews)
    
    return ReviewsResponse(reviews=mapped_reviews)