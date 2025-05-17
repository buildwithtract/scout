-- name: GetExtDatagovukBrownfields :many
SELECT
    *
FROM
    public.ext_datagovuk_brownfield;

-- name: GetExtDatagovukBrownfield :one
SELECT
    *
FROM
    public.ext_datagovuk_brownfield
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukBrownfieldForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_brownfield
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukBrownfieldLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_brownfield;

-- name: NewExtDatagovukBrownfieldFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_brownfield (
        geometry,
        reference,
        name,
        organisation_entity,
        address,
        notes,
        ownership_status,
        minimum_net_dwellings,
        maximum_net_dwellings,
        planning_permission_date,
        planning_permission_type,
        planning_permission_status,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (organisation_entity),
        sqlc.arg (address),
        sqlc.arg (notes),
        sqlc.arg (ownership_status),
        sqlc.arg (minimum_net_dwellings),
        sqlc.arg (maximum_net_dwellings),
        sqlc.arg (planning_permission_date),
        sqlc.arg (planning_permission_type),
        sqlc.arg (planning_permission_status),
        NOW(),
        NOW()
    );

-- name: PartialUpdateExtDatagovukBrownfieldForReference :exec
UPDATE public.ext_datagovuk_brownfield
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    name = coalesce(sqlc.narg ('name'), name),
    address = coalesce(sqlc.narg ('address'), address),
    notes = coalesce(sqlc.narg ('notes'), notes),
    ownership_status = coalesce(sqlc.narg ('ownership_status'), ownership_status),
    minimum_net_dwellings = coalesce(
        sqlc.narg ('minimum_net_dwellings'),
        minimum_net_dwellings
    ),
    maximum_net_dwellings = coalesce(
        sqlc.narg ('maximum_net_dwellings'),
        maximum_net_dwellings
    ),
    planning_permission_date = coalesce(
        sqlc.narg ('planning_permission_date'),
        planning_permission_date
    ),
    planning_permission_type = coalesce(
        sqlc.narg ('planning_permission_type'),
        planning_permission_type
    ),
    planning_permission_status = coalesce(
        sqlc.narg ('planning_permission_status'),
        planning_permission_status
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukBrownfieldThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_brownfield
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: DeleteAllExtDatagovukBrownfields :exec
DELETE FROM public.ext_datagovuk_brownfield
WHERE
    TRUE;

-- name: GetExtDatagovukBrownfieldWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_brownfield
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukBrownfieldIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_brownfield
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukBrownfieldInMvt :one
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
            public.ext_datagovuk_brownfield ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;