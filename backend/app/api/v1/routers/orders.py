from fastapi import APIRouter

from app.schemas.orders import Order, OrderRequest, OrderResponse, OrdersResponse


router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/preview", response_model=OrderPreviewResponse)
def preview_order(
    db: Annotated[Session, Depends(get_db)], 
    current_user: Annotated[User, Depends(get_current_user)],
    payload: OrderPreviewRequest
) -> OrderPreviewResponse:
    order_preview = order_preview_service(db, current_user, payload)
    
    return order_preview


@router.post("", response_model=OrderCreateResponse)
def create_order(
    db: Annotated[Session, Depends(get_db)], 
    current_user: Annotated[User, Depends(get_current_user)],
    payload: OrderCreateRequest
) ->  OrderCreateResponse:
    order = create_order_service(db, current_user, payload)
    
    return order


@router.get("", response_model=OrdersResponse)
def get_user_orders(
    db: Annotated[Session, Depends(get_db)], 
    current_user: Annotated[User, Depends(get_current_user)]
) -> OrdersResponse:
    orders = get_user_orders_service(db, current_user)
    
    return orders


@router.get("/{order_id}", response_model=Order)
def get_user_order(order_id: int) -> Order:
    pass