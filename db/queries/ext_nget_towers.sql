-- name: DeleteAllExtNgetTowers :exec
DELETE FROM public.ext_nget_towers;

-- name: UpsertExtNgetTower :one
INSERT INTO
    public.ext_nget_towers (
        geometry,
        reference,
        status,
        tower_height,
        year_installed,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_Force2D (
            ST_Transform (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 4326)
        ),
        sqlc.arg (reference),
        sqlc.arg (status),
        sqlc.arg (tower_height),
        sqlc.arg (year_installed),
        NOW(),
        NOW()
    )
ON CONFLICT (reference) DO UPDATE
SET
    geometry = coalesce(
        ST_Force2D (
            ST_Transform (ST_GeomFromGeoJSON (sqlc.narg ('geometry')), 4326)
        ),
        public.ext_nget_towers.geometry
    ),
    status = coalesce(
        sqlc.narg ('status'),
        public.ext_nget_towers.status
    ),
    tower_height = coalesce(
        sqlc.narg ('tower_height'),
        public.ext_nget_towers.tower_height
    ),
    year_installed = coalesce(
        sqlc.narg ('year_installed'),
        public.ext_nget_towers.year_installed
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: DeleteMissingExtNgetTowersForReference :one
-- Given a list of reference, delete any existing towers that are not in the list
WITH
    deleted_rows AS (
        DELETE FROM public.ext_nget_towers AS t
        WHERE
            t.reference NOT IN (
                SELECT
                    UNNEST(sqlc.arg (reference)::text[])
            )
        RETURNING
            *
    )
SELECT
    COUNT(*)
FROM
    deleted_rows;

-- name: GetLatestImportForExtNgetTowers :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_nget_towers;

-- name: GetExtNgetTowersInMvt :one
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
            reference || ' (Height: ' || tower_height || 'M)' AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_nget_towers ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;