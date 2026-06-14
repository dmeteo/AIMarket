from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.v1.deps import verify_yookassa_ip
from app.services.payment import payment_webhook_service
from app.core.database import get_db


router = APIRouter(prefix="/payments", tags=["webhook"])


@router.post("/webhook", status_code=200, dependencies=[Depends(verify_yookassa_ip)])
async def payment_webhook(
    db: Annotated[Session, Depends(get_db)],
    request: Request
):
    body = await request.body()
    payment_webhook_service(db, body)