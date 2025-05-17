-- name: GetLatestImportForExtSsenTransmissionOverheadLineSupergrid :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ssen_transmission_overhead_line_supergrid;

-- name: UpsertExtSsenTransmissionOverheadLineSupergrid :one
INSERT INTO
    public.ext_ssen_transmission_overhead_line_supergrid (
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
        public.ext_ssen_transmission_overhead_line_supergrid.voltage
    ),
    situation = coalesce(
        sqlc.narg ('situation'),
        public.ext_ssen_transmission_overhead_line_supergrid.situation
    ),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        public.ext_ssen_transmission_overhead_line_supergrid.geometry
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: DeleteAllExtSsenTransmissionOverheadLineSupergrid :exec
DELETE FROM public.ext_ssen_transmission_overhead_line_supergrid;
