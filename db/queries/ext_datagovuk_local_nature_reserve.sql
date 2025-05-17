-- name: GetExtDatagovukLocalNatureReserves :many
SELECT
    *
FROM
    public.ext_datagovuk_local_nature_reserve;

-- name: GetExtDatagovukLocalNatureReserve :one
SELECT
    *
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukLocalNatureReserveForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    reference = sqlc.arg (reference);

-- name: NewExtDatagovukLocalNatureReserveFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_local_nature_reserve (geometry, reference, name, entry_date)
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date)
    )
RETURNING
    *;

-- name: GetExtDatagovukLocalNatureReserveThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: DeleteAllExtDatagovukLocalNatureReserves :exec
DELETE FROM public.ext_datagovuk_local_nature_reserve
WHERE
    TRUE;

-- name: GetExtDatagovukLocalNatureReserveLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_local_nature_reserve;

-- name: PartialUpdateExtDatagovukLocalNatureReserveForReference :exec
UPDATE public.ext_datagovuk_local_nature_reserve
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

-- name: GetExtDatagovukLocalNatureReservesWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukLocalNatureReservesIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukLocalNatureReserveInMvt :one
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
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_local_nature_reserve ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;