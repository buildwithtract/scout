-- name: UpsertExtSpenSubstation :one
INSERT INTO
    public.ext_spen_substations (
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
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry,
        ST_Transform (ST_GeomFromWKB (sqlc.arg (geometry), 4326), 3857)::geometry,
        sqlc.arg (name),
        sqlc.arg (number),
        sqlc.arg (voltage),
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO UPDATE
SET
    geometry = coalesce(
        ST_Transform (
            ST_GeomFromWKB (sqlc.narg ('geometry'), 27700),
            4326
        )::geometry,
        public.ext_spen_substations.geometry
    ),
    number = coalesce(
        sqlc.narg ('number'),
        public.ext_spen_substations.number
    ),
    voltage = coalesce(
        sqlc.narg ('voltage'),
        public.ext_spen_substations.voltage
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: GetLatestImportForExtSpenSubstations :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_spen_substations;

-- name: DeleteAllExtSpenSubstations :exec
DELETE FROM public.ext_spen_substations;
