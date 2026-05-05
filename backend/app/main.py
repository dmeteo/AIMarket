from fastapi import FastAPI

from app.api.v1.api import router as v1_router


app = FastAPI(title="AIMarket")
app.include_router(v1_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}