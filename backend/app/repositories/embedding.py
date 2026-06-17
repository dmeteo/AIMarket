from sqlalchemy.orm import Session
from sqlalchemy import delete, select, update

from app.models.embedding import ProductEmbedding
from app.models.product import Product


def create_embedding_product(db: Session, product_embedding):
    db.add(product_embedding)
    
    return product_embedding


def update_embedding_product(db: Session, product_id, embedding_vecs):
    stmt = update(ProductEmbedding).where(ProductEmbedding.product_id==product_id).values(embedding=embedding_vecs).returning(ProductEmbedding)
    
    product_embedded = db.scalar(stmt)
    
    return product_embedded


def delete_embedding_product(db: Session, product_id):
    stmt = delete(ProductEmbedding).where(ProductEmbedding.product_id==product_id).returning(ProductEmbedding)
    
    product_embedded = db.scalar(stmt)
    
    return product_embedded


def search_embeddings_products(db: Session, query_vector, min_price=None, max_price=None, limit=50):
    stmt = select(Product).join(ProductEmbedding)
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
        
    stmt = stmt.order_by(ProductEmbedding.embedding.op("<=>")(query_vector)).limit(limit)
    
    return db.scalars(stmt).all()