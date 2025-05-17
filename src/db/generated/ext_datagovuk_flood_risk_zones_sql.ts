import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukFloodRiskZonesQuery = `-- name: GetExtDatagovukFloodRiskZones :many
SELECT
    uuid, geometry, type, zone, first_imported_at, last_imported_at, reference
FROM
    public.ext_datagovuk_flood_risk_zones`;

export interface GetExtDatagovukFloodRiskZonesRow {
    uuid: string;
    geometry: string;
    type: string;
    zone: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    reference: string;
}

export async function getExtDatagovukFloodRiskZones(client: Client): Promise<GetExtDatagovukFloodRiskZonesRow[]> {
    const result = await client.query({
        text: getExtDatagovukFloodRiskZonesQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            geometry: row[1],
            type: row[2],
            zone: row[3],
            firstImportedAt: row[4],
            lastImportedAt: row[5],
            reference: row[6]
        };
    });
}

export const getExtDatagovukFloodRiskZoneUuidsAndIntersectionsThatIntersectGeometryQuery = `-- name: GetExtDatagovukFloodRiskZoneUuidsAndIntersectionsThatIntersectGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON ($1)::geometry as geom
    )
SELECT
    uuid,
    ST_Intersection (u.geometry, i.geom)::geometry AS intersection
FROM
    public.ext_datagovuk_flood_risk_zones u,
    input_geom i
WHERE
    ST_Intersects (u.geometry, i.geom)`;

export interface GetExtDatagovukFloodRiskZoneUuidsAndIntersectionsThatIntersectGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukFloodRiskZoneUuidsAndIntersectionsThatIntersectGeometryRow {
    uuid: string;
    intersection: string;
}

export async function getExtDatagovukFloodRiskZoneUuidsAndIntersectionsThatIntersectGeometry(client: Client, args: GetExtDatagovukFloodRiskZoneUuidsAndIntersectionsThatIntersectGeometryArgs): Promise<GetExtDatagovukFloodRiskZoneUuidsAndIntersectionsThatIntersectGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukFloodRiskZoneUuidsAndIntersectionsThatIntersectGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            intersection: row[1]
        };
    });
}

export const getExtDatagovukFloodRiskZoneUuidsAndZonesThatIntersectGeometryQuery = `-- name: GetExtDatagovukFloodRiskZoneUuidsAndZonesThatIntersectGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON ($1)::geometry as geom
    )
SELECT
    uuid,
    zone
FROM
    public.ext_datagovuk_flood_risk_zones u,
    input_geom i
WHERE
    ST_Intersects (u.geometry, i.geom)`;

export interface GetExtDatagovukFloodRiskZoneUuidsAndZonesThatIntersectGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukFloodRiskZoneUuidsAndZonesThatIntersectGeometryRow {
    uuid: string;
    zone: string;
}

export async function getExtDatagovukFloodRiskZoneUuidsAndZonesThatIntersectGeometry(client: Client, args: GetExtDatagovukFloodRiskZoneUuidsAndZonesThatIntersectGeometryArgs): Promise<GetExtDatagovukFloodRiskZoneUuidsAndZonesThatIntersectGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukFloodRiskZoneUuidsAndZonesThatIntersectGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            zone: row[1]
        };
    });
}

export const newExtDatagovukFloodRiskZoneFromWGS84Query = `-- name: NewExtDatagovukFloodRiskZoneFromWGS84 :one
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
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4,
        NOW(),
        NOW()
    )
RETURNING
    uuid, geometry, type, zone, first_imported_at, last_imported_at, reference`;

export interface NewExtDatagovukFloodRiskZoneFromWGS84Args {
    geometry: string;
    reference: string;
    type: string;
    zone: string;
}

export interface NewExtDatagovukFloodRiskZoneFromWGS84Row {
    uuid: string;
    geometry: string;
    type: string;
    zone: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    reference: string;
}

export async function newExtDatagovukFloodRiskZoneFromWGS84(client: Client, args: NewExtDatagovukFloodRiskZoneFromWGS84Args): Promise<NewExtDatagovukFloodRiskZoneFromWGS84Row | null> {
    const result = await client.query({
        text: newExtDatagovukFloodRiskZoneFromWGS84Query,
        values: [args.geometry, args.reference, args.type, args.zone],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        geometry: row[1],
        type: row[2],
        zone: row[3],
        firstImportedAt: row[4],
        lastImportedAt: row[5],
        reference: row[6]
    };
}

export const deleteAllExtDatagovukFloodRiskZonesQuery = `-- name: DeleteAllExtDatagovukFloodRiskZones :exec
DELETE FROM public.ext_datagovuk_flood_risk_zones
WHERE
    TRUE`;

export async function deleteAllExtDatagovukFloodRiskZones(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukFloodRiskZonesQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukFloodRiskZoneThatIntersectsGeometryQuery = `-- name: GetExtDatagovukFloodRiskZoneThatIntersectsGeometry :one
SELECT
    uuid, geometry, type, zone, first_imported_at, last_imported_at, reference
FROM
    public.ext_datagovuk_flood_risk_zones
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukFloodRiskZoneThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukFloodRiskZoneThatIntersectsGeometryRow {
    uuid: string;
    geometry: string;
    type: string;
    zone: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    reference: string;
}

export async function getExtDatagovukFloodRiskZoneThatIntersectsGeometry(client: Client, args: GetExtDatagovukFloodRiskZoneThatIntersectsGeometryArgs): Promise<GetExtDatagovukFloodRiskZoneThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukFloodRiskZoneThatIntersectsGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        geometry: row[1],
        type: row[2],
        zone: row[3],
        firstImportedAt: row[4],
        lastImportedAt: row[5],
        reference: row[6]
    };
}

export const getExtDatagovukFloodRiskZoneLatestImportQuery = `-- name: GetExtDatagovukFloodRiskZoneLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_flood_risk_zones`;

export interface GetExtDatagovukFloodRiskZoneLatestImportRow {
    max: string;
}

export async function getExtDatagovukFloodRiskZoneLatestImport(client: Client): Promise<GetExtDatagovukFloodRiskZoneLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukFloodRiskZoneLatestImportQuery,
        values: [],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        max: row[0]
    };
}

export const partialUpdateExtDatagovukFloodRiskZoneForReferenceQuery = `-- name: PartialUpdateExtDatagovukFloodRiskZoneForReference :exec
UPDATE public.ext_datagovuk_flood_risk_zones
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        geometry
    ),
    type = coalesce($2, type),
    zone = coalesce($3, zone),
    last_imported_at = NOW()
WHERE
    reference = $4`;

export interface PartialUpdateExtDatagovukFloodRiskZoneForReferenceArgs {
    geometry: string | null;
    type: string | null;
    zone: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukFloodRiskZoneForReference(client: Client, args: PartialUpdateExtDatagovukFloodRiskZoneForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukFloodRiskZoneForReferenceQuery,
        values: [args.geometry, args.type, args.zone, args.reference],
        rowMode: "array"
    });
}

export const getExtDatagovukFloodRiskZoneForReferenceQuery = `-- name: GetExtDatagovukFloodRiskZoneForReference :one
SELECT
    uuid, geometry, type, zone, first_imported_at, last_imported_at, reference
FROM
    public.ext_datagovuk_flood_risk_zones
WHERE
    reference = $1`;

export interface GetExtDatagovukFloodRiskZoneForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukFloodRiskZoneForReferenceRow {
    uuid: string;
    geometry: string;
    type: string;
    zone: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    reference: string;
}

export async function getExtDatagovukFloodRiskZoneForReference(client: Client, args: GetExtDatagovukFloodRiskZoneForReferenceArgs): Promise<GetExtDatagovukFloodRiskZoneForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukFloodRiskZoneForReferenceQuery,
        values: [args.reference],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        geometry: row[1],
        type: row[2],
        zone: row[3],
        firstImportedAt: row[4],
        lastImportedAt: row[5],
        reference: row[6]
    };
}

export const getFloodAreasForGeometryQuery = `-- name: GetFloodAreasForGeometry :many
WITH
    flood_zones AS (
        SELECT
            e."zone",
            ST_Union (
                ST_Intersection (
                    e."geometry",
                    ST_GeomFromGeoJSON ($1)::geometry
                )
            ) AS "intersection_polygon"
        FROM
            "public"."ext_datagovuk_flood_risk_zones" e
        WHERE
            ST_Intersects (
                e."geometry",
                ST_GeomFromGeoJSON ($1)::geometry
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
    "adjusted_area" DESC`;

export interface GetFloodAreasForGeometryArgs {
    geometry: string;
}

export interface GetFloodAreasForGeometryRow {
    zone: string;
    intersectionPolygon: string;
    areaSquareMetres: number;
}

export async function getFloodAreasForGeometry(client: Client, args: GetFloodAreasForGeometryArgs): Promise<GetFloodAreasForGeometryRow[]> {
    const result = await client.query({
        text: getFloodAreasForGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            zone: row[0],
            intersectionPolygon: row[1],
            areaSquareMetres: row[2]
        };
    });
}

export const getFloodRiskZonesInMvtQuery = `-- name: GetFloodRiskZonesInMvt :one
WITH
    tile AS (
        SELECT
            ST_TileEnvelope (
                $1::int,
                $2::int,
                $3::int
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
    mvtgeom`;

export interface GetFloodRiskZonesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetFloodRiskZonesInMvtRow {
    mvt: Buffer;
}

export async function getFloodRiskZonesInMvt(client: Client, args: GetFloodRiskZonesInMvtArgs): Promise<GetFloodRiskZonesInMvtRow | null> {
    const result = await client.query({
        text: getFloodRiskZonesInMvtQuery,
        values: [args.z, args.x, args.y],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        mvt: row[0]
    };
}

