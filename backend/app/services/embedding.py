from app.core.ai import get_embedding_model
from app.models.embedding import ProductEmbedding
from app.repositories.embedding import create_embedding_product, delete_embedding_product, update_embedding_product


def embedding_text(text):
    embedding_model = get_embedding_model()
    embedded_vecs = embedding_model.encode(text)["dense_vecs"]
    
    return embedded_vecs


def embedding_product_service(db, product_id, title, description, price, categories):
    categories_title= ", ".join(c.title for c in categories)
    text = f"{title}. {description}. Категории: {categories_title}. Цена {price} руб"
    
    embedded_vecs = embedding_text(text)
    
    create_embedding_product(db, ProductEmbedding(product_id=product_id,
                                              embedding=embedded_vecs))
    
    
def update_embedding_product_service(db, product_id, title, description, price, categories):
    categories_title= ", ".join(c.title for c in categories)
    text = f"{title}. {description}. Категории: {categories_title}. Цена {price} руб"
    
    embedded_vecs = embedding_text(text)
    
    update_embedding_product(db, product_id, embedded_vecs)
    
    
def delete_embedding_product_service(db, product_id):
    delete_embedding_product(db, product_id)