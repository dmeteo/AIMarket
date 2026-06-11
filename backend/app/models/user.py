from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BaseModelMixin
from app.common.enums import Role, VerdictApplicationToBeSeller


class User(BaseModelMixin):
    __tablename__ = "users"
    
    name: Mapped[str] = mapped_column(String(30), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(default=Role.BUYER.value, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    addresses: Mapped[list["Address"]] = relationship(back_populates="user")
    shops: Mapped[list["Shop"]] = relationship(back_populates="owner")
    reviews: Mapped[list["Review"]] = relationship(back_populates="author")
    favourites: Mapped[list["Shop"]] = relationship(secondary="favourites_shops", back_populates="favourites")
    seller: Mapped["Seller"] = relationship(back_populates="user")
    
    
    
class Address(BaseModelMixin):
    __tablename__ = "addresses"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    address: Mapped[str] = mapped_column(nullable=False)
    is_default: Mapped[bool] = mapped_column(default=False)
    
    user: Mapped["User"] = relationship(back_populates="addresses")


class Seller(Base):
    __tablename__ = "seller"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    full_name: Mapped[int] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    person_type: Mapped[str] = mapped_column(nullable=False)
    inn: Mapped[str] = mapped_column(String(10, 12), nullable=False)
    ogrn: Mapped[str] = mapped_column(nullable=False)
    address: Mapped[str] = mapped_column(nullable=False)
    bic: Mapped[str] = mapped_column(nullable=False)
    checking_account: Mapped[str] = mapped_column(nullabe=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    user: Mapped["User"] = relationship(back_populates="seller")
    shop: Mapped[list["Shop"]] = relationship(back_populates="owner")


class ApplicationToSeller(BaseModelMixin):
    __tablename__ = "application_to_seller"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    full_name: Mapped[int] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    person_type: Mapped[str] = mapped_column(nullable=False)
    inn: Mapped[str] = mapped_column(String(10, 12), nullable=False)
    ogrn: Mapped[str] = mapped_column(nullable=False)
    address: Mapped[str] = mapped_column(nullable=False)
    bic: Mapped[str] = mapped_column(nullable=False)
    checking_account: Mapped[str] = mapped_column(nullabe=False)
    verdict: Mapped[str] = mapped_column(default=VerdictApplicationToBeSeller.PENDING.value, nullable=False)

    user: Mapped["User"] = relationship(back_populates="seller")

