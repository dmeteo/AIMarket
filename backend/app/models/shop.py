from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BaseModelMixin


class Shop(BaseModelMixin):
    __tablename__ = "shops"

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(30), nullable=False)
    logo_url: Mapped[str] = mapped_column(String(512), default=None, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    favourites_count: Mapped[int] = mapped_column(default=0, nullable=False)
    rating: Mapped[float] = mapped_column(default=0, nullable=False)
    reviews_count: Mapped[int] = mapped_column(default=0, nullable=False)
    rating_sum: Mapped[int] = mapped_column(default=0, nullable=False)

    owner: Mapped["User"] = relationship(back_populates="shops")
    products: Mapped[list["Product"]] = relationship(back_populates="shop")
    favourites: Mapped[list["User"]] = relationship(secondary="favourites_shops", back_populates="favourites")


class FavouritesShop(Base):
    __tablename__ = "favourites_shops"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), primary_key=True)
    