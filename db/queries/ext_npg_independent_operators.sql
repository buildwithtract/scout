-- name: InsertExtNpgIndependentOperator :one
INSERT INTO
    public.ext_npg_independent_operators (
        geometry,
        name,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_Transform (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 4326)::geometry,
        sqlc.arg (name),
        NOW(),
        NOW()
    )
RETURNING
    *;

-- name: GetLatestImportForExtNpgIndependentOperators :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_npg_independent_operators;

-- name: DeleteAllExtNpgIndependentOperators :exec
DELETE FROM public.ext_npg_independent_operators;

-- name: GetExtNpgIndependentOperatorsForGeometry :many
SELECT
    c."name"
FROM
    "public"."ext_npg_independent_operators" c
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry
    )
ORDER BY
    ST_Area (
        ST_Intersection (
            c."geometry",
            ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry
        )::geometry
    ) DESC
LIMIT
    3;

-- name: GetExtNpgIndependentOperatorsInMvt :one
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
            ST_AsMVTGeom (ST_Transform (geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_npg_independent_operators,
            tile
        WHERE
            ST_Intersects (geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;