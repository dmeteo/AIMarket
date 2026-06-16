from FlagEmbedding import BGEM3FlagModel


model = BGEM3FlagModel('BAAI/bge-m3',  
                       use_fp16=True)


def get_embedding_model() -> BGEM3FlagModel:
    return model