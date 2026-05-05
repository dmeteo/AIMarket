from fastapi import FastAPI


app = FastAPI(title="AIMarket")

@app.get("/health")
def health_check():
    return {"status": "ok"}