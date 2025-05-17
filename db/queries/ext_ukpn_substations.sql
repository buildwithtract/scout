-- name: UpsertExtUkpnSubstation :one
INSERT INTO
    public.ext_ukpn_substations (
        geometry,
        geometry_3857,
        name,
        number,
        voltage,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        ST_Transform (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 3857)::geometry,
        sqlc.arg (name),
        sqlc.arg (number),
        sqlc.arg (voltage),
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO UPDATE
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        public.ext_ukpn_substations.geometry
    ),
    number = coalesce(
        sqlc.narg ('number'),
        public.ext_ukpn_substations.number
    ),
    voltage = coalesce(
        sqlc.narg ('voltage'),
        public.ext_ukpn_substations.voltage
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: GetLatestImportForExtUkpnSubstations :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ukpn_substations;

-- name: DeleteAllExtUkpnSubstations :exec
DELETE FROM public.ext_ukpn_substations;
