from typing import Annotated

from fastapi import APIRouter, Depends, Request

from app.api.v1.deps import verify_yookassa_ip


router = APIRouter(prefix="/payments", tags=["webhook"])


@router.post("/webhook", response=200)
def payment_webhook(
    ip: Annotated[Request, Depends(verify_yookassa_ip)]
):
    pass