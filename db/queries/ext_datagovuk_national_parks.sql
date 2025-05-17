-- name: GetExtDatagovukNationalParks :many
SELECT
    *
FROM
    public.ext_datagovuk_national_parks;

-- name: GetExtDatagovukNationalPark :one
SELECT
    *
FROM
    public.ext_datagovuk_national_parks
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukNationalParkForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_national_parks
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukNationalParkThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_national_parks
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukNationalParkLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_national_parks;

-- name: NewExtDatagovukNationalParkFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_national_parks (reference, name, entry_date, geometry)
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: PartialUpdateExtDatagovukNationalParkForReference :exec
UPDATE public.ext_datagovuk_national_parks
SET
    name = coalesce(sqlc.narg ('name'), name),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukNationalParks :exec
DELETE FROM public.ext_datagovuk_national_parks
WHERE
    TRUE;

-- name: GetExtDatagovukNationalParksInMvt :one
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
            public.ext_datagovuk_national_parks ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: GetExtDatagovukNationalParkIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_national_parks
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );
