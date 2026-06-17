from groq import Groq
from FlagEmbedding import BGEM3FlagModel

from app.core.config import settings


model = BGEM3FlagModel('BAAI/bge-m3',  
                       use_fp16=True)

client = Groq(
    api_key=settings.GROQ_API_KEY,
)


def get_embedding_model() -> BGEM3FlagModel:
    return model


def get_groq_client() -> Groq:
    return client
