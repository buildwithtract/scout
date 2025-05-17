-- name: GetExtDatagovukLocalAuthorities :many
SELECT
    *
FROM
    public.ext_datagovuk_local_authorities;

-- name: GetExtDatagovukLocalAuthority :one
SELECT
    *
FROM
    public.ext_datagovuk_local_authorities
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukLocalAuthorityForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_local_authorities
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukLocalAuthorityThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_local_authorities
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukLocalAuthorityLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_local_authorities;

-- name: NewExtDatagovukLocalAuthorityFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_local_authorities (reference, name, entry_date, geometry)
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: PartialUpdateExtDatagovukLocalAuthorityForReference :exec
UPDATE public.ext_datagovuk_local_authorities
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

-- name: DeleteAllExtDatagovukLocalAuthorities :exec
DELETE FROM public.ext_datagovuk_local_authorities
WHERE
    TRUE;

-- name: GetExtDatagovukLocalAuthoritiesInMvt :one
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
            public.ext_datagovuk_local_authorities ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;