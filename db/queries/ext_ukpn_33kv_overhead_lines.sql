-- name: GetLatestImportForExtUkpn33kvOverheadLines :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ukpn_33kv_overhead_lines;

-- name: UpsertExtUkpn33kvOverheadLine :one
INSERT INTO
    public.ext_ukpn_33kv_overhead_lines (
        voltage,
        situation,
        geometry,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        sqlc.arg (voltage),
        sqlc.arg (situation),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        NOW(),
        NOW()
    )
ON CONFLICT (uuid) DO UPDATE
SET
    voltage = coalesce(
        sqlc.narg ('voltage'),
        public.ext_ukpn_33kv_overhead_lines.voltage
    ),
    situation = coalesce(
        sqlc.narg ('situation'),
        public.ext_ukpn_33kv_overhead_lines.situation
    ),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        public.ext_ukpn_33kv_overhead_lines.geometry
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: DeleteAllExtUkpn33kvOverheadLines :exec
DELETE FROM public.ext_ukpn_33kv_overhead_lines;