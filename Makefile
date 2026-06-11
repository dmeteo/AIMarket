run: 
	docker compose up --build

alembic-migrate:
	cd backend && alembic revision --autogenerate -m "$(m)"

alembic-upgrade: 
	cd backend && alembic upgrade head

alembic-migrate-and-upgrade: alembic-migrate alembic-upgrade

alembic-downgrade:
	alembic downgrade -1

export_openapi:
	cd backend && python -m scripts.export_openapi