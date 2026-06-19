import requests

BASE_URL = "/categories"

def create_categories(client: requests.Session, categories):
    categories_map = {}

    for category in categories:
        response = client.post(BASE_URL, json={"title": category})
        if response.status_code == 422:
            print(category)
        if response.status_code != 200:
            continue

        response = response.json()
        categories_map[response["category"]["title"]] = response["category"]["id"]

    return categories_map