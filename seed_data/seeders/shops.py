import requests

BASE_URL = "/shops/"

def create_shops(client: requests.Session, shops):
    shops_map = {}
    
    for shop in shops:
        response = client.post(BASE_URL, json={"title": shop["title"], "description": shop["description"]})
        if response.status_code != 200:
            continue
        
        response = response.json()
        shops_map[response["shop"]["title"]] = response["shop"]["id"]

    return shops_map