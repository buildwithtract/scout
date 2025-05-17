-- name: GetExtDatagovukParishes :many
SELECT
    *
FROM
    public.ext_datagovuk_parishes;

-- name: GetExtDatagovukParish :one
SELECT
    *
FROM
    public.ext_datagovuk_parishes
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukParishForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_parishes
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukParishThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_parishes
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukParishLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_parishes;

-- name: NewExtDatagovukParishFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_parishes (reference, name, entry_date, geometry)
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: PartialUpdateExtDatagovukParishForReference :exec
UPDATE public.ext_datagovuk_parishes
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

-- name: DeleteAllExtDatagovukParishes :exec
DELETE FROM public.ext_datagovuk_parishes
WHERE
    TRUE;

-- name: GetExtDatagovukParishAtPoint :one
SELECT
    uuid,
    reference,
    name,
    entry_date,
    ST_AsGeoJSON (geometry)::text AS geometry_geojson
FROM
    public.ext_datagovuk_parishes
WHERE
    ST_Intersects (
        geometry,
        ST_SetSRID (
            ST_Point (sqlc.arg (longitude), sqlc.arg (latitude)),
            4326
        )
    );

-- name: GetExtDatagovukParishesInMvt :one
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
            public.ext_datagovuk_parishes ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;