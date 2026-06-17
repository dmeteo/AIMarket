from app.common.enums import OrderStatus, Role


ROLE_LABELS = {
    Role.BUYER: "Покупатель",
    Role.SELLER: "Продавец",
    Role.ADMIN: "Администратор",
    Role.MODERATOR: "Модератор",
}

ORDER_STATUS_LABELS = {
    OrderStatus.AWAITING_PAYMENT: "Ожидает оплаты",
    OrderStatus.IN_PROCESSING: "Ожидает подтверждения",
    OrderStatus.CONFIRMED: "Подтвержден",
    OrderStatus.AWAITING_DELIVERY: "Ожидает доставки",
    OrderStatus.DELIVERY: "Доставляется",
    OrderStatus.AWAIT_RECEIPT: "Ожидает получения",
    OrderStatus.RECEIVED: "Получен",
    OrderStatus.CANCELED: "Отменён",
}