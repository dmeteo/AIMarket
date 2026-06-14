import sys
from pathlib import Path
import time

from dotenv import load_dotenv
import pytest

sys.path.append(str(Path(__file__).resolve().parents[1]))

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)

PRODUCT_ID = 1
TEST_EMAIL = "flow_test@gmail.com"
TEST_PASSWORD = "123123"


def test_register(client):
    r = client.post("/auth/register", json={
        "email": TEST_EMAIL,
        "name": "Test Buyer",
        "password": TEST_PASSWORD
    })
    assert r.status_code in (200, 409), r.text



def test_login(auth_client):
    r = auth_client.post("/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    assert r.status_code == 200
    assert "access_token" in r.json()["token"]


def test_add_to_cart(auth_client):
    r = auth_client.post("/cart/items", json={"product_id": PRODUCT_ID, "quantity": 2})
    assert r.status_code == 200, r.text


def test_get_cart(auth_client):
    r = auth_client.get("/cart/")
    assert r.status_code == 200
    cart = r.json()
    assert len(cart["items"]) > 0
    print(f"\nКорзина: {len(cart['items'])} товара | Сумма без скидки: {cart['total_price']} | Скидка: {cart['total_discount']} | Итого: {cart['final_price']}")


def test_order_preview(auth_client):
    r = auth_client.post("/orders/preview", json={
        "address": "г. Москва, ул. Тестовая, д. 1",
        "delivery_type": "CDEK"
    })
    assert r.status_code == 200, r.text
    preview = r.json()
    assert int(preview["delivery_cost"]) == 250
    assert preview["predicted_date"] is not None
    print(f"\nПревью: доставка={preview['delivery_cost']} | итого={preview['final_price']} | дата={preview['predicted_date']}")


def test_create_order(order_id, auth_client):
    r = auth_client.get(f"/orders/{order_id}")
    assert r.status_code == 200, r.text
    order = r.json()
    assert "order_id" in r.json() or order is not None
    print(f"\nЗаказ создан: id={order_id}")


def test_get_order(auth_client, order_id):
    r = auth_client.get(f"/orders/{order_id}")
    assert r.status_code == 200, r.text
    order = r.json()
    assert order["status"] == "AWAITING_PAYMENT"
    print(f"\nСтатус заказа #{order_id}: {order['status']}")


def test_get_orders_list(auth_client):
    r = auth_client.get("/orders/")
    assert r.status_code == 200, r.text
    orders = r.json()["orders"]
    assert len(orders) > 0
    print(f"\nВсего заказов: {len(orders)}")


def test_payment_status(auth_client, order_id):
    for i in range(30):
        r = auth_client.get(f"/orders/{order_id}")
        status = r.json()["status"]
        print(f"\n[{i*5}s] Статус заказа #{order_id}: {status}")
        if status == "CONFIRMED":
            return
        time.sleep(5)
    pytest.fail("Статус не изменился за 150 секунд")

