-- name: GetExtDatagovukFloodRiskZones :many
SELECT
    *
FROM
    public.ext_datagovuk_flood_risk_zones;

-- name: GetExtDatagovukFloodRiskZoneLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_flood_risk_zones;

-- name: GetExtDatagovukFloodRiskZoneForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_flood_risk_zones
WHERE
    reference = sqlc.arg (reference);

-- name: GetFloodRiskZonesInMvt :one
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
            zone,
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
            public.ext_datagovuk_flood_risk_zones ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: NewExtDatagovukFloodRiskZoneFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_flood_risk_zones (
        geometry,
        reference,
        type,
        zone,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (type),
        sqlc.arg (zone),
        NOW(),
        NOW()
    )
RETURNING
    *;

-- name: PartialUpdateExtDatagovukFloodRiskZoneForReference :exec
UPDATE public.ext_datagovuk_flood_risk_zones
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    type = coalesce(sqlc.narg ('type'), type),
    zone = coalesce(sqlc.narg ('zone'), zone),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukFloodRiskZones :exec
DELETE FROM public.ext_datagovuk_flood_risk_zones
WHERE
    TRUE;
