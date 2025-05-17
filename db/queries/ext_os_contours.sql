-- name: NewUkOSContourFrom27700 :one
INSERT INTO
    public.ext_os_contours (
        geometry,
        reference,
        height_m,
        contour_line_type,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_Transform (ST_GeomFromWKB (sqlc.arg (geometry), 27700), 4326),
        sqlc.arg (reference),
        sqlc.arg (height_m),
        sqlc.arg (contour_line_type),
        NOW(),
        NOW()
    )
RETURNING
    uuid,
    ST_AsBinary (geometry)::geometry AS geometry,
    reference,
    height_m,
    contour_line_type,
    first_imported_at,
    last_imported_at;

-- name: DeleteAllExtOsContours :exec
DELETE FROM public.ext_os_contours;

-- name: UpsertExtOsContour :one
INSERT INTO
    public.ext_os_contours (
        geometry,
        reference,
        height_m,
        contour_line_type,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_Transform (ST_GeomFromWKB (sqlc.arg (geometry), 27700), 4326)::geometry,
        sqlc.arg (reference),
        sqlc.arg (height_m),
        sqlc.arg (contour_line_type),
        NOW(),
        NOW()
    )
ON CONFLICT (reference) DO UPDATE
SET
    geometry = coalesce(
        ST_Transform (
            ST_GeomFromWKB (sqlc.narg ('geometry'), 27700),
            4326
        )::geometry,
        public.ext_os_contours.geometry
    ),
    height_m = coalesce(
        sqlc.narg ('height_m'),
        public.ext_os_contours.height_m
    ),
    contour_line_type = coalesce(
        sqlc.narg ('contour_line_type'),
        public.ext_os_contours.contour_line_type
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: GetLatestImportForExtOsContours :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_os_contours;

-- name: GetExtOsContoursInMvt :one
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
            reference,
            height_m,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_os_contours ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: GetContoursForGeometry :many
SELECT
    c."uuid",
    c."height_m",
    ST_Intersection (
        c."geometry",
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry
    )::geometry AS "intersection_polygon"
FROM
    "public"."ext_os_contours" c
WHERE
    ST_Intersects (
        c."geometry",
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry
    )
ORDER BY
    "height_m";