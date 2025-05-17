-- name: GetExtDatagovukHistoricParkGardens :many
SELECT
    *
FROM
    public.ext_datagovuk_historic_park_garden;

-- name: GetExtDatagovukHistoricParkGarden :one
SELECT
    *
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukHistoricParkGardenForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    reference = sqlc.arg (reference);

-- name: NewExtDatagovukHistoricParkGardenFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_historic_park_garden (geometry, reference, name, entry_date)
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date)
    )
RETURNING
    *;

-- name: GetExtDatagovukHistoricParkGardenThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: DeleteAllExtDatagovukHistoricParkGardens :exec
DELETE FROM public.ext_datagovuk_historic_park_garden
WHERE
    TRUE;

-- name: GetExtDatagovukHistoricParkGardenLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_historic_park_garden;

-- name: PartialUpdateExtDatagovukHistoricParkGardenForReference :exec
UPDATE public.ext_datagovuk_historic_park_garden
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    name = coalesce(sqlc.narg ('name'), name),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukHistoricParkGardensWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukHistoricParkGardensIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukHistoricParkGardenInMvt :one
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
            public.ext_datagovuk_historic_park_garden ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;