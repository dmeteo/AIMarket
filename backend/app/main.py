from fastapi import FastAPI

from app.api.v1.api import router as v1_router
from app.core.storage import create_buckets


from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_buckets()
    yield


app = FastAPI(title="AIMarket", lifespan=lifespan)
app.include_router(v1_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}