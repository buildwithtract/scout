.PHONY: install-tools start-docker start stop-docker stop sqlc migrate-up migrate-down db-dump

include .env

SHELL = /bin/sh

install-tools:
	go install github.com/pressly/goose/v3/cmd/goose@latest
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

start-docker:
	docker compose up -d
start: start-docker

stop-docker:
	docker compose down

stop: stop-docker

sqlc:
	sqlc generate --file db/sqlc.yaml

migrate-create:
	goose -dir db/migrations create $(name) sql

migrate-up:
	echo "Migrating up $(DATABASE_URL)"
	goose -dir db/migrations postgres $(DATABASE_URL) up
	make db-dump

migrate-down:
	echo "Migrating down $(DATABASE_URL)"
	goose -dir db/migrations postgres $(DATABASE_URL) down
	make db-dump

DB_DUMP_DATE := $(shell date +%Y%m%d%H%M%S)
DUMP_FILE := ${DB_DUMP_DATE}.sql

db-dump:
	@mkdir -p db/dumps
	@if command -v pg_dump > /dev/null; then \
		pg_dump --schema-only --no-owner $(DATABASE_URL) > db/dumps/${DUMP_FILE}; \
		pg_dump --inserts --data-only -t goose_db_version $(DATABASE_URL) >> db/dumps/${DUMP_FILE}; \
		cp db/dumps/${DUMP_FILE} db/schema.sql; \
		sed -i -e -r "s/INSERT INTO public.goose_db_version VALUES \(([0-9]+), ([0-9]+), (true|false), '(.*)'\);/INSERT INTO public.goose_db_version \(\"version_id\", \"is_applied\"\) VALUES \(\2, \3\);/g" db/schema.sql; \
		sed -i -e -r "s/SELECT pg_catalog.setval\('public.goose_db_version_id_seq', ([0-9]+), true\);//g" db/schema.sql; \
		rm db/schema.sql-e; \
	else \
		echo "pg_dump not found, skipping db-dump"; \
	fi


server-migrate-up:
	ssh root@157.180.79.13 'PS=$$(docker ps --filter "label=service=scout" --filter "label=role=web" --format "{{.Names}}"); docker exec -i $$PS make migrate-up'

server-migrate-down:
	ssh root@157.180.79.13 'PS=$$(docker ps --filter "label=service=scout" --filter "label=role=web" --format "{{.Names}}"); docker exec -i $$PS make migrate-down'

server-fetch/%:
	ssh root@157.180.79.13 'docker exec -i $$(docker ps --filter "label=service=scout" --filter "label=role=web" --format "{{.Names}}") bun run fetch $*'

server-fetch-all:
	ssh root@157.180.79.13 'docker exec -i $$(docker ps --filter "label=service=scout" --filter "label=role=web" --format "{{.Names}}") bun run fetch-all'
