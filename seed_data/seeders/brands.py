import requests

BASE_URL = "/brands/"

def create_brands(client: requests.Session, brands):
    brands_map = {}
    
    for brand in brands:
        response = client.post(BASE_URL, json={"title": brand["title"]})
        if response.status_code != 200:
            continue
        
        response = response.json()
        brands_map[response["brand"]["title"]] = response["brand"]["id"]
    
    return brands_map