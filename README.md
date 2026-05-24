# Scout

Scout is an interactive map of GB planning, infrastructure, and environmental constraints. It lets you see, on a single map, dozens of overlapping designations — flood zones, green belt, conservation areas, listed buildings, electricity grid infrastructure, agricultural land grades, and much more. It is built and maintained in partnership with [Tract](https://buildwithtract.com).

**Live at:** https://scout.britishprogress.org and https://scout.buildwithtract.com
**Repo:** `buildwithtract/scout` (default branch: `master`)
**Stack:** Next.js 15 · TypeScript · deck.gl + Google Maps · PostgreSQL 17 + PostGIS · deployed with Kamal on a Hetzner server
**Maintainer:** Maxx

---

## What this project does

Scout has two parts:

1. **The map.** A full-screen interactive map (built on Google Maps + deck.gl) where users can toggle on any combination of layers — planning designations from data.gov.uk, electricity distribution-network-operator (DNO) infrastructure lines and substations, Environmental Agency flood and agricultural-land data, OpenStreetMap features, and more. Active-layer state is stored in the URL so you can share a specific view.

2. **Data fetchers.** About 64 background scripts (in `src/fetchers/`) that pull data from data.gov.uk, the six UK electricity DNOs, Natural England, and OpenStreetMap into a PostGIS (geographic) database. Each fetcher is a TypeScript class; you run them manually or via Makefile helpers.

Map tiles are served from the Next.js app itself as MVT (Mapbox Vector Tile) tiles via the `/api/mvt/...` API route — there is no separate tile server.

---

## How to make changes

You do not need to be a developer to direct changes. Open a conversation in Claude Code and describe what you want. Good things to ask:

- "Add a new map layer for X — it's available on data.gov.uk as a GeoJSON feed at this URL."
- "Change the colour/label/zoom level of the green belt layer."
- "Run the flood risk zones fetcher on the production server."
- "Create a migration to add a column to the listed buildings table."
- "Deploy the latest code to production."

Things to be careful about:

- Running a fetcher or migration against the live database will change real data. Confirm you mean production before asking Claude Code to do it.
- Deploying with `kamal deploy` pushes to the live site immediately. There is no staging environment.
- Any change to a SQL query file (`db/queries/*.sql`) requires a follow-up `make sqlc` to regenerate TypeScript — without this the app may fail to build.
- `db/schema.sql` is auto-generated. Do not edit it by hand; it is overwritten whenever a migration runs.

---

## Running it locally

You need Docker, Bun, and Go installed.

**1. Copy the env file and fill in values:**

```bash
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
# and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
# For local dev you can leave DNO keys blank (those layers just won't load).
```

**2. Start the database:**

```bash
docker compose up -d
```

This starts a PostGIS 17 container. The database is empty on first run.

**3. Apply the schema:**

```bash
cat db/schema.sql | psql -d postgres://postgres:postgres@localhost:5432/scout
```

**4. Install dependencies:**

```bash
bun install
```

**5. Run the dev server:**

```bash
bun run dev
```

The app is available at http://localhost:3000 (or a `.localhost` URL if you use portless).

**6. (Optional) Fetch data into the local database:**

```bash
bun run fetch-all          # all datasets — slow, several GB
bun run fetch ext-datagovuk-green-belt   # one dataset by name
bun run list-fetchers      # see all available names
```

**To stop and delete the local database:**

```bash
docker compose down -v
```

---

## Deployment

Scout runs on a single Hetzner VPS at `157.180.79.13`. Deployment is managed by [Kamal](https://kamal-deploy.org), which builds a Docker image, pushes it to GitHub Container Registry (`ghcr.io`), and starts it on the server. The database (`scout-db`) is a separate Kamal-managed container on the same server, bound only to `127.0.0.1:5432` (not reachable from the internet).

**To deploy:**

```bash
kamal deploy
```

Run this from the `microsites/scout` folder on a machine that has Kamal installed and the secrets available (see "Keys, secrets & accounts" below). Kamal builds the image remotely on the Hetzner server itself (not your laptop), so it must be able to SSH to `root@157.180.79.13`.

**To install Kamal:**

```bash
brew install ruby
# Add to .zshrc: export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
#                export PATH="$(ruby -e 'print Gem.user_dir')/bin:$PATH"
gem install kamal
```

**To SSH into the server:**

```bash
ssh root@157.180.79.13
```

**To inspect what is running:**

```bash
docker ps                                   # all containers
docker logs <container-name> -f             # stream logs
```

Scout's web container is labelled `service=scout` / `role=web`. The database container is `scout-db`.

**To roll back to the previous image:**

```bash
kamal rollback
```

**To run a database migration on the production server:**

```bash
make server-migrate-up     # runs migrations inside the live web container
make server-migrate-down   # rolls back one migration
```

---

## Keys, secrets & accounts

| Service | Purpose | Account owner | Where the key lives now | Notes |
|---|---|---|---|---|
| GitHub Container Registry | Push/pull Docker images | buildwithtract GitHub org | Freddie's Bitwarden (key: `KAMAL_REGISTRY_PASSWORD`) | Must move to Infisical |
| Google Maps | Map display tiles | Freddie's personal Google Cloud | Freddie's Bitwarden (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) | **Must move to a CBP-owned Google Cloud account AND Infisical** |
| PostgreSQL | Database password | Freddie / Hetzner | Hardcoded in `config/deploy.yml` in git | Low-risk (DB is 127.0.0.1 only) but should move to Infisical |
| JWT signing | Scout's own auth tokens | N/A | Freddie's Bitwarden (`JWT_SECRET_KEY`) | Must move to Infisical |
| DNOS ENW | Electricity North West data | ENW | Freddie's Bitwarden (`DNOS_ENW_API_KEY`) | Must move to Infisical |
| DNOS UKPN | UK Power Networks data | UKPN | Freddie's Bitwarden (`DNOS_UKPN_API_KEY`) | Must move to Infisical |
| DNOS NGED | National Grid Electricity Distribution | NGED | Freddie's Bitwarden (`DNOS_NGED_API_KEY`) | Must move to Infisical |
| DNOS NPG | Northern Powergrid | NPG | Freddie's Bitwarden (`DNOS_NPG_API_KEY`) | Must move to Infisical |
| DNOS SPEN | SP Energy Networks | SPEN | Freddie's Bitwarden (`DNOS_SPEN_API_KEY`) | Must move to Infisical |
| DNOS SSEN | Scottish & Southern Electricity Networks | SSEN | Freddie's Bitwarden (`DNOS_SSEN_API_KEY`) | Must move to Infisical |

**Local dev:** Values live in `microsites/scout/.env` (gitignored). Copy from `.env.example` and fill in.

**Production deploys:** Kamal reads secrets at deploy time by running `.kamal/secrets`, which currently calls Freddie's personal Bitwarden Secrets Manager vault via `bws`. This means only Freddie's machine can currently deploy Scout.

### When the owner leaves

All of these secrets are currently tied to Freddie's personal accounts. A runbook for migrating them to a CBP-owned Infisical account (and moving the Google Maps key to a CBP Google Cloud account) is at:

> `/Users/freddieposer/projects/CBP/handover/HANDOVER_SECRETS_MIGRATION.md`

**The most urgent items are:**

1. The Google Maps key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) is on Freddie's personal Google Cloud account. If that account is closed or the key is deleted, the map stops rendering entirely. This key must move to a CBP-owned Google Cloud account.
2. The Postgres password is hardcoded in `config/deploy.yml` (in git). It is not internet-exposed, but it should move to Infisical as part of the migration.
3. Until the migration is complete, nobody other than Freddie can redeploy Scout or run fetchers remotely.

---

## When something breaks

**The site is down / returning errors:**

```bash
ssh root@157.180.79.13
docker ps                                       # is the scout web container running?
docker logs <scout-web-container-name> -f       # check for startup errors
docker ps -a                                    # look for exited containers
```

If the container has crashed, `kamal rollback` will restore the previous image. If the database container is down, `kamal accessory start scout-db`.

**A data layer shows nothing:**

That layer's data has probably never been fetched, or the fetch failed. Re-run the fetcher:

```bash
make server-fetch/ext-datagovuk-green-belt     # replace with the layer name
# or fetch everything:
make server-fetch-all
```

Use `bun run list-fetchers` to see exact names.

**Deploy fails because it can't read secrets:**

The `.kamal/secrets` file calls Bitwarden via `bws`. If the Bitwarden access token in `microsites/scout/.env` has expired or the vault item ID has changed, the deploy will fail. Check the runbook at `HANDOVER_SECRETS_MIGRATION.md` — if the migration to Infisical is complete, the Bitwarden section no longer applies.

Note: `kamal secrets extract` is unreliable on Kamal 2.7.x. If a secret comes back blank, read it directly with `bws secret get <id>` and compare against what Kamal reports.

---

## Open questions / known issues

- `documentation/database/00_setup.md` and `01_migrations.md` both contain `# todo` stubs — the sections about `init-schema.sql`, `kamal remove`, `kamal setup`, and local migration testing are incomplete.
- `documentation/new_layer.md` step 1 is noted as wrong ("We don't edit the schema file directly. How we will do migrations in Scout is TBC.") — the correct flow is to create a Goose migration, not to edit `db/schema.sql` by hand.
- The Postgres password is in plaintext in `config/deploy.yml`. Low-risk (DB is not internet-facing) but should move to Infisical.
- `NEXT_PUBLIC_GIT_SHA` in `config/deploy.yml` is set to the literal string `TODO` — it should be wired to the actual Kamal version or git SHA.
- There is no staging environment. All deployments go directly to production.
- `kamal secrets extract` is unreliable on the installed Kamal 2.7.x (known upstream issue).
