-- name: GetExtDatagovukGreenBelts :many
SELECT
    *
FROM
    public.ext_datagovuk_green_belt;

-- name: GetExtDatagovukGreenBelt :one
SELECT
    *
FROM
    public.ext_datagovuk_green_belt
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukGreenBeltForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_green_belt
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukGreenBeltThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_green_belt
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukGreenBeltLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_green_belt;

-- name: NewExtDatagovukGreenBeltFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_green_belt (
        reference,
        name,
        geometry,
        entry_date,
        start_date,
        end_date,
        entity,
        green_belt_core,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (name),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (entry_date),
        sqlc.arg (start_date),
        sqlc.arg (end_date),
        sqlc.arg (entity),
        sqlc.arg (green_belt_core),
        NOW(),
        NOW()
    );

-- name: PartialUpdateExtDatagovukGreenBeltForReference :exec
UPDATE public.ext_datagovuk_green_belt
SET
    name = coalesce(sqlc.narg ('name'), name),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    start_date = coalesce(sqlc.narg ('start_date'), start_date),
    end_date = coalesce(sqlc.narg ('end_date'), end_date),
    entity = coalesce(sqlc.narg ('entity'), entity),
    green_belt_core = coalesce(sqlc.narg ('green_belt_core'), green_belt_core),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukGreenBelt :exec
DELETE FROM public.ext_datagovuk_green_belt
WHERE
    TRUE;

-- name: GetExtDatagovukGreenBeltIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_green_belt
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukGreenBeltInMvt :one
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
            COALESCE('Greenbelt: ' || name) AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_green_belt ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;