-- name: UpsertExtEnwSubstation :one
INSERT INTO
    public.ext_enw_substations (
        geometry,
        geometry_3857,
        name,
        number,
        infeed_voltage,
        outfeed_voltage,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        ST_Transform (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 3857)::geometry,
        sqlc.arg (name),
        sqlc.arg (number),
        sqlc.arg (infeed_voltage),
        sqlc.arg (outfeed_voltage),
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO UPDATE
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        public.ext_enw_substations.geometry
    ),
    number = coalesce(
        sqlc.narg ('number'),
        public.ext_enw_substations.number
    ),
    infeed_voltage = coalesce(
        sqlc.narg ('infeed_voltage'),
        public.ext_enw_substations.infeed_voltage
    ),
    outfeed_voltage = coalesce(
        sqlc.narg ('outfeed_voltage'),
        public.ext_enw_substations.outfeed_voltage
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: GetLatestImportForExtEnwSubstations :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_enw_substations;

-- name: DeleteAllExtEnwSubstations :exec
DELETE FROM public.ext_enw_substations;
