import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukSSSIsQuery = `-- name: GetExtDatagovukSSSIs :many
SELECT
    uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_sssi`;

export interface GetExtDatagovukSSSIsRow {
    uuid: string;
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

export async function getExtDatagovukSSSIs(client: Client): Promise<GetExtDatagovukSSSIsRow[]> {
    const result = await client.query({
        text: getExtDatagovukSSSIsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            startDate: row[4],
            endDate: row[5],
            geometry: row[6],
            geometry_3857: row[7],
            geometry_27700: row[8],
            firstImportedAt: row[9],
            lastImportedAt: row[10]
        };
    });
}

export const getExtDatagovukSSSIQuery = `-- name: GetExtDatagovukSSSI :one
SELECT
    uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_sssi
WHERE
    uuid = $1`;

export interface GetExtDatagovukSSSIArgs {
    uuid: string;
}

export interface GetExtDatagovukSSSIRow {
    uuid: string;
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

export async function getExtDatagovukSSSI(client: Client, args: GetExtDatagovukSSSIArgs): Promise<GetExtDatagovukSSSIRow | null> {
    const result = await client.query({
        text: getExtDatagovukSSSIQuery,
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
        startDate: row[4],
        endDate: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const getExtDatagovukSSSIForReferenceQuery = `-- name: GetExtDatagovukSSSIForReference :one
SELECT
    uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_sssi
WHERE
    reference = $1`;

export interface GetExtDatagovukSSSIForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukSSSIForReferenceRow {
    uuid: string;
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

export async function getExtDatagovukSSSIForReference(client: Client, args: GetExtDatagovukSSSIForReferenceArgs): Promise<GetExtDatagovukSSSIForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukSSSIForReferenceQuery,
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
        startDate: row[4],
        endDate: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const getExtDatagovukSSSILatestImportQuery = `-- name: GetExtDatagovukSSSILatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_sssi`;

export interface GetExtDatagovukSSSILatestImportRow {
    max: string;
}

export async function getExtDatagovukSSSILatestImport(client: Client): Promise<GetExtDatagovukSSSILatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukSSSILatestImportQuery,
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

export const newExtDatagovukSSSIFromWGS84Query = `-- name: NewExtDatagovukSSSIFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_sssi (
        geometry,
        reference,
        name,
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
        $6
    )`;

export interface NewExtDatagovukSSSIFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
}

export async function newExtDatagovukSSSIFromWGS84(client: Client, args: NewExtDatagovukSSSIFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukSSSIFromWGS84Query,
        values: [args.geometry, args.reference, args.name, args.entryDate, args.startDate, args.endDate],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukSSSIForReferenceQuery = `-- name: PartialUpdateExtDatagovukSSSIForReference :exec
UPDATE public.ext_datagovuk_sssi
SET
    name = coalesce($1, name),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($2)::geometry,
        geometry
    ),
    entry_date = coalesce($3, entry_date),
    start_date = coalesce($4, start_date),
    end_date = coalesce($5, end_date),
    last_imported_at = NOW()
WHERE
    reference = $6`;

export interface PartialUpdateExtDatagovukSSSIForReferenceArgs {
    name: string | null;
    geometry: string | null;
    entryDate: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    reference: string;
}

export async function partialUpdateExtDatagovukSSSIForReference(client: Client, args: PartialUpdateExtDatagovukSSSIForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukSSSIForReferenceQuery,
        values: [args.name, args.geometry, args.entryDate, args.startDate, args.endDate, args.reference],
        rowMode: "array"
    });
}

export const getExtDatagovukSSSIThatIntersectsGeometryQuery = `-- name: GetExtDatagovukSSSIThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_sssi
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukSSSIThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukSSSIThatIntersectsGeometryRow {
    uuid: string;
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

export async function getExtDatagovukSSSIThatIntersectsGeometry(client: Client, args: GetExtDatagovukSSSIThatIntersectsGeometryArgs): Promise<GetExtDatagovukSSSIThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukSSSIThatIntersectsGeometryQuery,
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
        startDate: row[4],
        endDate: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const deleteAllExtDatagovukSSSIsQuery = `-- name: DeleteAllExtDatagovukSSSIs :exec
DELETE FROM public.ext_datagovuk_sssi
WHERE
    TRUE`;

export async function deleteAllExtDatagovukSSSIs(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukSSSIsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukSSSIsWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukSSSIsWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_sssi
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetExtDatagovukSSSIsWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukSSSIsWithin1KmOfGeometryRow {
    uuid: string;
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

export async function getExtDatagovukSSSIsWithin1KmOfGeometry(client: Client, args: GetExtDatagovukSSSIsWithin1KmOfGeometryArgs): Promise<GetExtDatagovukSSSIsWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukSSSIsWithin1KmOfGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            startDate: row[4],
            endDate: row[5],
            geometry: row[6],
            geometry_3857: row[7],
            geometry_27700: row[8],
            firstImportedAt: row[9],
            lastImportedAt: row[10]
        };
    });
}

export const getExtDatagovukSSSIsInMvtQuery = `-- name: GetExtDatagovukSSSIsInMvt :one
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
            public.ext_datagovuk_sssi ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukSSSIsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukSSSIsInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukSSSIsInMvt(client: Client, args: GetExtDatagovukSSSIsInMvtArgs): Promise<GetExtDatagovukSSSIsInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukSSSIsInMvtQuery,
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

export const getExtDatagovukSSSIIntersectingGeometryQuery = `-- name: GetExtDatagovukSSSIIntersectingGeometry :many
SELECT
    uuid, reference, name, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_sssi
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukSSSIIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukSSSIIntersectingGeometryRow {
    uuid: string;
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

export async function getExtDatagovukSSSIIntersectingGeometry(client: Client, args: GetExtDatagovukSSSIIntersectingGeometryArgs): Promise<GetExtDatagovukSSSIIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukSSSIIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            startDate: row[4],
            endDate: row[5],
            geometry: row[6],
            geometry_3857: row[7],
            geometry_27700: row[8],
            firstImportedAt: row[9],
            lastImportedAt: row[10]
        };
    });
}

