from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.models.base import Base, BaseModelMixin


class Cart(BaseModelMixin):
    __tablename__ = "carts"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    items: Mapped[list["CartItem"]] = relationship(back_populates="cart")
    

class CartItem(Base):
    __tablename__ = "cart_items"
    
    cart_id: Mapped[int] = mapped_column(ForeignKey("carts.id"), primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), primary_key=True)
    quantity: Mapped[int] = mapped_column(default=1, nullable=False)
    
    cart: Mapped["Cart"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()
    
    @validates("quantity")
    def validate_quantity(self, key, quantity):
        if quantity < 1:
            raise ValueError("Quantity was ge 1")
        
        return quantity