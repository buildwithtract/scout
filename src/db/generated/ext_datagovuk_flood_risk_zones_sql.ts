import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukFloodRiskZonesQuery = `-- name: GetExtDatagovukFloodRiskZones :many
SELECT
    uuid, reference, type, zone, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_flood_risk_zones`;

export interface GetExtDatagovukFloodRiskZonesRow {
    uuid: string;
    reference: string;
    type: string;
    zone: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
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
            reference: row[1],
            type: row[2],
            zone: row[3],
            geometry: row[4],
            geometry_3857: row[5],
            geometry_27700: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
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

export const getExtDatagovukFloodRiskZoneForReferenceQuery = `-- name: GetExtDatagovukFloodRiskZoneForReference :one
SELECT
    uuid, reference, type, zone, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_flood_risk_zones
WHERE
    reference = $1`;

export interface GetExtDatagovukFloodRiskZoneForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukFloodRiskZoneForReferenceRow {
    uuid: string;
    reference: string;
    type: string;
    zone: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
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
        reference: row[1],
        type: row[2],
        zone: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
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
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_flood_risk_zones ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
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
    uuid, reference, type, zone, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface NewExtDatagovukFloodRiskZoneFromWGS84Args {
    geometry: string;
    reference: string;
    type: string;
    zone: string;
}

export interface NewExtDatagovukFloodRiskZoneFromWGS84Row {
    uuid: string;
    reference: string;
    type: string;
    zone: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
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
        reference: row[1],
        type: row[2],
        zone: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
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

