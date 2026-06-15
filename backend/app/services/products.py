from typing import Sequence

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.products import create_product, create_review, delete_product, delete_review, get_categories_by_ids, get_old_review, get_product, get_product_reviews, get_products_page, get_review_by_user_and_product, update_product, update_review
from app.models.product import Product, ProductImage
from app.models.review import Review
from app.schemas.products import ProductCard, ProductCreateRequest, ProductPage, ProductUpdateRequest
from app.schemas.categories import Category
from app.schemas.reviews import ReviewCreateRequest, ReviewResponse, ReviewUpdateRequest, ReviewsResponse
from app.common.exceptions import access_denied, product_not_found, review_not_found
from app.models.user import User
from app.common.enums import Role



def existence_product(db: Session, product_id) -> Product:
    product = get_product(db, product_id)
    if not product:
        raise product_not_found()
    
    return product


def check_seller_or_admin_and_get_seller_shops(user: User):
    user_shops = None
    if user.role == Role.SELLER.value:   
        user_shops = [shop.id for shop in user.shops]
        
    return user_shops


def calculate_final_price(price, discount_percent):
    return round(price * (1 - discount_percent / 100), 2)


def get_product_images_service(images):
    return [image.image_url for image in images]


def mapping_product_categories(categories: list[dict]) -> list[Category]:
    categories = [Category(id=category.id, title=category.title) for category in categories]
    return categories


def mapping_review(review: Review) -> ReviewResponse:
    mapped_review = ReviewResponse(
        user_id=review.user_id,
        user_name=review.author.name,
        product_id=review.product_id,
        rate=review.rate,
        text=review.text,
        created_at=review.created_at,
        edited=review.edited,
        edited_at=review.updated_at
    )
    return mapped_review
    

def mapping_reviews(reviews: list[Review]):
    mapped_reviews = [mapping_review(review) for review in reviews]
    
    return mapped_reviews
    

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
    product = existence_product(db, product_id)

    product_page = mapping_product_page(product)
    return product_page


def get_product_categories_service(db: Session, category_ids):
    categories = get_categories_by_ids(db, category_ids)
    if len(categories) != len(set(category_ids)):
        raise product_not_found()
    return categories


def create_product_service(db: Session, user: User, payload: ProductCreateRequest):
    user_shops = check_seller_or_admin_and_get_seller_shops(user)
    if user_shops is not None and payload.shop_id not in user_shops:
        raise access_denied()
    
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
    db.flush()

    for i, url in enumerate(payload.image_urls):
        db.add(ProductImage(product_id=product.id, image_url=url, sort_order=i))

    db.commit()
    db.refresh(product)
    
    product_page = mapping_product_page(product)
    
    return product_page


def update_product_service(db: Session, user: User, product_id, payload: ProductUpdateRequest):
    data = payload.model_dump(exclude_unset=True)
    user_shops = check_seller_or_admin_and_get_seller_shops(user)
    
    product = update_product(db, user_shops, product_id, data)
    if not product:
        raise product_not_found()
    
    db.commit()
    
    product_page = mapping_product_page(product)
    return product_page


def delete_product_service(db: Session, user: User, product_id):
    user_shops = check_seller_or_admin_and_get_seller_shops(user)
    id = delete_product(db, user_shops, product_id)
    if id is None:
        raise product_not_found()
    
    db.commit()
    
    return id
    

def get_product_reviews_service(db: Session, product_id) -> ReviewsResponse:
    existence_product(db, product_id)
    reviews = get_product_reviews(db, product_id)
    mapped_reviews = mapping_reviews(reviews)
    
    return ReviewsResponse(reviews=mapped_reviews)


def create_review_service(db: Session, user, product_id, payload: ReviewCreateRequest):
    product = existence_product(db, product_id)
    
    user_review_for_product = get_review_by_user_and_product(db, user.id, product_id)
    
    if user_review_for_product:
        raise HTTPException(status_code=409, detail="Review already exists")
    
    review_mapping = Review(
        user_id=user.id,
        product_id=product_id,
        rate=payload.rate,
        text=payload.text
    )

    review = create_review(db, review_mapping)
    
    product.rating_sum += review.rate
    product.reviews_count += 1
    product.rating = product.rating_sum / product.reviews_count
    
    product.shop.rating_sum += review.rate
    product.shop.reviews_count += 1
    product.shop.rating = product.shop.rating_sum / product.shop.reviews_count
    
    db.commit()
    db.refresh(review)
    
    mapped_review = mapping_review(review)
    return mapped_review


def update_review_service(db: Session, user, product_id, review_id, payload: ReviewUpdateRequest):
    product = existence_product(db, product_id)
    old_review = get_old_review(db, user.id, product_id, review_id)
    if not old_review:
        raise review_not_found()
    
    old_rate = old_review.rate
    
    data = payload.model_dump(exclude_unset=True)
    data["edited"] = True
    updated_review = update_review(db, user.id, product_id, review_id, data)
    if not updated_review:
        raise review_not_found()
    
    if "rate" in data.keys():
        product.rating_sum += updated_review.rate - old_rate
        product.rating = product.rating_sum / product.reviews_count
        
        product.shop.rating_sum += updated_review.rate - old_rate
        product.shop.rating = product.shop.rating_sum / product.shop.reviews_count
        
    db.commit()
    db.refresh(updated_review)
    
    mapped_review = mapping_review(updated_review)
    return mapped_review
    
    
def delete_review_service(db: Session, user, product_id, review_id):
    product = existence_product(db, product_id)
    deleted_review = delete_review(db, user.id, product_id, review_id)
    if deleted_review is None:
        raise review_not_found()
    
    product.reviews_count -= 1
    product.rating_sum -= deleted_review.rate
    
    if product.reviews_count == 0:
        product.rating = 0
    else: 
        product.rating = product.rating_sum / product.reviews_count
        
    product.shop.reviews_count -= 1
    product.shop.rating_sum -= deleted_review.rate
    
    if product.shop.reviews_count == 0:
        product.shop.rating = 0
    else: 
        product.shop.rating = product.shop.rating_sum / product.shop.reviews_count
    
    db.commit()

    return deleted_review.id


def ai_search_service(db: Session, query):
    pass
    