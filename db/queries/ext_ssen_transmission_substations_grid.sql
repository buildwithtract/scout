-- name: GetLatestImportForExtSsenSubstationsGrid :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ssen_transmission_substations_grid;

-- name: UpsertExtSsenSubstationGrid :one
INSERT INTO
    public.ext_ssen_transmission_substations_grid (
        name,
        number,
        voltage,
        geometry,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        sqlc.arg (name),
        sqlc.arg (number),
        sqlc.arg (voltage),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO UPDATE
SET
    number = coalesce(
        sqlc.narg ('number'),
        public.ext_ssen_transmission_substations_grid.number
    ),
    voltage = coalesce(
        sqlc.narg ('voltage'),
        public.ext_ssen_transmission_substations_grid.voltage
    ),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        public.ext_ssen_transmission_substations_grid.geometry
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: DeleteAllExtSsenSubstationsGrid :exec
DELETE FROM public.ext_ssen_transmission_substations_grid;
