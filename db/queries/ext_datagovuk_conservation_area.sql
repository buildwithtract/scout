-- name: GetExtDatagovukConservationAreaLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_conservation_area;

-- name: GetExtDatagovukConservationAreaForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_conservation_area
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukConservationAreaInMvt :one
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
            public.ext_datagovuk_conservation_area ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: NewExtDatagovukConservationAreaFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_conservation_area (geometry, reference, name, entry_date)
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date)
    )
RETURNING
    *;

-- name: PartialUpdateExtDatagovukConservationAreaForReference :exec
UPDATE public.ext_datagovuk_conservation_area
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    name = coalesce(sqlc.narg ('name'), name),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukConservationAreas :exec
DELETE FROM public.ext_datagovuk_conservation_area
WHERE
    TRUE;
