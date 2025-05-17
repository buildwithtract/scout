-- name: InsertExtUkpnIndependentOperator :one
INSERT INTO
    public.ext_ukpn_independent_operators (geometry, first_imported_at, last_imported_at)
VALUES
    (
        ST_Transform (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 4326)::geometry,
        NOW(),
        NOW()
    )
RETURNING
    *;

-- name: GetLatestImportForExtUkpnIndependentOperators :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ukpn_independent_operators;

-- name: DeleteAllExtUkpnIndependentOperators :exec
DELETE FROM public.ext_ukpn_independent_operators;
