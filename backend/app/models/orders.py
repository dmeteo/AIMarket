from datetime import date
from decimal import Decimal

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BaseModelMixin
from app.common.enums import DeliveryType, OrderStatus


class Order(BaseModelMixin):
    __tablename__ = "orders"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    payment_id: Mapped[str | None] = mapped_column(nullable=True)
    address: Mapped[str] = mapped_column(nullable=False)
    delivery_type: Mapped[str] = mapped_column(nullable=False)
    delivery_cost: Mapped[Decimal] = mapped_column(nullable=False)
    predicted_date: Mapped[date | None] = mapped_column(nullable=True)
    items_total_price: Mapped[Decimal] = mapped_column(nullable=False)
    final_price: Mapped[Decimal] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(default=OrderStatus.AWAITING_PAYMENT.value, nullable=False)
    
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order")
    
    
class OrderItem(Base):
    __tablename__ = "order_item"
    
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), primary_key=True)
    quantity: Mapped[int] = mapped_column(default=1, nullable=False)
    price_at_purchase: Mapped[Decimal] = mapped_column(nullable=False)
    
    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()