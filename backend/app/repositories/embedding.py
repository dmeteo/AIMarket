from sqlalchemy.orm import Session
from sqlalchemy import delete, update

from app.models.embedding import ProductEmbedding


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
    