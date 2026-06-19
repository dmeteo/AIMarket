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

ANALYTICS_URL = "/shops/me/analytics"


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


def test_analytics_structure(admin_client):
    r = admin_client.get(ANALYTICS_URL)
    assert r.status_code == 200, r.text

    data = r.json()
    for key in ("period", "summary", "sales_by_day", "status_distribution",
                "top_products", "revenue_by_shop", "customers"):
        assert key in data, f"missing key: {key}"

    assert "from" in data["period"] and "to" in data["period"]
    print("\n[ANALYTICS]\n" + json.dumps(data, ensure_ascii=False, indent=2))


def test_analytics_summary_consistency(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    summary = r.json()["summary"]
    assert float(summary["delivery_cost_total"]) == 0

    if summary["total_orders"]:
        expected = round(float(summary["total_revenue"]) / summary["total_orders"], 2)
        assert abs(float(summary["avg_order_value"]) - expected) < 0.01
    else:
        assert float(summary["avg_order_value"]) == 0


def test_analytics_custom_range(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"from": "2026-01-01", "to": "2026-12-31"})
    assert r.status_code == 200, r.text

    period = r.json()["period"]
    assert period["from"] == "2026-01-01"
    assert period["to"] == "2026-12-31"


def test_analytics_top_products_sorted_and_limited(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    top = r.json()["top_products"]
    assert len(top) <= 10

    sales = [p["sales"] for p in top]
    assert sales == sorted(sales, reverse=True)


def test_analytics_revenue_by_shop_equals_total(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    data = r.json()
    shops_sum = sum(float(s["revenue"]) for s in data["revenue_by_shop"])
    assert abs(shops_sum - float(data["summary"]["total_revenue"])) < 0.01


def test_analytics_customers_consistency(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    customers = r.json()["customers"]
    assert customers["total"] == customers["new"] + customers["returning"]


def test_analytics_status_distribution_rows(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"period": "year"})
    assert r.status_code == 200, r.text

    for row in r.json()["status_distribution"]:
        assert {"code", "label", "count"} <= set(row)
        assert row["count"] >= 1
        assert row["label"] != row["code"]


def test_analytics_foreign_shop_forbidden(admin_client):
    r = admin_client.get(ANALYTICS_URL, params={"shop_ids": "999999"})
    assert r.status_code == 403, r.text


def test_analytics_forbidden_for_buyer(auth_client):
    r = auth_client.get(ANALYTICS_URL)
    assert r.status_code == 403, r.text
