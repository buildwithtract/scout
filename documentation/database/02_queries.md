# Queries

If you're adding a query for a table that doesn't yet have any, create a new file in `db/queries/` called `[tablename].sql`. Add `queries/[tablename].sql` to the `sql` array in `./db/sqlc.yaml`.

To create a query, you need to add a comment above it in the following format:

```sql
-- name: [query-name] :[query-type]
```

Query types:

- `:one` - A single row
- `:many` - A list of rows
- `:exec` - A query that doesn't return anything
- `:execresult` - A query that returns a result

In addition, query names should be in the following format (this is cosmetic only):

- `Get[TableName]` - A query that returns a single row
- `Get[TableName]s` - A query that returns a list of rows
- `Insert[TableName]` - A query that inserts a row
- `Update[TableName]` - A query that updates a row
- `Upsert[TableName]` - A query that upserts a row
- `Delete[TableName]` - A query that deletes a row
- `Refresh[TableName]MaterializedView` - A query that refreshes a materialized view
- `Get[TableName]InMvt` - A query that returns a list of rows in MVT format
- `Get[TableName]LatestImport` - A query that returns the latest import date for a table

Whenever you make a change in `./db/queries`, run `make sqlc` to generate the Typescript query in the `./src/db/generated` directory.
