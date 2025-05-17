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
            public.ext_openstreetmap_healthcare ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
            AND node_type = sqlc.arg (node_type)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

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
