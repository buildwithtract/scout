-- name: GetExtDatagovukRamsars :many
SELECT
    *
FROM
    public.ext_datagovuk_ramsar;

-- name: GetExtDatagovukRamsar :one
SELECT
    *
FROM
    public.ext_datagovuk_ramsar
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukRamsarForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_ramsar
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukRamsarThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_ramsar
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukRamsarLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_ramsar;

-- name: NewExtDatagovukRamsarFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_ramsar (geometry, reference, name, entry_date)
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date)
    );

-- name: PartialUpdateExtDatagovukRamsarForReference :exec
UPDATE public.ext_datagovuk_ramsar
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

-- name: DeleteAllExtDatagovukRamsars :exec
DELETE FROM public.ext_datagovuk_ramsar
WHERE
    TRUE;

-- name: GetExtDatagovukRamsarsWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_ramsar
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukRamsarIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_ramsar
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukRamsarInMvt :one
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
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_ramsar ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;