run: 
	docker compose up --build

down:
	docker compose down -v

alembic-migrate:
	cd backend && alembic revision --autogenerate -m "$(m)"

alembic-upgrade: 
	cd backend && alembic upgrade head

alembic-migrate-and-upgrade: alembic-migrate alembic-upgrade

alembic-downgrade:
	cd backend && alembic downgrade -1

export_openapi:
	cd backend && python -m scripts.export_openapi

run-detached:
	docker compose up --build -d

seed:
	cd seed_data && python seed.py

requirements:
	cd backend && pip freeze > requirements.txt

ngrok:
	ngrok http 8000

dev: ngrok run-detached