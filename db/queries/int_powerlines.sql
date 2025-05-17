-- name: RefreshIntPowerlinesMaterializedView :execresult
REFRESH MATERIALIZED VIEW int_powerlines;

-- name: GetIntPowerlinesInMvt :one
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
            voltage,
            situation,
            dno,
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
            public.int_powerlines ip,
            tile
        WHERE
            ST_Intersects (ST_Force2D (ip.geometry_3857), tile.envelope)
            AND (
                (ip.voltage >= 131000) -- Always show 132kV and above, with a buffer
                OR (
                    sqlc.arg (z) >= 10
                    AND sqlc.arg (z) < 12
                    AND ip.voltage >= 33000
                    AND ip.voltage < 131000
                )
                OR (
                    sqlc.arg (z) >= 12
                    AND sqlc.arg (z) < 14
                    AND ip.voltage >= 11000
                    AND ip.voltage < 131000
                )
                OR (
                    sqlc.arg (z) >= 14
                    AND ip.voltage < 131000
                )
            )
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;
