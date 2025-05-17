-- name: GetExtDatagovukBuiltUpAreas :many
SELECT
    *
FROM
    public.ext_datagovuk_built_up_areas;

-- name: GetExtDatagovukBuiltUpAreaUuidsAndIntersectionsThatIntersectGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON (sqlc.arg ('geometry'))::geometry as geom
    )
SELECT
    uuid,
    ST_Intersection (u.geometry, i.geom)::geometry AS intersection
FROM
    public.ext_datagovuk_built_up_areas u,
    input_geom i
WHERE
    ST_Intersects (u.geometry, i.geom);

-- name: GetExtDatagovukBuiltUpAreaUuidsAndZonesThatIntersectGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON (sqlc.arg ('geometry'))::geometry as geom
    )
SELECT
    uuid,
    name
FROM
    public.ext_datagovuk_built_up_areas u,
    input_geom i
WHERE
    ST_Intersects (u.geometry, i.geom);

-- name: GetExtDatagovukBuiltUpAreasNearGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON (sqlc.arg ('geometry'))::geometry as geom
    )
SELECT
    u.*,
    ST_Distance (u.geometry::geography, i.geom::geography)::float AS distance
FROM
    public.ext_datagovuk_built_up_areas u,
    input_geom i
WHERE
    ST_DWithin (
        u.geometry::geography,
        i.geom::geography,
        sqlc.arg ('distance')
    )
ORDER BY
    distance ASC
LIMIT
    $1;

-- name: GetExtDatagovukBuiltUpAreasInMvt :one
WITH
    tile AS (
        SELECT
            ST_TileEnvelope (
                sqlc.arg ('z')::int,
                sqlc.arg ('x')::int,
                sqlc.arg ('y')::int
            ) as envelope
    ),
    mvtgeom AS (
        SELECT
            uuid,
            name,
            COALESCE('Built Up Area: ' || name) AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_built_up_areas ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: GetExtDatagovukBuiltUpArea :one
SELECT
    *
FROM
    public.ext_datagovuk_built_up_areas
WHERE
    uuid = $1;

-- name: GetExtDatagovukBuiltUpAreaForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_built_up_areas
WHERE
    reference = $1;

-- name: NewExtDatagovukBuiltUpAreaFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_built_up_areas (geometry, reference, name)
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg ('geometry'))::geometry,
        sqlc.arg ('reference'),
        sqlc.arg ('name')
    )
RETURNING
    *;

-- name: GetExtDatagovukBuiltUpAreaThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_built_up_areas
WHERE
    ST_Intersects (geometry_3857, ST_GeomFromGeoJSON ($1)::geometry);

-- name: DeleteAllExtDatagovukBuiltUpAreas :exec
DELETE FROM public.ext_datagovuk_built_up_areas
WHERE
    TRUE;

-- name: GetExtDatagovukBuiltUpAreaLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_built_up_areas;

-- name: PartialUpdateExtDatagovukBuiltUpAreaForReference :exec
UPDATE public.ext_datagovuk_built_up_areas
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    name = coalesce(sqlc.narg ('name'), name),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg ('reference');
