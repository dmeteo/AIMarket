from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModelMixin


class Shop(BaseModelMixin):
    __tablename__ = "shops"

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(30), nullable=False)
    logo_url: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    owner: Mapped["User"] = relationship(back_populates="shops")
    products: Mapped[list["Product"]] = relationship(back_populates="shop")
