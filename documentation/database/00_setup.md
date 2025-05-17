# Database Setup

## Setup

We run PostgreSQL in Docker. To start the container, first make sure the values in [db/.env](../../db/.env) are what you want. Then run the following command:

```bash
docker compose up -d
```

This will build the image and start the container that is defined in [docker-compose.yml](../../docker-compose.yml).

You now have a new database called `scout` which you can connect to using the following command:

```bash
docker compose exec db psql -U postgres -d scout
```

Next, we apply the schema:

```bash
cat db/schema.sql | psql -d postgres://postgres:postgres@localhost:5432/scout
```

Check that the tables were created successfully by running the following command:

```bash
docker compose exec db psql -U postgres -d scout -c "\dt"
```

## Stopping the container

To stop the container, run the following command:

```bash
docker compose down
```

## Deleting the local database

To delete the local database, run the following command to stop the container and remove the volume:

```bash
docker compose down -v
```

You should see the following output:

```
 ✔ Container scout-db-1              Removed
 ✔ Volume scout_scout-postgres-data  Removed
 ✔ Network scout_default             Removed
```

Check that the volume was removed by running the following command:

```bash
docker volume ls
```

# todo

stuff about init-schema.sql

stuff about kamal remove and kamal setup
