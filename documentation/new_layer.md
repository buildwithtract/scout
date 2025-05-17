# Adding a New Map Layer

Adding a new map layer to Scout involves several steps, from database schema to frontend configuration. Here's a comprehensive guide:

## 1. Create a Database Table

First, create a table in the database to store your layer's data.

1. Define your table schema in a new migration file or add to `db/schema.sql`: TODO step one is wrong. We don't edit the schema file directly. How we will do migrations in Scout is TBC.

```sql
CREATE TABLE public.ext_your_new_layer (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text,
    entry_date date,
    geometry public.geometry(Geometry, 4326),
    geometry_3857 public.geometry(Geometry, 3857),
    last_imported_at timestamp with time zone DEFAULT now()
);

CREATE INDEX ext_your_new_layer_geometry_idx ON public.ext_your_new_layer USING gist (geometry);
CREATE INDEX ext_your_new_layer_geometry_3857_idx ON public.ext_your_new_layer USING gist (geometry_3857);
CREATE INDEX ext_your_new_layer_reference_idx ON public.ext_your_new_layer USING btree (reference);
CREATE UNIQUE INDEX ext_your_new_layer_uuid_idx ON public.ext_your_new_layer USING btree (uuid);

-- Add projection enforcement trigger
CREATE TRIGGER check_projection
BEFORE INSERT OR UPDATE ON public.ext_your_new_layer
FOR EACH ROW EXECUTE FUNCTION public.enforce_projection();

-- Add transform geometry trigger
CREATE TRIGGER transform_geometry_trigger
BEFORE INSERT OR UPDATE ON public.ext_your_new_layer
FOR EACH ROW EXECUTE FUNCTION public.transform_geometry();
```

## 2. Create an MVT Query

MVT (Mapbox Vector Tile) queries allow rendering of vector tiles on the map.

1. Create a new file in `db/queries/ext_your_new_layer.sql`:

```sql
-- name: GetExtYourNewLayerLatestImport :one
SELECT MAX(last_imported_at) FROM ext_your_new_layer;

-- name: UpsertExtYourNewLayerFromWGS84 :one
INSERT INTO public.ext_your_new_layer (
    reference,
    name,
    entry_date,
    geometry
) VALUES (
    @reference,
    @name,
    @entry_date,
    ST_GeomFromGeoJSON(@geometry)::geometry
) ON CONFLICT (reference) DO UPDATE SET
    geometry = coalesce(ST_GeomFromGeoJSON(sqlc.narg('geometry'))::geometry, public.ext_your_new_layer.geometry),
    name = coalesce(sqlc.narg('name'), public.ext_your_new_layer.name),
    entry_date = coalesce(sqlc.narg('entry_date'), public.ext_your_new_layer.entry_date),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: GetExtYourNewLayerInMvt :one
WITH tile AS (
    SELECT ST_TileEnvelope(@z::int, @x::int, @y::int) as envelope
),
mvtgeom AS (
    SELECT
        uuid,
        name,
        COALESCE(
           'Your Layer: ' || name
        ) AS annotation,
        ST_AsMVTGeom(ST_Transform(ip.geometry, 3857), tile.envelope)::geometry AS geometry
    FROM public.ext_your_new_layer ip, tile
    WHERE ST_Intersects(ip.geometry, ST_Transform(tile.envelope, 4326))
)
SELECT ST_AsMVT(mvtgeom.*)::bytea AS mvt
FROM mvtgeom;

-- name: DeleteAllExtYourNewLayer :exec
DELETE FROM public.ext_your_new_layer WHERE TRUE;
```

2. Generate TypeScript query files by running:

```bash
make sqlc
```

This will create the TypeScript interfaces in `src/db/generated/`.

3. Make sure your SQL query file is exported in `src/db/index.ts`:

```typescript
export * from './generated/ext_your_new_layer_sql'
```

## 3. Configure the MVT API

1. Add a new entry to the `Dataset` enum in `src/app/api/mvt/datasets/[key]/[z]/[x]/[y]/queries.ts`:

```typescript
export enum Dataset {
  // ... existing datasets ...
  ExtYourNewLayer = 'ext-your-new-layer'
  // ... other datasets ...
}
```

2. Add a case for your dataset in the `getDataset` function in the same file:

```typescript
case Dataset.ExtYourNewLayer:
  return dbQueries.getExtYourNewLayerInMvt(client, {
    z: z as number,
    x: x as number,
    y: y as number
  })
```

## 4. Configure the Map Source

1. Add your new layer ID to the `MapSourceId` enum in `src/components/googlemap/config.ts`:

```typescript
export enum MapSourceId {
  // existing entries...
  ExtYourNewLayer = 'ext-your-new-layer'
}
```

2. Define your map source properties and styling in the `mapSourcesBase` object in the same file:

```typescript
[MapSourceId.ExtYourNewLayer]: mapLayerProps({
  type: 'polygon', // or 'point' or 'line'
  id: MapSourceId.ExtYourNewLayer,
  name: 'Your New Layer',
  fill: '#4682b4', // color in hex format
  line: '#4169e1' // optional, border color
}),
```

3. Specify the minimum zoom level for your layer in `src/config/map-sources.ts`:

```typescript
export const minZoomsScout: Partial<Record<MapSourceId, number>> = {
  // existing entries...
  [MapSourceId.ExtYourNewLayer]: minZoomLevels.md // choose appropriate zoom level
}
```

4. Add your layer to the `MapSourceOrder` array to specify its render order:

```typescript
export const MapSourceOrder: MapSourceId[] = [
  // existing entries...
  MapSourceId.ExtYourNewLayer
  // entries after yours...
]
```

## 4. Create Data Import Process (Optional)

If needed, create a data import script to populate your table with data.

1. Create a fetcher in `src/fetchers/` if your data needs to be imported from an external source.

## 5. Test the New Layer

1. Make sure your database has the correct schema and your new table:

```bash
cat db/schema.sql | psql -d postgres://postgres:postgres@localhost:5432/scout
```

2. Populate your table with test data.

3. Start the application:

```bash
docker compose up -d
```

4. Check that your layer appears correctly in the map UI.

## 6. Deploy

After testing, deploy your changes:

1. Commit your changes to version control
2. Follow your organization's deployment process
3. Apply database migrations to production environments
4. Verify the new layer is visible in production

## Complete Example

Here's a real-world example for a theoretical "Conservation Zones" layer:

1. Database table:

```sql
CREATE TABLE public.ext_conservation_zones (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    reference text NOT NULL,
    name text,
    designation_date date,
    geometry public.geometry(Geometry, 4326),
    geometry_3857 public.geometry(Geometry, 3857),
    last_imported_at timestamp with time zone DEFAULT now()
);
```

2. MVT query in `db/queries/ext_conservation_zones.sql`:

```sql
-- name: GetExtConservationZonesInMvt :one
WITH tile AS (
    SELECT ST_TileEnvelope(@z::int, @x::int, @y::int) as envelope
),
mvtgeom AS (
    SELECT
        uuid,
        name,
        COALESCE(
           'Conservation Zone: ' || name
        ) AS annotation,
        ST_AsMVTGeom(ST_Transform(ip.geometry, 3857), tile.envelope)::geometry AS geometry
    FROM public.ext_conservation_zones ip, tile
    WHERE ST_Intersects(ip.geometry, ST_Transform(tile.envelope, 4326))
)
SELECT ST_AsMVT(mvtgeom.*)::bytea AS mvt
FROM mvtgeom;
```

3. Map source configuration:

```typescript
export enum MapSourceId {
  // existing entries...
  ExtConservationZones = 'ext-conservation-zones',
}

// In mapSourcesBase:
[MapSourceId.ExtConservationZones]: mapLayerProps({
  type: 'polygon',
  id: MapSourceId.ExtConservationZones,
  name: 'Conservation Zones',
  fill: '#228b22',
  line: '#006400'
}),
```

4. Minimum zoom level:

```typescript
export const minZoomsScout: Partial<Record<MapSourceId, number>> = {
  // existing entries...
  [MapSourceId.ExtConservationZones]: minZoomLevels.md
}
```
