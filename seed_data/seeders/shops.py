from pathlib import Path

BASE_URL = "/shops"
MEDIA_URL = "/media/upload"


def upload_logo(client, logo_path: str, images_dir: Path) -> str | None:
    full_path = images_dir / logo_path
    if not full_path.exists():
        return None

    files = [("files", (full_path.name, open(full_path, "rb"), "image/jpeg"))]
    response = client.post(MEDIA_URL, params={"entity": "avatars"}, files=files)
    if response.status_code != 200:
        return None

    urls = response.json().get("full_urls", [])
    return urls[0] if urls else None


def create_shops(client, shops, images_dir: Path):
    shops_map = {}

    for shop in shops:
        logo_url = upload_logo(client, shop.get("logo_url", ""), images_dir)

        response = client.post(BASE_URL, json={"title": shop["title"], "description": shop["description"], "logo_url": logo_url})
        if response.status_code != 200:
            continue

        data = response.json()["shop"]
        shops_map[data["title"]] = data["id"]

    return shops_map
