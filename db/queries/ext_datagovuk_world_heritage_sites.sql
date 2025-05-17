-- name: GetExtDatagovukWorldHeritageSiteForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_world_heritage_sites
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukWorldHeritageSiteLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_world_heritage_sites;

-- name: GetExtDatagovukWorldHeritageSitesInMvt :one
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
            public.ext_datagovuk_world_heritage_sites ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: NewExtDatagovukWorldHeritageSiteFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_world_heritage_sites (
        geometry,
        name,
        reference,
        entry_date,
        start_date,
        end_date,
        entity,
        notes,
        documentation_url
    )
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (name),
        sqlc.arg (reference),
        sqlc.arg (entry_date),
        sqlc.arg (start_date),
        sqlc.arg (end_date),
        sqlc.arg (entity),
        sqlc.arg (notes),
        sqlc.arg (documentation_url)
    );

-- name: PartialUpdateExtDatagovukWorldHeritageSiteForReference :exec
UPDATE public.ext_datagovuk_world_heritage_sites
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
    notes = coalesce(sqlc.narg ('notes'), notes),
    documentation_url = coalesce(
        sqlc.narg ('documentation_url'),
        documentation_url
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukWorldHeritageSites :exec
DELETE FROM public.ext_datagovuk_world_heritage_sites
WHERE
    TRUE;