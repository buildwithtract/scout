# Adding a New Map Layer

Adding a new map layer to Scout involves several steps, from database schema to frontend configuration. Here's a comprehensive guide:

## 1. Create a Database Table

We keep each layer in a separate table in the database. So step one is to create a new table with a migration. We use Goose for migrations. We have a command in the Makefile to create a new migration. Run it like so:

```bash
make migrate-create name=create_nged_table
```

This creates a new migration file in the `db/migrations` directory called `20250607153000_create_nged_table.sql`. It looks like this:

```sql
-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
```

The up section contains the operations we want to perform. In this case, creating the table plus any associated indexes, triggers, etc. The down section contains the operations we would perform to reverse the up section.
