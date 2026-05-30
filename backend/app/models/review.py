from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.models.base import BaseModelMixin


class Review(BaseModelMixin):
    __tablename__ = "reviews"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    rate: Mapped[int] = mapped_column(nullable=False)
    text: Mapped[str | None] = mapped_column(default=None, nullable=True)
    edited: Mapped[bool] = mapped_column(default=False)
    
    author: Mapped["User"] = relationship(
        back_populates="reviews"
    )
    product: Mapped["Product"] = relationship(
        back_populates="reviews"
    )
    
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_reviews_user_id_product_id"),
    )
    
    @validates("rate")
    def validate_rating(self, key, rate):
        if rate is None: 
            return rate
        if rate < 1: 
            raise ValueError("Rating was ge 1")
        elif rate > 5:
            raise ValueError("Rating was le 5")
        return rate
