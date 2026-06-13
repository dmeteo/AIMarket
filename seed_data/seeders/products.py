import requests

BASE_URL = "/products/"

def create_products(client: requests.Session, products, categories_map, brands_map, shops_map):
    
    for product in products:
        client.post(BASE_URL, json={
            "title": product["title"],
            "description": product["description"],
            "price": product["price"],
            "quantity": product["quantity"],
            "discount_percent": product["discount_percent"],
            "is_active": product["is_active"],
            "shop_id": shops_map[product["shop"]],
            "brand_id": brands_map.get(product["brand"]),
            "category_ids": [categories_map[c] for c in product["categories"]],
        })