import json

from app.main import app

with open("../docs/openapi.json", "w", encoding="utf-8") as file:
    json.dump(app.openapi(), file, ensure_ascii=False, indent=2)
