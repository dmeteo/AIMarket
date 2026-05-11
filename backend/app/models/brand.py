from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModelMixin


class Brand(BaseModelMixin):
    __tablename__ = "brands"

    title: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    products: Mapped[list["Product"]] = relationship(back_populates="brand")
