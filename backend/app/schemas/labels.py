from app.schemas.enums import OrderStatus


ORDER_STATUS_LABELS = {
    OrderStatus.IN_PROCESSING: "Ожидает подтверждения",
    OrderStatus.CONFIRMED: "Подтвержден",
    OrderStatus.AWAITING_DELIVERY: "Ожидает доставки",
    OrderStatus.DELIVERY: "Доставляется",
    OrderStatus.AWAIT_RECEIPT: "Ожидает получения",
    OrderStatus.RECEIVED: "Получен",
}