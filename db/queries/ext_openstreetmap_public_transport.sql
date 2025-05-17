-- name: GetExtOpenstreetmapPublicTransportLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_openstreetmap_public_transport;

-- name: GetNearestExtOpenstreetmapPublicTransportByType :many
SELECT
    *,
    ST_Distance (
        geometry::geography,
        ST_GeomFromWKB ($1, 4326)::geography
    )::float AS distance
FROM
    public.ext_openstreetmap_public_transport
WHERE
    node_type = $2
ORDER BY
    distance ASC
LIMIT
    $3;

-- name: GetNearestExtOpenstreetmapPublicTransportInMvtByType :one
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
            COALESCE(
                NULLIF(
                    CASE
                        WHEN node_type = 'bus_stop' THEN 'Bus Stop: ' || name
                        WHEN node_type = 'train_station' THEN 'Train Station: ' || name
                    END,
                    CASE
                        WHEN node_type = 'bus_stop' THEN 'Bus Stop: '
                        WHEN node_type = 'train_station' THEN 'Train Station: '
                    END
                ),
                CASE
                    WHEN node_type = 'bus_stop' THEN 'Bus Stop'
                    WHEN node_type = 'train_station' THEN 'Train Station'
                END
            ) AS annotation,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_openstreetmap_public_transport ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
            AND node_type = sqlc.arg (node_type)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: NewOpenstreetmapPublicTransport :exec
INSERT INTO
    public.ext_openstreetmap_public_transport (name, reference, node_type, geometry)
VALUES
    (
        sqlc.arg (name),
        sqlc.arg (reference),
        sqlc.arg (node_type),
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry
    );

-- name: PartialUpdateExtOpenstreetmapPublicTransport :exec
UPDATE public.ext_openstreetmap_public_transport
SET
    name = coalesce(sqlc.narg ('name'), name),
    node_type = coalesce(sqlc.narg ('node_type'), node_type),
    geometry = coalesce(
        ST_GeomFromWKB (sqlc.narg ('geometry'), 4326)::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtOpenstreetmapPublicTransport :exec
DELETE FROM public.ext_openstreetmap_public_transport
WHERE
    TRUE;
