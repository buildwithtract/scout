-- name: RefreshIntSubstationsMaterializedView :execresult
REFRESH MATERIALIZED VIEW int_substations;

-- name: GetNearestIntSubstations :many
WITH
    voltage_appropriate AS (
        -- Skip all substations that have empty voltage, or voltage: 6.6kV, 11kV, Less than 1KV (415V, 240V for example), or "LV"
        SELECT
            *
        FROM
            public.int_substations
        WHERE
            voltage != ''
            AND voltage !~ '^((6.6|11)kV|([0-9]+)V|LV)$'
    )
SELECT
    *,
    ST_Distance (
        geometry_3857,
        ST_Transform (ST_GeomFromWKB (sqlc.arg (point), 4326), 3857)
    )::float AS distance
FROM
    voltage_appropriate
ORDER BY
    distance ASC
LIMIT
    $1;

-- name: GetIntSubstationsInMvt :one
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
            name || ' (Voltage: ' || voltage || ')' AS annotation,
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
            public.int_substations ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;