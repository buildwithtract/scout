-- name: UpsertExtNpgDno :one
INSERT INTO
    public.ext_npg_dnos (
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
ON CONFLICT (name) DO UPDATE
SET
    geometry = coalesce(
        ST_Transform (ST_GeomFromGeoJSON (sqlc.narg ('geometry')), 4326)::geometry,
        public.ext_npg_dnos.geometry
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: GetLatestImportForExtNpgDnos :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_npg_dnos;

-- name: DeleteAllExtNpgDnos :exec
DELETE FROM public.ext_npg_dnos;

-- name: GetDnoForGeometry :one
SELECT
    c."name"
FROM
    "public"."ext_npg_dnos" c
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    )
ORDER BY
    ST_Area (
        ST_Intersection (
            c."geometry",
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
        )::geometry
    ) DESC
LIMIT
    1;

-- name: GetExtNpgDnosInMvt :one
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
            ST_AsMVTGeom (geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_npg_dnos,
            tile
        WHERE
            ST_Intersects (geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;