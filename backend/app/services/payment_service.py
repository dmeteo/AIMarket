import uuid

from yookassa import Payment


def mapping_payment_structure(id, full_price):
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
            "return_url": "https://www.example.com/return_url"
        },
        "description": f"Заказ №{id}"
    }
    
    return payment


def create_payment(order_id, full_price):
    idempotence_key = str(uuid.uuid4())
    payment = Payment.create(mapping_payment_structure(order_id, full_price), idempotency_key=idempotence_key)
    
    payment_id = payment.id
    confirmation_url = payment.confirmation.confirmation_url
    return payment_id, confirmation_url