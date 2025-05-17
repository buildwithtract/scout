-- name: GetExtDatagovukRegions :many
SELECT
    *
FROM
    public.ext_datagovuk_regions;

-- name: GetExtDatagovukRegion :one
SELECT
    *
FROM
    public.ext_datagovuk_regions
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukRegionForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_regions
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukRegionThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_regions
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukRegionLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_regions;

-- name: NewExtDatagovukRegionFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_regions (reference, name, entry_date, geometry)
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: PartialUpdateExtDatagovukRegionForReference :exec
UPDATE public.ext_datagovuk_regions
SET
    name = coalesce(sqlc.narg ('name'), name),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukRegions :exec
DELETE FROM public.ext_datagovuk_regions
WHERE
    TRUE;

-- name: GetExtDatagovukRegionsByUuids :many
SELECT
    *
FROM
    public.ext_datagovuk_regions
WHERE
    uuid = ANY (sqlc.arg (uuids)::uuid[]);

-- name: GetExtDatagovukRegionsInMvt :one
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
            ST_AsMVTGeom (
                ST_Simplify (
                    ip.geometry_3857,
                    CASE
                        WHEN sqlc.arg (z) >= 12 THEN 0
                        ELSE GREATEST(0.5, POWER(2, 20 - sqlc.arg (z)) / 4)
                    END
                ),
                tile.envelope
            )::geometry AS geometry
        FROM
            public.ext_datagovuk_regions ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;
