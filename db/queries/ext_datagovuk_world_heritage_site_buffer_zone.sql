-- name: GetExtDatagovukWorldHeritageSiteBufferZoneForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_world_heritage_site_buffer_zones
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukWorldHeritageSiteBufferZoneLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_world_heritage_site_buffer_zones;

-- name: GetExtDatagovukWorldHeritageSiteBufferZonesInMvt :one
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
            public.ext_datagovuk_world_heritage_site_buffer_zones ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: NewExtDatagovukWorldHeritageSiteBufferZoneFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_world_heritage_site_buffer_zones (
        geometry,
        world_heritage_site_uuid,
        name,
        reference,
        entry_date,
        start_date,
        end_date
    )
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (world_heritage_site_uuid),
        sqlc.arg (name),
        sqlc.arg (reference),
        sqlc.arg (entry_date),
        sqlc.arg (start_date),
        sqlc.arg (end_date)
    );

-- name: PartialUpdateExtDatagovukWorldHeritageSiteBufferZoneForReference :exec
UPDATE public.ext_datagovuk_world_heritage_site_buffer_zones
SET
    name = coalesce(sqlc.narg ('name'), name),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    world_heritage_site_uuid = coalesce(
        sqlc.narg ('world_heritage_site_uuid'),
        world_heritage_site_uuid
    ),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    start_date = coalesce(sqlc.narg ('start_date'), start_date),
    end_date = coalesce(sqlc.narg ('end_date'), end_date)
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukWorldHeritageSiteBufferZones :exec
DELETE FROM public.ext_datagovuk_world_heritage_site_buffer_zones
WHERE
    TRUE;
