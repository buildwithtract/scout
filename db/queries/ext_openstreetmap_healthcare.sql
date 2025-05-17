-- name: GetExtOpenstreetmapHealthcare :many
SELECT
    *
FROM
    public.ext_openstreetmap_healthcare;

-- name: GetExtOpenstreetmapHealthcareNode :one
SELECT
    *
FROM
    public.ext_openstreetmap_healthcare
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtOpenstreetmapHealthcareForReference :one
SELECT
    *
FROM
    public.ext_openstreetmap_healthcare
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtOpenstreetmapHealthcareLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_openstreetmap_healthcare;

-- name: NewOpenstreetmapHealthcare :exec
INSERT INTO
    public.ext_openstreetmap_healthcare (name, reference, node_type, geometry)
VALUES
    (
        sqlc.arg (name),
        sqlc.arg (reference),
        sqlc.arg (node_type),
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geometry
    );

-- name: PartialUpdateExtOpenstreetmapHealthcare :exec
UPDATE public.ext_openstreetmap_healthcare
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

-- name: DeleteAllExtOpenstreetmapHealthcare :exec
DELETE FROM public.ext_openstreetmap_healthcare
WHERE
    TRUE;

-- name: GetNearestExtOpenstreetmapHealthcareByType :many
SELECT
    *,
    ST_Distance (
        geometry::geography,
        ST_GeomFromWKB (sqlc.arg (geometry), 4326)::geography
    )::float AS distance
FROM
    public.ext_openstreetmap_healthcare
WHERE
    node_type = sqlc.arg (node_type)
ORDER BY
    distance ASC
LIMIT
    sqlc.arg (num_results);

-- name: GetExtOpenstreetmapHealthcareInMvtByType :one
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
            COALESCE(NULLIF(name, ''), 'Doctors') AS annotation,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_openstreetmap_healthcare ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
            AND node_type = sqlc.arg (node_type)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;