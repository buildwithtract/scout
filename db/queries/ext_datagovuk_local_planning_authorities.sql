-- name: GetExtDatagovukLocalPlanningAuthorities :many
SELECT
    *
FROM
    public.ext_datagovuk_local_planning_authorities;

-- name: GetExtDatagovukLocalPlanningAuthority :one
SELECT
    *
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukLocalPlanningAuthorityForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukLocalPlanningAuthorityForName :one
SELECT
    *
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    name = sqlc.arg (name);

-- name: GetExtDatagovukLocalPlanningAuthorityThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukLocalPlanningAuthorityLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_local_planning_authorities;

-- name: NewExtDatagovukLocalPlanningAuthorityFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_local_planning_authorities (
        reference,
        name,
        entry_date,
        geometry,
        normalised_name,
        local_planning_authorities_uuid
    )
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (normalised_name),
        sqlc.arg (local_planning_authorities_uuid)
    );

-- name: PartialUpdateExtDatagovukLocalPlanningAuthorityForReference :exec
UPDATE public.ext_datagovuk_local_planning_authorities
SET
    name = coalesce(sqlc.narg ('name'), name),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    normalised_name = coalesce(sqlc.narg ('normalised_name'), normalised_name),
    local_planning_authorities_uuid = coalesce(
        sqlc.narg ('local_planning_authorities_uuid'),
        local_planning_authorities_uuid
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukLocalPlanningAuthorities :exec
DELETE FROM public.ext_datagovuk_local_planning_authorities
WHERE
    TRUE;

-- name: GetAllExtDatagovukLocalPlanningAuthorities :many
SELECT
    uuid,
    reference,
    name,
    entry_date,
    ST_AsGeoJSON (geometry)::text AS geometry_geojson
FROM
    public.ext_datagovuk_local_planning_authorities;

-- name: GetExtDatagovukLocalPlanningAuthorityAtPoint :one
SELECT
    *
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    ST_Intersects (
        geometry,
        ST_SetSRID (
            ST_Point (sqlc.arg (longitude), sqlc.arg (latitude)),
            4326
        )
    )
ORDER BY
    entry_date DESC;

-- name: GetExtDatagovukLocalPlanningAuthoritiesInMvt :one
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
            public.ext_datagovuk_local_planning_authorities ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;