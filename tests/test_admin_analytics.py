import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
import pytest
import requests

sys.path.append(str(Path(__file__).resolve().parents[1]))

from shared.client import APIClient
from tests.utils.utils import get_ngrok_url

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

ANALYTICS_URL = "/admin/analytics"


@pytest.fixture(scope="module")
def admin_client():
    base_url = f"{get_ngrok_url()}/api/v1"
    session = requests.Session()
    c = APIClient(base_url, timeout=20, session=session)

    r = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    token = r.json()["token"]["access_token"]
    c.session.headers.update({"Authorization": f"Bearer {token}"})

    yield c
    c.close()


def test_admin_analytics_structure(admin_client):
    r = admin_client.get(ANALYTICS_URL)
    assert r.status_code == 200, r.text

    data = r.json()
    for key in ("period", "summary", "sales_by_day", "status_distribution",
                "revenue_by_shop", "top_sellers", "top_products", "customers",
                "applications", "sales_by_category"):
        assert key in data, f"missing key: {key}"

    print("\n[ADMIN ANALYTICS]\n" + json.dumps(data, ensure_ascii=False, indent=2))


def test_admin_summary_fields(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    summary = r.json()["summary"]
    for key in ("total_revenue", "total_orders", "avg_order_value", "total_items_sold",
                "total_sellers", "total_buyers", "total_shops", "total_products"):
        assert key in summary, f"missing summary field: {key}"

    if summary["total_orders"]:
        expected = round(float(summary["total_revenue"]) / summary["total_orders"], 2)
        assert abs(float(summary["avg_order_value"]) - expected) < 0.01


def test_admin_revenue_by_shop_equals_total(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    data = r.json()
    shops_sum = sum(float(s["revenue"]) for s in data["revenue_by_shop"])
    assert abs(shops_sum - float(data["summary"]["total_revenue"])) < 0.01


def test_admin_customers_consistency(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    customers = r.json()["customers"]
    assert customers["total"] == customers["new"] + customers["returning"]


def test_admin_applications_consistency(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    apps = r.json()["applications"]
    assert apps["total"] == apps["pending"] + apps["approved"] + apps["rejected"]


def test_admin_top_sellers_sorted_and_limited(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    top = r.json()["top_sellers"]
    assert len(top) <= 10

    revenues = [float(s["revenue"]) for s in top]
    assert revenues == sorted(revenues, reverse=True)

    for seller in top:
        assert seller["seller_name"]  # имя не пустое
        assert {"seller_id", "shop_name", "orders"} <= set(seller)


def test_admin_top_products_sorted_and_limited(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    top = r.json()["top_products"]
    assert len(top) <= 10

    sales = [p["sales"] for p in top]
    assert sales == sorted(sales, reverse=True)


def test_admin_sales_by_category_percentage(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    data = r.json()
    total_revenue = float(data["summary"]["total_revenue"])
    if total_revenue == 0:
        pytest.skip("Нет выручки за период")

    for row in data["sales_by_category"]:
        expected = round(float(row["revenue"]) / total_revenue * 100, 1)
        assert abs(row["percentage"] - expected) < 0.1


def test_admin_custom_range(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"from": "2026-01-01", "to": "2026-12-31"})
    assert r.status_code == 200, r.text

    period = r.json()["period"]
    assert period["from"] == "2026-01-01"
    assert period["to"] == "2026-12-31"


def test_admin_analytics_forbidden_for_buyer(auth_client):
    r = auth_client.get(ANALYTICS_URL)
    assert r.status_code == 403, r.text
