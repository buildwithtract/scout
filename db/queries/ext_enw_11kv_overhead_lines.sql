-- name: UpsertExtEnw11kvOverheadLine :one
INSERT INTO
    public.ext_enw_11kv_overhead_lines (
        geometry,
        geometry_3857,
        voltage,
        situation,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        ST_Transform (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 3857)::geometry,
        sqlc.arg (voltage),
        sqlc.arg (situation),
        NOW(),
        NOW()
    )
ON CONFLICT (uuid) DO UPDATE
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        public.ext_enw_11kv_overhead_lines.geometry
    ),
    voltage = coalesce(
        sqlc.narg ('voltage'),
        public.ext_enw_11kv_overhead_lines.voltage
    ),
    situation = coalesce(
        sqlc.narg ('situation'),
        public.ext_enw_11kv_overhead_lines.situation
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: GetLatestImportForExtEnw11kvOverheadLines :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_enw_11kv_overhead_lines;

-- name: DeleteAllExtEnw11kvOverheadLines :exec
DELETE FROM public.ext_enw_11kv_overhead_lines;