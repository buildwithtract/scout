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
            CASE
                WHEN voltage >= 1000 THEN (voltage / 1000)::int || 'kV' || ' ' || situation
                ELSE voltage::text || 'V' || ' ' || situation
            END AS annotation,
            ST_AsMVTGeom (
                CASE
                    WHEN ST_GeometryType (geometry_3857) = 'ST_MultiLineString' THEN ST_LineMerge (ST_Force2D (geometry_3857))
                    ELSE ST_Force2D (geometry_3857)
                END,
                tile.envelope
            )::geometry AS geometry
        FROM
            public.int_powerlines ip,
            tile
        WHERE
            ST_Intersects (ST_Force2D (ip.geometry_3857), tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;
