import pytest
import requests

from shared.client import APIClient
from tests.test_order_flow import TEST_EMAIL, TEST_PASSWORD
from tests.utils.utils import get_ngrok_url


@pytest.fixture(scope="session")
def client():
    base_url = f"{get_ngrok_url()}/api/v1"
    session = requests.Session()
    c = APIClient(base_url, timeout=20, session=session)
    yield c
    c.close()


@pytest.fixture(scope="session")
def auth_client(client):
    client.post("/auth/register", json={
        "email": TEST_EMAIL,
        "name": "Test Buyer",
        "password": TEST_PASSWORD
    })
    r = client.post("/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    token = r.json()["token"]["access_token"]
    client.session.headers.update({"Authorization": f"Bearer {token}"})
    return client


@pytest.fixture(scope="session")
def order_id(auth_client):
    r = auth_client.post("/orders", json={
        "address": "г. Москва, ул. Тестовая, д. 1",
        "delivery_type": "CDEK"
    })
    data = r.json()
    print(f"\n[ORDER] id={data['order_id']} | оплатить: {data['payment_url']}")
    return data["order_id"]
