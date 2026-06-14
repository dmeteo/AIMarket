import json
import uuid

import requests
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from yookassa import Payment, Webhook
from yookassa.domain.notification import WebhookNotificationEventType, WebhookNotificationFactory

from app.repositories.orders import get_order_by_payment_id
from app.common.enums import OrderStatus
from app.services.cart import delete_cart_items_service



def get_ngrok_url():
    tunnels = requests.get("http://127.0.0.1:4040/api/tunnels").json()["tunnels"]
    https_tunnel = next(t for t in tunnels if t["public_url"].startswith("https"))
    return https_tunnel["public_url"]


def create_webhook_url():
    return get_ngrok_url() + "/api/v1/payments/webhook"


def mapping_payment_structure(order_id, full_price):
    payment = {
        "amount": {
            "value": f"{full_price}",
            "currency": "RUB"
        },
        "payment_method_data": {
            "type": "bank_card"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": f"{get_ngrok_url()}/orders/{order_id}"
        },
        "description": f"Заказ №{order_id}"
    }
    
    return payment


def create_payment(order_id, full_price):
    idempotence_key = str(uuid.uuid4())
    payment = Payment.create(mapping_payment_structure(order_id, full_price), idempotency_key=idempotence_key)
    
    payment_id = payment.id
    confirmation_url = payment.confirmation.confirmation_url
    return payment_id, confirmation_url
    

def register_webhook_service():
    whUrl = create_webhook_url()
    needWebhookList = [
        WebhookNotificationEventType.PAYMENT_SUCCEEDED,
        WebhookNotificationEventType.PAYMENT_CANCELED
    ]

    whList = Webhook.list()
    
    for event in needWebhookList:
        hookIsSet = False
        for wh in whList.items:
            if wh.event != event:
                continue
            if wh.url != whUrl:
                Webhook.remove(wh.id)
            else:
                hookIsSet = True

        if not hookIsSet:
            Webhook.add({"event": event, "url": whUrl})
            
            
def payment_webhook_service(db: Session, body):
    try:
        event_json = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid body")
    
    try:
        notification_object = WebhookNotificationFactory().create(event_json)
        response_object = notification_object.object
        if notification_object.event == WebhookNotificationEventType.PAYMENT_SUCCEEDED:
            payment_id = response_object.id
            
            order = get_order_by_payment_id(db, payment_id)
            order.status = OrderStatus.CONFIRMED.value
            
            delete_cart_items_service(db, order.user_id)
            
            db.commit()
            db.refresh(order)
            
        elif notification_object.event == WebhookNotificationEventType.PAYMENT_CANCELED:
            payment_id = response_object.id

            order = get_order_by_payment_id(db, payment_id)
            order.status = OrderStatus.CANCELED.value 
            db.commit()
            db.refresh(order)
        
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)