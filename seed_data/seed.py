import json
from pathlib import Path
import os
import sys

sys.path.append("..")

import requests
from dotenv import load_dotenv

from shared.client import APIClient
from seeders.categories import create_categories
from seeders.brands import create_brands
from seeders.shops import create_shops
from seeders.products import create_products


ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)

BASE_URL = "https://dainty-icky-passage.ngrok-free.dev/api/v1"
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

session = requests.Session()
client: requests.Session = APIClient(BASE_URL, timeout=20, session=session)

token = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}).json()["token"]["access_token"]
session.headers.update({"Authorization": f"Bearer {token}"})

data = json.load(open("data.json", encoding="utf-8"))

images_dir = Path(__file__).resolve().parent / "images"

categories_map = create_categories(client, data["categories"])
brands_map = create_brands(client, data["brands"], images_dir)
shops_map = create_shops(client, data["shops"], images_dir)
create_products(client, data["products"], categories_map, brands_map, shops_map, images_dir)
