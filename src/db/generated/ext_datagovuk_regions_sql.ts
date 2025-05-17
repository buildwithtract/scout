import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukRegionsQuery = `-- name: GetExtDatagovukRegions :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_regions`;

export interface GetExtDatagovukRegionsRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukRegions(client: Client): Promise<GetExtDatagovukRegionsRow[]> {
    const result = await client.query({
        text: getExtDatagovukRegionsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            geometry: row[4],
            geometry_3857: row[5],
            geometry_27700: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
}

export const getExtDatagovukRegionQuery = `-- name: GetExtDatagovukRegion :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_regions
WHERE
    uuid = $1`;

export interface GetExtDatagovukRegionArgs {
    uuid: string;
}

export interface GetExtDatagovukRegionRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukRegion(client: Client, args: GetExtDatagovukRegionArgs): Promise<GetExtDatagovukRegionRow | null> {
    const result = await client.query({
        text: getExtDatagovukRegionQuery,
        values: [args.uuid],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        reference: row[1],
        name: row[2],
        entryDate: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtDatagovukRegionForReferenceQuery = `-- name: GetExtDatagovukRegionForReference :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_regions
WHERE
    reference = $1`;

export interface GetExtDatagovukRegionForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukRegionForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukRegionForReference(client: Client, args: GetExtDatagovukRegionForReferenceArgs): Promise<GetExtDatagovukRegionForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukRegionForReferenceQuery,
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
        name: row[2],
        entryDate: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtDatagovukRegionThatIntersectsGeometryQuery = `-- name: GetExtDatagovukRegionThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_regions
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukRegionThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukRegionThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukRegionThatIntersectsGeometry(client: Client, args: GetExtDatagovukRegionThatIntersectsGeometryArgs): Promise<GetExtDatagovukRegionThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukRegionThatIntersectsGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        reference: row[1],
        name: row[2],
        entryDate: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtDatagovukRegionLatestImportQuery = `-- name: GetExtDatagovukRegionLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_regions`;

export interface GetExtDatagovukRegionLatestImportRow {
    max: string;
}

export async function getExtDatagovukRegionLatestImport(client: Client): Promise<GetExtDatagovukRegionLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukRegionLatestImportQuery,
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

export const newExtDatagovukRegionFromWGS84Query = `-- name: NewExtDatagovukRegionFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_regions (reference, name, entry_date, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromGeoJSON ($4)::geometry
    )`;

export interface NewExtDatagovukRegionFromWGS84Args {
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
}

export async function newExtDatagovukRegionFromWGS84(client: Client, args: NewExtDatagovukRegionFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukRegionFromWGS84Query,
        values: [args.reference, args.name, args.entryDate, args.geometry],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukRegionForReferenceQuery = `-- name: PartialUpdateExtDatagovukRegionForReference :exec
UPDATE public.ext_datagovuk_regions
SET
    name = coalesce($1, name),
    entry_date = coalesce($2, entry_date),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($3)::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = $4`;

export interface PartialUpdateExtDatagovukRegionForReferenceArgs {
    name: string | null;
    entryDate: Date | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukRegionForReference(client: Client, args: PartialUpdateExtDatagovukRegionForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukRegionForReferenceQuery,
        values: [args.name, args.entryDate, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukRegionsQuery = `-- name: DeleteAllExtDatagovukRegions :exec
DELETE FROM public.ext_datagovuk_regions
WHERE
    TRUE`;

export async function deleteAllExtDatagovukRegions(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukRegionsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukRegionsByUuidsQuery = `-- name: GetExtDatagovukRegionsByUuids :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_regions
WHERE
    uuid = ANY ($1::uuid[])`;

export interface GetExtDatagovukRegionsByUuidsArgs {
    uuids: string[];
}

export interface GetExtDatagovukRegionsByUuidsRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukRegionsByUuids(client: Client, args: GetExtDatagovukRegionsByUuidsArgs): Promise<GetExtDatagovukRegionsByUuidsRow[]> {
    const result = await client.query({
        text: getExtDatagovukRegionsByUuidsQuery,
        values: [args.uuids],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            geometry: row[4],
            geometry_3857: row[5],
            geometry_27700: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
}

export const getExtDatagovukRegionsInMvtQuery = `-- name: GetExtDatagovukRegionsInMvt :one
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
            public.ext_datagovuk_regions ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukRegionsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukRegionsInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukRegionsInMvt(client: Client, args: GetExtDatagovukRegionsInMvtArgs): Promise<GetExtDatagovukRegionsInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukRegionsInMvtQuery,
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

