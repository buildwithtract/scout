-- name: GetExtDatagovukConservationAreas :many
SELECT
    *
FROM
    public.ext_datagovuk_conservation_area;

-- name: GetExtDatagovukConservationArea :one
SELECT
    *
FROM
    public.ext_datagovuk_conservation_area
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukConservationAreaForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_conservation_area
WHERE
    reference = sqlc.arg (reference);

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

-- name: GetExtDatagovukConservationAreaThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_conservation_area
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: DeleteAllExtDatagovukConservationAreas :exec
DELETE FROM public.ext_datagovuk_conservation_area
WHERE
    TRUE;

-- name: GetExtDatagovukConservationAreaLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_conservation_area;

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

-- name: GetExtDatagovukConservationAreasWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_conservation_area
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukConservationAreasIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_conservation_area
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

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
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
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