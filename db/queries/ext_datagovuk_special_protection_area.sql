-- name: GetExtDatagovukSpecialProtectionAreas :many
SELECT
    *
FROM
    public.ext_datagovuk_special_protection_area;

-- name: GetExtDatagovukSpecialProtectionArea :one
SELECT
    *
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukSpecialProtectionAreaForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    reference = sqlc.arg (reference);

-- name: NewExtDatagovukSpecialProtectionAreaFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_special_protection_area (geometry, reference, name)
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name)
    )
RETURNING
    *;

-- name: GetExtDatagovukSpecialProtectionAreaThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: DeleteAllExtDatagovukSpecialProtectionAreas :exec
DELETE FROM public.ext_datagovuk_special_protection_area
WHERE
    TRUE;

-- name: GetUkSpecialProtectionArea :one
SELECT
    *
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetUkSpecialProtectionAreasWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukSpecialProtectionAreasIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukSpecialProtectionAreasLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_special_protection_area;

-- name: PartialUpdateExtDatagovukSpecialProtectionAreaForReference :exec
UPDATE public.ext_datagovuk_special_protection_area
SET
    name = coalesce(sqlc.narg ('name'), name),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukSpecialProtectionAreasInMvt :one
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
            public.ext_datagovuk_special_protection_area ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;
