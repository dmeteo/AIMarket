from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.api import router as v1_router
from app.core.storage import create_buckets
from app.core.init_data import create_admin, init_yookassa
from app.services.payment import get_ngrok_url, register_webhook_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_buckets()
    create_admin()
    init_yookassa()
    print(get_ngrok_url(), flush=True)
    # register_webhook_service()
    yield


app = FastAPI(title="AIMarket", lifespan=lifespan)
app.include_router(v1_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}