-- name: GetExtDatagovukFloodRiskZones :many
SELECT
    *
FROM
    public.ext_datagovuk_flood_risk_zones;

-- name: GetExtDatagovukFloodRiskZoneUuidsAndIntersectionsThatIntersectGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry as geom
    )
SELECT
    uuid,
    ST_Intersection (u.geometry, i.geom)::geometry AS intersection
FROM
    public.ext_datagovuk_flood_risk_zones u,
    input_geom i
WHERE
    ST_Intersects (u.geometry, i.geom);

-- name: GetExtDatagovukFloodRiskZoneUuidsAndZonesThatIntersectGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry as geom
    )
SELECT
    uuid,
    zone
FROM
    public.ext_datagovuk_flood_risk_zones u,
    input_geom i
WHERE
    ST_Intersects (u.geometry, i.geom);

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

-- name: DeleteAllExtDatagovukFloodRiskZones :exec
DELETE FROM public.ext_datagovuk_flood_risk_zones
WHERE
    TRUE;

-- name: GetExtDatagovukFloodRiskZoneThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_flood_risk_zones
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukFloodRiskZoneLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_flood_risk_zones;

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

-- name: GetExtDatagovukFloodRiskZoneForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_flood_risk_zones
WHERE
    reference = sqlc.arg (reference);

-- name: GetFloodAreasForGeometry :many
WITH
    flood_zones AS (
        SELECT
            e."zone",
            ST_Union (
                ST_Intersection (
                    e."geometry",
                    ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
                )
            ) AS "intersection_polygon"
        FROM
            "public"."ext_datagovuk_flood_risk_zones" e
        WHERE
            ST_Intersects (
                e."geometry",
                ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
            )
        GROUP BY
            e."zone"
    ),
    zones_with_area AS (
        SELECT
            "zone",
            "intersection_polygon",
            ST_Area ("intersection_polygon"::geography) AS area
        FROM
            flood_zones
    ),
    zone_3 AS (
        SELECT
            "zone",
            "intersection_polygon" AS zone_3_geometry,
            area AS zone_3_area
        FROM
            zones_with_area
        WHERE
            "zone" = '3'
    ),
    results AS (
        SELECT
            z."zone",
            CASE
                WHEN z."zone" = '2'
                AND z3."zone_3_geometry" IS NOT NULL THEN ST_Difference (z."intersection_polygon", z3."zone_3_geometry")
                ELSE z."intersection_polygon"
            END AS "adjusted_intersection_polygon",
            CASE
                WHEN z."zone" = '2'
                AND z3."zone_3_geometry" IS NOT NULL THEN z.area - LEAST(z.area, z3.zone_3_area)
                ELSE z.area
            END AS "adjusted_area"
        FROM
            zones_with_area z
            LEFT JOIN zone_3 z3 ON true
    )
SELECT
    "zone",
    "adjusted_intersection_polygon"::geometry AS "intersection_polygon",
    "adjusted_area"::float AS "area_square_metres"
FROM
    results
ORDER BY
    "zone",
    "adjusted_area" DESC;

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
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_flood_risk_zones ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;