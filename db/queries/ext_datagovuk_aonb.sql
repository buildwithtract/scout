-- name: GetExtDatagovukAonbLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_aonb;

-- name: UpsertExtDatagovukAonbFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_aonb (reference, name, entry_date, geometry)
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    )
ON CONFLICT (reference) DO UPDATE
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        public.ext_datagovuk_aonb.geometry
    ),
    name = coalesce(
        sqlc.narg ('name'),
        public.ext_datagovuk_aonb.name
    ),
    entry_date = coalesce(
        sqlc.narg ('entry_date'),
        public.ext_datagovuk_aonb.entry_date
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: InsertExtDatagovukAonbFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_aonb (reference, name, entry_date, geometry)
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    )
RETURNING
    *,
    'inserted' AS operation;

-- name: GetExtDatagovukAonbInMvt :one
WITH
    tile AS (
        SELECT
            ST_TileEnvelope (
                sqlc.arg (z)::int,
                sqlc.arg (x)::int,
                sqlc.arg (y)::int
            ) as envelope
    ),
    mvtgeom AS (
        SELECT
            uuid,
            name,
            COALESCE('National Landscape: ' || name) AS annotation,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_aonb ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: DeleteAllExtDatagovukAonb :exec
DELETE FROM public.ext_datagovuk_aonb
WHERE
    TRUE;
