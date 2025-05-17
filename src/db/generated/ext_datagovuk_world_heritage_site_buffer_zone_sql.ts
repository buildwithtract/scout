import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukWorldHeritageSiteBufferZonesQuery = `-- name: GetExtDatagovukWorldHeritageSiteBufferZones :many
SELECT
    uuid, world_heritage_site_uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_world_heritage_site_buffer_zones`;

export interface GetExtDatagovukWorldHeritageSiteBufferZonesRow {
    uuid: string;
    worldHeritageSiteUuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukWorldHeritageSiteBufferZones(client: Client): Promise<GetExtDatagovukWorldHeritageSiteBufferZonesRow[]> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSiteBufferZonesQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            worldHeritageSiteUuid: row[1],
            reference: row[2],
            name: row[3],
            entryDate: row[4],
            startDate: row[5],
            endDate: row[6],
            geometry: row[7],
            geometry_3857: row[8],
            geometry_27700: row[9],
            firstImportedAt: row[10],
            lastImportedAt: row[11]
        };
    });
}

export const getExtDatagovukWorldHeritageSiteBufferZoneQuery = `-- name: GetExtDatagovukWorldHeritageSiteBufferZone :one
SELECT
    uuid, world_heritage_site_uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_world_heritage_site_buffer_zones
WHERE
    uuid = $1`;

export interface GetExtDatagovukWorldHeritageSiteBufferZoneArgs {
    uuid: string;
}

export interface GetExtDatagovukWorldHeritageSiteBufferZoneRow {
    uuid: string;
    worldHeritageSiteUuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukWorldHeritageSiteBufferZone(client: Client, args: GetExtDatagovukWorldHeritageSiteBufferZoneArgs): Promise<GetExtDatagovukWorldHeritageSiteBufferZoneRow | null> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSiteBufferZoneQuery,
        values: [args.uuid],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        worldHeritageSiteUuid: row[1],
        reference: row[2],
        name: row[3],
        entryDate: row[4],
        startDate: row[5],
        endDate: row[6],
        geometry: row[7],
        geometry_3857: row[8],
        geometry_27700: row[9],
        firstImportedAt: row[10],
        lastImportedAt: row[11]
    };
}

export const getExtDatagovukWorldHeritageSiteBufferZoneForReferenceQuery = `-- name: GetExtDatagovukWorldHeritageSiteBufferZoneForReference :one
SELECT
    uuid, world_heritage_site_uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_world_heritage_site_buffer_zones
WHERE
    reference = $1`;

export interface GetExtDatagovukWorldHeritageSiteBufferZoneForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukWorldHeritageSiteBufferZoneForReferenceRow {
    uuid: string;
    worldHeritageSiteUuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukWorldHeritageSiteBufferZoneForReference(client: Client, args: GetExtDatagovukWorldHeritageSiteBufferZoneForReferenceArgs): Promise<GetExtDatagovukWorldHeritageSiteBufferZoneForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSiteBufferZoneForReferenceQuery,
        values: [args.reference],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        worldHeritageSiteUuid: row[1],
        reference: row[2],
        name: row[3],
        entryDate: row[4],
        startDate: row[5],
        endDate: row[6],
        geometry: row[7],
        geometry_3857: row[8],
        geometry_27700: row[9],
        firstImportedAt: row[10],
        lastImportedAt: row[11]
    };
}

export const getExtDatagovukWorldHeritageSiteBufferZoneThatIntersectsGeometryQuery = `-- name: GetExtDatagovukWorldHeritageSiteBufferZoneThatIntersectsGeometry :one
SELECT
    uuid, world_heritage_site_uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_world_heritage_site_buffer_zones
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukWorldHeritageSiteBufferZoneThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukWorldHeritageSiteBufferZoneThatIntersectsGeometryRow {
    uuid: string;
    worldHeritageSiteUuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukWorldHeritageSiteBufferZoneThatIntersectsGeometry(client: Client, args: GetExtDatagovukWorldHeritageSiteBufferZoneThatIntersectsGeometryArgs): Promise<GetExtDatagovukWorldHeritageSiteBufferZoneThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSiteBufferZoneThatIntersectsGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        worldHeritageSiteUuid: row[1],
        reference: row[2],
        name: row[3],
        entryDate: row[4],
        startDate: row[5],
        endDate: row[6],
        geometry: row[7],
        geometry_3857: row[8],
        geometry_27700: row[9],
        firstImportedAt: row[10],
        lastImportedAt: row[11]
    };
}

export const getExtDatagovukWorldHeritageSiteBufferZoneWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukWorldHeritageSiteBufferZoneWithin1KmOfGeometry :many
SELECT
    uuid, world_heritage_site_uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_world_heritage_site_buffer_zones
WHERE
    geometry_3857 && ST_Expand (ST_GeomFromGeoJSON ($1)::geometry, 1000)
    AND ST_DWithin (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry,
        1000
    )
    AND NOT ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($2)::geometry
    )`;

export interface GetExtDatagovukWorldHeritageSiteBufferZoneWithin1KmOfGeometryArgs {
    stGeomfromgeojson: string;
    geometry: string;
}

export interface GetExtDatagovukWorldHeritageSiteBufferZoneWithin1KmOfGeometryRow {
    uuid: string;
    worldHeritageSiteUuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukWorldHeritageSiteBufferZoneWithin1KmOfGeometry(client: Client, args: GetExtDatagovukWorldHeritageSiteBufferZoneWithin1KmOfGeometryArgs): Promise<GetExtDatagovukWorldHeritageSiteBufferZoneWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSiteBufferZoneWithin1KmOfGeometryQuery,
        values: [args.stGeomfromgeojson, args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            worldHeritageSiteUuid: row[1],
            reference: row[2],
            name: row[3],
            entryDate: row[4],
            startDate: row[5],
            endDate: row[6],
            geometry: row[7],
            geometry_3857: row[8],
            geometry_27700: row[9],
            firstImportedAt: row[10],
            lastImportedAt: row[11]
        };
    });
}

export const getExtDatagovukWorldHeritageSiteBufferZoneLatestImportQuery = `-- name: GetExtDatagovukWorldHeritageSiteBufferZoneLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_world_heritage_site_buffer_zones`;

export interface GetExtDatagovukWorldHeritageSiteBufferZoneLatestImportRow {
    max: string;
}

export async function getExtDatagovukWorldHeritageSiteBufferZoneLatestImport(client: Client): Promise<GetExtDatagovukWorldHeritageSiteBufferZoneLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSiteBufferZoneLatestImportQuery,
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

export const getExtDatagovukWorldHeritageSiteBufferZonesInMvtQuery = `-- name: GetExtDatagovukWorldHeritageSiteBufferZonesInMvt :one
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
            name,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_world_heritage_site_buffer_zones ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukWorldHeritageSiteBufferZonesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukWorldHeritageSiteBufferZonesInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukWorldHeritageSiteBufferZonesInMvt(client: Client, args: GetExtDatagovukWorldHeritageSiteBufferZonesInMvtArgs): Promise<GetExtDatagovukWorldHeritageSiteBufferZonesInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSiteBufferZonesInMvtQuery,
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

export const newExtDatagovukWorldHeritageSiteBufferZoneFromWGS84Query = `-- name: NewExtDatagovukWorldHeritageSiteBufferZoneFromWGS84 :exec
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
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
    )`;

export interface NewExtDatagovukWorldHeritageSiteBufferZoneFromWGS84Args {
    geometry: string;
    worldHeritageSiteUuid: string;
    name: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
}

export async function newExtDatagovukWorldHeritageSiteBufferZoneFromWGS84(client: Client, args: NewExtDatagovukWorldHeritageSiteBufferZoneFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukWorldHeritageSiteBufferZoneFromWGS84Query,
        values: [args.geometry, args.worldHeritageSiteUuid, args.name, args.reference, args.entryDate, args.startDate, args.endDate],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukWorldHeritageSiteBufferZoneForReferenceQuery = `-- name: PartialUpdateExtDatagovukWorldHeritageSiteBufferZoneForReference :exec
UPDATE public.ext_datagovuk_world_heritage_site_buffer_zones
SET
    name = coalesce($1, name),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($2)::geometry,
        geometry
    ),
    world_heritage_site_uuid = coalesce(
        $3,
        world_heritage_site_uuid
    ),
    entry_date = coalesce($4, entry_date),
    start_date = coalesce($5, start_date),
    end_date = coalesce($6, end_date)
WHERE
    reference = $7`;

export interface PartialUpdateExtDatagovukWorldHeritageSiteBufferZoneForReferenceArgs {
    name: string | null;
    geometry: string | null;
    worldHeritageSiteUuid: string | null;
    entryDate: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    reference: string;
}

export async function partialUpdateExtDatagovukWorldHeritageSiteBufferZoneForReference(client: Client, args: PartialUpdateExtDatagovukWorldHeritageSiteBufferZoneForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukWorldHeritageSiteBufferZoneForReferenceQuery,
        values: [args.name, args.geometry, args.worldHeritageSiteUuid, args.entryDate, args.startDate, args.endDate, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukWorldHeritageSiteBufferZonesQuery = `-- name: DeleteAllExtDatagovukWorldHeritageSiteBufferZones :exec
DELETE FROM public.ext_datagovuk_world_heritage_site_buffer_zones
WHERE
    TRUE`;

export async function deleteAllExtDatagovukWorldHeritageSiteBufferZones(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukWorldHeritageSiteBufferZonesQuery,
        values: [],
        rowMode: "array"
    });
}

export const countExtDatagovukWorldHeritageSiteBufferZonesWithin1KmOfGeometryQuery = `-- name: CountExtDatagovukWorldHeritageSiteBufferZonesWithin1KmOfGeometry :one
SELECT
    COUNT(*)
FROM
    public.ext_datagovuk_world_heritage_site_buffer_zones
WHERE
    geometry_3857 && ST_Expand (ST_GeomFromGeoJSON ($1)::geometry, 1000)
    AND ST_DWithin (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry,
        1000
    )
    AND NOT ST_Intersects (geometry_3857, ST_GeomFromGeoJSON ($1)::geometry)`;

export interface CountExtDatagovukWorldHeritageSiteBufferZonesWithin1KmOfGeometryArgs {
    stGeomfromgeojson: string;
}

export interface CountExtDatagovukWorldHeritageSiteBufferZonesWithin1KmOfGeometryRow {
    count: string;
}

export async function countExtDatagovukWorldHeritageSiteBufferZonesWithin1KmOfGeometry(client: Client, args: CountExtDatagovukWorldHeritageSiteBufferZonesWithin1KmOfGeometryArgs): Promise<CountExtDatagovukWorldHeritageSiteBufferZonesWithin1KmOfGeometryRow | null> {
    const result = await client.query({
        text: countExtDatagovukWorldHeritageSiteBufferZonesWithin1KmOfGeometryQuery,
        values: [args.stGeomfromgeojson],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        count: row[0]
    };
}

