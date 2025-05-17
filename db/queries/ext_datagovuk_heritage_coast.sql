-- name: GetExtDatagovukHeritageCoasts :many
SELECT
    *
FROM
    public.ext_datagovuk_heritage_coast;

-- name: GetExtDatagovukHeritageCoast :one
SELECT
    *
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukHeritageCoastForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukHeritageCoastLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_heritage_coast;

-- name: NewExtDatagovukHeritageCoastFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_heritage_coast (geometry, reference, name, documentation_url)
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (documentation_url)
    );

-- name: PartialUpdateExtDatagovukHeritageCoastForReference :exec
UPDATE public.ext_datagovuk_heritage_coast
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    name = coalesce(sqlc.narg ('name'), name),
    documentation_url = coalesce(
        sqlc.narg ('documentation_url'),
        documentation_url
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukHeritageCoastThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: DeleteAllExtDatagovukHeritageCoasts :exec
DELETE FROM public.ext_datagovuk_heritage_coast
WHERE
    TRUE;

-- name: GetExtDatagovukHeritageCoastsWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukHeritageCoastIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukHeritageCoastInMvt :one
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
            public.ext_datagovuk_heritage_coast ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;