-- name: GetExtDatagovukNationalNatureReserveLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_national_nature_reserves;

-- name: UpsertExtDatagovukNationalNatureReserveFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_national_nature_reserves (
        reference,
        geometry,
        name,
        status,
        entry_date,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        sqlc.arg (reference),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (name),
        sqlc.arg (status),
        sqlc.arg (entry_date),
        NOW(),
        NOW()
    )
ON CONFLICT (reference) DO UPDATE
SET
    geometry = CASE
        WHEN sqlc.narg ('geometry')::text IS NOT NULL THEN ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry
        ELSE public.ext_datagovuk_national_nature_reserves.geometry
    END,
    name = coalesce(
        sqlc.narg ('name'),
        public.ext_datagovuk_national_nature_reserves.name
    ),
    status = coalesce(
        sqlc.narg ('status'),
        public.ext_datagovuk_national_nature_reserves.status
    ),
    entry_date = coalesce(
        sqlc.narg ('entry_date'),
        public.ext_datagovuk_national_nature_reserves.entry_date
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: DeleteAllExtDatagovukNationalNatureReserves :exec
DELETE FROM public.ext_datagovuk_national_nature_reserves
WHERE
    TRUE;

-- name: DeleteMissingExtDatagovukNationalNatureReserves :one
-- Given a type and a list of reference, delete any existing scopes that are not in the list
WITH
    deleted_rows AS (
        DELETE FROM public.ext_datagovuk_national_nature_reserves AS d
        WHERE
            NOT EXISTS (
                SELECT
                    1
                FROM
                    public.ext_datagovuk_national_nature_reserves AS q
                WHERE
                    q.reference = ANY (sqlc.arg (reference)::text[])
            )
        RETURNING
            *
    )
SELECT
    COUNT(*) AS deleted_count
FROM
    deleted_rows;

-- name: GetDatagovukNationalNatureReservesIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_national_nature_reserves
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukNationalNatureReservesInMvt :one
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
            ST_AsMVTGeom (
                ST_Simplify (
                    ip.geometry_3857,
                    CASE
                        WHEN sqlc.arg (z) >= 12 THEN 0
                        ELSE GREATEST(0.5, POWER(2, 20 - sqlc.arg (z)) / 4)
                    END
                ),
                tile.envelope
            )::geometry AS geometry
        FROM
            public.ext_datagovuk_national_nature_reserves ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;