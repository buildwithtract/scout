# CLAUDE.md — Scout

## What this is

Scout is a Next.js 15 app (Bun runtime) that serves an interactive GB planning/infrastructure/environmental-constraints map. It has two jobs:

1. **Serve the map.** A single-page app at `/` (React, deck.gl + `@vis.gl/react-google-maps`) with a sidebar legend. Map tiles are served as MVT (Mapbox Vector Tiles) from the Next.js app itself at `/api/mvt/datasets/[key]/[z]/[x]/[y]/route.ts` — no separate tile server.

2. **Ingest data.** 64 TypeScript fetcher classes (`src/fetchers/`) pull geographic data from data.gov.uk, six UK DNO APIs, Natural England, OpenStreetMap, and the Environment Agency into PostGIS. Fetchers are invoked via `bin/fetch.ts` / `bin/fetch-all.ts`.

**Repo:** `buildwithtract/scout`, branch `master`. **Maintainer:** Maxx.
**Live:** https://scout.britishprogress.org, https://scout.buildwithtract.com

---

## Architecture

```
Browser
  └─ Next.js 15 (Bun runtime, port 80 in prod)
       ├─ src/app/page.tsx          ← single-page map UI (client component)
       ├─ src/app/data/page.tsx     ← data inventory page
       ├─ src/app/up/route.ts       ← health-check endpoint
       └─ src/app/api/mvt/datasets/[key]/[z]/[x]/[y]/route.ts
              ↓ calls sqlc-generated query
       PostgreSQL 17 + PostGIS 3.5  (prod: Kamal accessory `scout-db`, 127.0.0.1:5432)
              ↑ populated by
       bin/fetch.ts / bin/fetch-all.ts
              ↑ imports
       src/fetchers/*.ts  (64 classes, each fetches one external dataset)
```

**DB client in Next.js routes:** use `getCompatibleClient()` from `src/db/connection-pool.ts`, always in a `try/finally` with `(client as any).release()`. The singleton pattern (`src/db/singleton-client.ts`) is only for long-running fetcher processes — do not use it in API routes or server components.

**Map config:**
- Layer IDs and styling: `src/components/googlemap/config.ts` (`MapSourceId` enum, `mapSourcesBase`, `mapSourcesMvt`, legend groups)
- Per-layer minimum zoom: `src/config/map-sources.ts` (`minZoomsScout`)
- MVT dataset → DB query dispatch: `src/app/api/mvt/datasets/[key]/[z]/[x]/[y]/queries.ts` (`Dataset` enum, `getDataset` function)
- All exports shared with the map: `src/db/index.ts` (re-exports every generated query module)

---

## Stack

| Concern | Tool |
|---|---|
| Runtime | Bun 1.2.13 |
| Framework | Next.js 15.5.9 |
| Language | TypeScript 5 |
| Map rendering | deck.gl 9 + `@vis.gl/react-google-maps` 1.5 |
| DB | PostgreSQL 17 + PostGIS 3.5 (`postgis/postgis:17-3.5` image) |
| DB access (app) | `pg` + sqlc-generated typed queries |
| DB migrations | Goose (Go binary, bundled into Docker image from `golang:1.24-alpine`) |
| Type-safe SQL | sqlc (`db/sqlc.yaml`, WASM plugin `sqlc-gen-typescript 0.1.3`) |
| Deployment | Kamal 2.x → Docker → Hetzner VPS `157.180.79.13` |
| Container registry | `ghcr.io/buildwithtract/scout` |
| Secrets | Freddie's Bitwarden Secrets Manager → **migrating to CBP Infisical** |
| Package manager | Bun (use `bun install`, not npm/yarn/pnpm) |

---

## Conventions

### sqlc workflow

- SQL queries live in `db/queries/<tablename>.sql`, one file per table.
- Every query must have a `-- name: QueryName :type` comment (types: `:one`, `:many`, `:exec`, `:execresult`).
- After any change to `db/queries/*.sql`, run `make sqlc` to regenerate `src/db/generated/`.
- Register the new query file in `db/sqlc.yaml` under the `sql[0].queries` list.
- Re-export the generated module from `src/db/index.ts`.
- `db/schema.sql` is **auto-generated** by `make migrate-up` / `make migrate-down` (via `pg_dump --schema-only`). **Never hand-edit it.**

### Goose migrations

- Migration files live in `db/migrations/`, named `<timestamp>_<description>.sql`.
- Create with: `make migrate-create name=<description>` (wraps `goose create`).
- Apply locally: `make migrate-up` (reads `DATABASE_URL` from `.env`; also regenerates `db/schema.sql`).
- Apply in prod: `make server-migrate-up` (SSHes into prod, exec into the running web container).
- Roll back: `make migrate-down` / `make server-migrate-down`.

### Adding a new data layer (full guide: `documentation/new_layer.md`)

1. Write a Goose migration in `db/migrations/` to create the table.
2. Add SQL queries to `db/queries/<table>.sql`; run `make sqlc`.
3. Re-export from `src/db/index.ts`.
4. Add `Dataset` entry + `getDataset` case in `src/app/api/mvt/datasets/[key]/[z]/[x]/[y]/queries.ts`.
5. Add `MapSourceId` entry + layer config in `src/components/googlemap/config.ts`.
6. Add min-zoom in `src/config/map-sources.ts` (`minZoomsScout`).
7. Add to `MapSourceOrder` array in the config.
8. Write a fetcher class in `src/fetchers/` and register it in `bin/fetch.ts`.

### Fetchers

- Each fetcher extends a base class; implements at minimum `get name()`, `fetchIfRequired()` (checks `last_imported_at` before re-fetching).
- Fetchers use a dedicated `pg.Client` (not the connection pool) — they are long-running processes.
- Memory-intensive fetchers (e.g. flood risk zones) use `MemoryAwareBatchProcessor` — see `documentation/memory-optimization.md`.
- Run via: `bun run fetch <name>` (one), `bun run fetch-all` (all), `bun run list-fetchers` (list).
- Prod: `make server-fetch/<name>` or `make server-fetch-all` (SSH + docker exec into the live web container).

### Bun specifics

- Always `bun install` (not npm). `bun.lock` is committed.
- `@types/bun` is a dev dependency; Bun-native APIs (`Bun.file`, etc.) are available in fetcher/bin scripts.
- Scripts: `dev`, `build`, `start`, `lint`, `fetch`, `fetch-all`, `list-fetchers` (see `package.json`).

### No tests

There are no automated tests in this repo. Verify changes manually by running locally and checking in a browser.

---

## Non-obvious gotchas

1. **`db/schema.sql` is auto-generated.** It is overwritten on every `make migrate-up` / `migrate-down`. Never edit it directly.

2. **sqlc must be re-run after any SQL query change.** Forgetting `make sqlc` means the TypeScript types are stale and the build may fail silently or at runtime.

3. **`make sqlc` must list the query file in `db/sqlc.yaml`.** If you add a new `.sql` file and forget to register it, sqlc silently skips it.

4. **`src/db/index.ts` must re-export every generated module.** New generated files are not auto-exported.

5. **`kamal secrets extract` is unreliable on Kamal 2.7.x.** If a secret appears blank during deploy, check it directly via `bws secret get <id>`. Known upstream issue.

6. **The Postgres password is in plaintext in `config/deploy.yml` (git).** `DATABASE_URL` is in the `env.clear` block and `POSTGRES_PASSWORD` is in the accessory `env.clear`. Low-risk (DB is `127.0.0.1` only). Scheduled to move to Infisical — see the secrets migration runbook.

7. **`NEXT_PUBLIC_GIT_SHA` in `config/deploy.yml` is literally `TODO`.** It should be wired to `$KAMAL_VERSION`.

8. **`documentation/new_layer.md` step 1 is wrong.** It says to edit `db/schema.sql` directly. The correct flow is to create a Goose migration. The doc is flagged with a `TODO` note.

9. **`make server-fetch/<name>` SSHes to prod and runs inside the live container.** This touches the live database. Confirm before running.

10. **`make server-migrate-up` / `server-migrate-down` also run against prod.** They exec into the live web container, which has the Goose binary from the Docker image. `db/schema.sql` is not updated after a prod migration (only after local `make migrate-up`).

11. **No staging environment.** Every `kamal deploy` goes directly to production.

12. **The map uses Google Maps, not Mapbox** — `@vis.gl/react-google-maps` with deck.gl overlays. The API key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) must have Maps JavaScript API enabled and be HTTP-referrer-restricted to `scout.britishprogress.org` and `scout.buildwithtract.com`. This key is on Freddie's personal Google Cloud account and must move to a CBP account.

13. **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is baked into the Docker image at build time** (via `--mount=type=secret` in the Dockerfile). Rotating the key requires a full `kamal deploy`, not just a container restart.

14. **The singleton DB client (`src/db/singleton-client.ts`) is only for fetcher scripts.** Do not use it in Next.js API routes or server components — use `getCompatibleClient()` from `src/db/connection-pool.ts` with `try/finally` release. See `documentation/MIGRATION_TO_CONNECTION_POOL.md`.

---

## Deployment

**Tool:** Kamal 2.x. Config: `config/deploy.yml`. Secrets: `.kamal/secrets` (currently reads from Freddie's Bitwarden; migrating to Infisical — see runbook below).

```bash
# From microsites/scout, with secrets available:
kamal deploy          # build + push image + deploy to 157.180.79.13
kamal rollback        # restore previous image
kamal app logs        # tail logs from running container
kamal accessory start scout-db   # start DB container if stopped
```

**Build:** Kamal builds the image on the Hetzner server itself (builder is `ssh://root@157.180.79.13`), not the local machine. Secrets are injected as Docker BuildKit secrets at image build time.

**Secrets file:** `.kamal/secrets` is a shell script that Kamal sources before deploy. It currently calls:
```bash
SECRETS=$(kamal secrets fetch --adapter bitwarden-sm --account freddie.poser@gmail.com <vault-id>/all)
```
This only works on Freddie's machine with `BWS_ACCESS_TOKEN` in `.env`.

**After secrets migration:** `.kamal/secrets` will call Infisical with a machine identity. See runbook: `CBP/handover/HANDOVER_SECRETS_MIGRATION.md`, Part D, including the replacement `.kamal/secrets` file in the Appendix.

**Server access:**
```bash
ssh root@157.180.79.13
docker ps                          # list containers; scout web = label service=scout role=web
docker logs <container> -f         # stream logs
```

---

## Environment variables

All required vars are in `.env.example`. Copy to `.env` for local dev.

| Variable | Purpose | Current location | After migration |
|---|---|---|---|
| `DATABASE_URL` | Postgres connection string | `.env` (local) / `config/deploy.yml` `env.clear` (prod — **in git**) | Infisical `scout/prod` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | DB container config | `.env` (local) / `config/deploy.yml` `accessories.db.env.clear` (**in git**) | `POSTGRES_PASSWORD` → Infisical |
| `KAMAL_REGISTRY_PASSWORD` | GitHub token to push/pull container images | Freddie's Bitwarden | Infisical `scout/prod` |
| `JWT_SECRET_KEY` | Scout auth token signing | Freddie's Bitwarden | Infisical `scout/prod` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JS API key (baked into image at build) | Freddie's Bitwarden / personal Google Cloud | Infisical + CBP Google Cloud |
| `DNOS_ENW_API_KEY` | Electricity North West API | Freddie's Bitwarden | Infisical `scout/prod` |
| `DNOS_UKPN_API_KEY` | UK Power Networks API | Freddie's Bitwarden | Infisical `scout/prod` |
| `DNOS_NGED_API_KEY` | National Grid Electricity Distribution API | Freddie's Bitwarden | Infisical `scout/prod` |
| `DNOS_NPG_API_KEY` | Northern Powergrid API | Freddie's Bitwarden | Infisical `scout/prod` |
| `DNOS_SPEN_API_KEY` | SP Energy Networks API | Freddie's Bitwarden | Infisical `scout/prod` |
| `DNOS_SSEN_API_KEY` | Scottish & Southern Electricity Networks API | Freddie's Bitwarden | Infisical `scout/prod` |
| `KAMAL_VERSION` | Git SHA / version, set by Kamal at build | Auto (Kamal) | — |
| `GOOSE_MIGRATION_DIR` | Migration dir for Goose CLI | `./db/migrations` (set in `.env`) | — |
| `GOOSE_TABLE` | Goose version table name | `public.goose_db_version` | — |

**Secrets migration runbook:** `CBP/handover/HANDOVER_SECRETS_MIGRATION.md`

---

## Common tasks

### Add a new data layer

Follow `documentation/new_layer.md` (but see gotcha #8 — step 1 is wrong; use a Goose migration, not direct schema edits). Summary:
1. `make migrate-create name=add_<table>` → write SQL in `db/migrations/<timestamp>_add_<table>.sql` → `make migrate-up`
2. Write SQL queries in `db/queries/<table>.sql` → register in `db/sqlc.yaml` → `make sqlc` → re-export in `src/db/index.ts`
3. Wire up the MVT route (`queries.ts` `Dataset` enum + `getDataset`)
4. Wire up map config (`config.ts` `MapSourceId` + styling, `map-sources.ts` min-zoom, `MapSourceOrder`)
5. Write a fetcher in `src/fetchers/` → register in `bin/fetch.ts`
6. Test locally: `bun run fetch <name>` then `bun run dev`
7. `kamal deploy`, then `make server-fetch/<name>` or `make server-migrate-up` as needed

### Run a fetcher

Locally:
```bash
bun run fetch ext-datagovuk-green-belt
bun run fetch-all
bun run list-fetchers          # show all names; --json for machine-readable
```

On production:
```bash
make server-fetch/ext-datagovuk-green-belt
make server-fetch-all
```

### Create and run a migration

```bash
make migrate-create name=add_some_column    # creates db/migrations/<ts>_add_some_column.sql
# edit the file
make migrate-up                              # applies + regenerates db/schema.sql
make server-migrate-up                       # apply on prod (SSHes into live container)
```

### Deploy

```bash
kamal deploy          # build image on Hetzner, push to ghcr.io, restart containers
kamal rollback        # revert to previous image
```

Precondition: `microsites/scout/.env` must have a valid `BWS_ACCESS_TOKEN` (Bitwarden) or `INFISICAL_CLIENT_ID` / `INFISICAL_CLIENT_SECRET` (Infisical, after migration).

### Regenerate sqlc types

```bash
make sqlc             # reads db/sqlc.yaml, writes src/db/generated/
```

### Inspect the production database

```bash
ssh root@157.180.79.13
docker exec -it $(docker ps --filter "label=service=scout-db" --format "{{.Names}}") psql -U postgres -d postgres
```

### Dump the local schema

```bash
make db-dump          # writes db/dumps/<timestamp>.sql and updates db/schema.sql
```

---

## Working in this repo — instructions for the agent

1. Ask the user when anything is unclear — prefer one extra question over shipping the wrong thing. In particular, always confirm before running fetchers, migrations, or deploys against production.
2. Keep this CLAUDE.md and the README current as part of every change. New env var → update the env table in both files. New gotcha → add it to the gotchas list. New external service → update the secrets table in README. User-facing layer or feature change → update the README "What this project does" section.
3. Test before declaring done. For UI changes, run `bun run dev` and check in a browser. For fetcher or migration changes, test against the local database. If you cannot test something (e.g. a production-only path), say so explicitly.
4. Match existing conventions. Before adding a fetcher, read a neighbouring one. Before writing a query, read neighbouring queries and the `02_queries.md` doc. Before adding a layer, read `new_layer.md` and existing config entries.
5. Don't add scope. Fix what was asked; no drive-by refactors. The singleton→pool migration, the `db/schema.sql` `TODO` in `new_layer.md`, and the `NEXT_PUBLIC_GIT_SHA: TODO` in `deploy.yml` are known issues — don't fix them unless asked.
6. Be careful with deployment, secrets, and shared state. Confirm before running `kamal deploy`, `make server-migrate-up/down`, `make server-fetch-all`, or any command that touches the live Hetzner server or live database. Rotating a secret (especially `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` or `JWT_SECRET_KEY`) requires a full redeploy.
