from pathlib import Path

BASE_URL = "/brands"
MEDIA_URL = "/media/upload"


def upload_logo(client, logo_path: str, images_dir: Path) -> str | None:
    if not logo_path:
        return None

    full_path = images_dir / logo_path
    if not full_path.is_file():
        return None

    files = [("files", (full_path.name, open(full_path, "rb"), "image/jpeg"))]
    response = client.post(MEDIA_URL, params={"entity": "avatars"}, files=files)
    if response.status_code != 200:
        return None

    urls = response.json().get("full_urls", [])
    return urls[0] if urls else None


def create_brands(client, brands, images_dir: Path):
    brands_map = {}

    for brand in brands:
        logo_url = upload_logo(client, brand.get("logo_url", ""), images_dir)

        response = client.post(BASE_URL, json={"title": brand["title"], "logo_url": logo_url})
        if response.status_code != 200:
            continue

        data = response.json()["brand"]
        brands_map[data["title"]] = data["id"]

    return brands_map
