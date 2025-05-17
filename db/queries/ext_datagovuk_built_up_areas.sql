-- name: GetExtDatagovukBuiltUpAreaLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_built_up_areas;

-- name: GetExtDatagovukBuiltUpAreaForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_built_up_areas
WHERE
    reference = $1;

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
            public.ext_datagovuk_built_up_areas ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

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

-- name: DeleteAllExtDatagovukBuiltUpAreas :exec
DELETE FROM public.ext_datagovuk_built_up_areas
WHERE
    TRUE;
