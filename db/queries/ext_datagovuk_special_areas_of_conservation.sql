-- name: GetExtDatagovukSpecialAreaOfConservationForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_special_areas_of_conservation
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukSpecialAreaOfConservationLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_special_areas_of_conservation;

-- name: NewExtDatagovukSpecialAreaOfConservationFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_special_areas_of_conservation (geometry, reference, name)
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name)
    );

-- name: PartialUpdateExtDatagovukSpecialAreaOfConservationForReference :exec
UPDATE public.ext_datagovuk_special_areas_of_conservation
SET
    name = coalesce(sqlc.narg ('name'), name),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukSpecialAreasOfConservation :exec
DELETE FROM public.ext_datagovuk_special_areas_of_conservation
WHERE
    TRUE;

-- name: GetExtDatagovukSpecialAreasOfConservationInMvt :one
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
            public.ext_datagovuk_special_areas_of_conservation ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;