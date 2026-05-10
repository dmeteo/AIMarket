from fastapi import APIRouter

from app.schemas.orders import Order, OrderRequest, OrderResponse, OrdersResponse


router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse)
def create_order(payload: OrderRequest) -> OrderResponse:
    pass


@router.get("/", response_model=OrdersResponse)
def get_user_orders() -> OrdersResponse:
    pass


@router.get("/{order_id}", response_model=Order)
def get_user_order(order_id: int) -> Order:
    pass