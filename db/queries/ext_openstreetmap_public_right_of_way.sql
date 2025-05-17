-- name: GetExtOpenstreetmapPublicRightOfWay :many
SELECT
    *
FROM
    public.ext_openstreetmap_public_right_of_way;

-- name: GetExtOpenstreetmapPublicRightsOfWay :one
SELECT
    *
FROM
    public.ext_openstreetmap_public_right_of_way
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtOpenstreetmapPublicRightsOfWayForReference :one
SELECT
    *
FROM
    public.ext_openstreetmap_public_right_of_way
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtOpenstreetmapPublicRightOfWayLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_openstreetmap_public_right_of_way;

-- name: NewOpenstreetmapPublicRightOfWay :exec
INSERT INTO
    public.ext_openstreetmap_public_right_of_way (reference, way_type, geometry)
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (way_type),
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry
    );

-- name: PartialUpdateExtOpenstreetmapPublicRightOfWay :exec
UPDATE public.ext_openstreetmap_public_right_of_way
SET
    way_type = coalesce(sqlc.narg ('way_type'), way_type),
    geometry = coalesce(
        ST_GeomFromWKB (sqlc.narg ('geometry'), 4326)::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtOpenstreetmapPublicRightOfWay :exec
DELETE FROM public.ext_openstreetmap_public_right_of_way
WHERE
    TRUE;

-- name: GetExtOpenstreetmapPublicRightsOfWayIntersectingGeometry :many
SELECT
    "c"."uuid",
    "c"."reference",
    "c"."way_type",
    ST_Intersection (
        c."geometry",
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry
    )::geometry AS "intersection_polygon"
FROM
    "public"."ext_openstreetmap_public_right_of_way" c
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry
    );

-- name: GetOpenstreetmapPublicRightsOfWayInMvtByType :one
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
            way_type,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_openstreetmap_public_right_of_way ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
            AND way_type = sqlc.arg (way_type)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;