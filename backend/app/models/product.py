from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.models.base import Base, BaseModelMixin


class ProductCategory(Base):
    __tablename__ = "product_categories"

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), primary_key=True)


class Product(BaseModelMixin):
    __tablename__ = "products"

    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), nullable=False)
    brand_id: Mapped[int | None] = mapped_column(ForeignKey("brands.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(30), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    quantity: Mapped[int] = mapped_column(default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    rating: Mapped[float] = mapped_column(default=0, nullable=False)
    reviews_count: Mapped[int] = mapped_column(default=0, nullable=False)
    rating_sum: Mapped[int] = mapped_column(default=0, nullable=False) 

    shop: Mapped["Shop"] = relationship(back_populates="products")
    brand: Mapped["Brand | None"] = relationship(back_populates="products")
    categories: Mapped[list["Category"]] = relationship(
        secondary="product_categories",
        back_populates="products",
    )
    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan"
    )
    
    @validates("rating")
    def validate_rating(self, key, rating):
        if rating is None: 
            return rating
        if rating < 0: 
            raise ValueError("Rating was ge 0")
        elif rating > 5:
            raise ValueError("Rating was le 5")
        return rating
    
    @validates("reviews_count")
    def validate_reviews_count(self, key, reviews_count):
        if reviews_count < 0:
            raise ValueError("Reviews was ge 0")
        return reviews_count
    
    @validates("quantity")
    def validate_quantity(self, key, quantity):
        if quantity == 0:
            self.is_active = False
        return quantity
    

class ProductImage(BaseModelMixin):
    __tablename__ = "product_images"

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(512), nullable=False)
    sort_order: Mapped[int] = mapped_column(default=0, nullable=False)

    product: Mapped["Product"] = relationship(back_populates="images")
