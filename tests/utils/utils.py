import requests


def get_ngrok_url():
    tunnels = requests.get("http://127.0.0.1:4040/api/tunnels").json()["tunnels"]
    return next(t for t in tunnels if t["public_url"].startswith("https"))["public_url"]