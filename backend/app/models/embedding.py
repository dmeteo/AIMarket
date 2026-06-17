from pgvector.sqlalchemy import VECTOR, Vector
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ProductEmbedding(Base):
    __tablename__ = "products_embeddings"
    
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), primary_key=True, nullable=False)
    embedding: Mapped[Vector] = mapped_column(VECTOR(1024))
    
    product: Mapped["Product"] = relationship(back_populates="embedding")