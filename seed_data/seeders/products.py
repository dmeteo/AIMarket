from pathlib import Path

BASE_URL = "/products"
MEDIA_URL = "/media/upload"


def upload_images(client, image_paths: list[str], images_dir: Path) -> list[str]:
    files = []
    for path in image_paths:
        full_path = images_dir / path
        if not full_path.exists():
            continue
        files.append(("files", (full_path.name, open(full_path, "rb"), "image/jpeg")))

    if not files:
        return []

    response = client.post(MEDIA_URL, params={"entity": "products"}, files=files)
    if response.status_code != 200:
        return []

    return response.json().get("full_urls", [])


def create_products(client, products, categories_map, brands_map, shops_map, images_dir: Path):
    for product in products:
        image_urls = upload_images(client, product.get("images", []), images_dir)

        if product["shop"] not in shops_map:
            continue
        client.post(BASE_URL, json={
            "title": product["title"],
            "description": product["description"],
            "price": product["price"],
            "quantity": product["quantity"],
            "discount_percent": product["discount"],
            "is_active": product["is_active"],
            "shop_id": shops_map[product["shop"]],
            "brand_id": brands_map.get(product["brand"]),
            "category_ids": [categories_map[c] for c in product["categories"] if c in categories_map],
            "image_urls": image_urls,
        })
