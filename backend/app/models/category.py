from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModelMixin


class Category(BaseModelMixin):
    __tablename__ = "categories"

    title: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    products: Mapped[list["Product"]] = relationship(
        secondary="product_categories",
        back_populates="categories",
    )
