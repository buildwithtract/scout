import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukRamsarsQuery = `-- name: GetExtDatagovukRamsars :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_ramsar`;

export interface GetExtDatagovukRamsarsRow {
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

export async function getExtDatagovukRamsars(client: Client): Promise<GetExtDatagovukRamsarsRow[]> {
    const result = await client.query({
        text: getExtDatagovukRamsarsQuery,
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

export const getExtDatagovukRamsarQuery = `-- name: GetExtDatagovukRamsar :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_ramsar
WHERE
    uuid = $1`;

export interface GetExtDatagovukRamsarArgs {
    uuid: string;
}

export interface GetExtDatagovukRamsarRow {
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

export async function getExtDatagovukRamsar(client: Client, args: GetExtDatagovukRamsarArgs): Promise<GetExtDatagovukRamsarRow | null> {
    const result = await client.query({
        text: getExtDatagovukRamsarQuery,
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

export const getExtDatagovukRamsarForReferenceQuery = `-- name: GetExtDatagovukRamsarForReference :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_ramsar
WHERE
    reference = $1`;

export interface GetExtDatagovukRamsarForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukRamsarForReferenceRow {
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

export async function getExtDatagovukRamsarForReference(client: Client, args: GetExtDatagovukRamsarForReferenceArgs): Promise<GetExtDatagovukRamsarForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukRamsarForReferenceQuery,
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

export const getExtDatagovukRamsarThatIntersectsGeometryQuery = `-- name: GetExtDatagovukRamsarThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_ramsar
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukRamsarThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukRamsarThatIntersectsGeometryRow {
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

export async function getExtDatagovukRamsarThatIntersectsGeometry(client: Client, args: GetExtDatagovukRamsarThatIntersectsGeometryArgs): Promise<GetExtDatagovukRamsarThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukRamsarThatIntersectsGeometryQuery,
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

export const getExtDatagovukRamsarLatestImportQuery = `-- name: GetExtDatagovukRamsarLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_ramsar`;

export interface GetExtDatagovukRamsarLatestImportRow {
    max: string;
}

export async function getExtDatagovukRamsarLatestImport(client: Client): Promise<GetExtDatagovukRamsarLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukRamsarLatestImportQuery,
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

export const newExtDatagovukRamsarFromWGS84Query = `-- name: NewExtDatagovukRamsarFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_ramsar (geometry, reference, name, entry_date)
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4
    )`;

export interface NewExtDatagovukRamsarFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
    entryDate: Date;
}

export async function newExtDatagovukRamsarFromWGS84(client: Client, args: NewExtDatagovukRamsarFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukRamsarFromWGS84Query,
        values: [args.geometry, args.reference, args.name, args.entryDate],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukRamsarForReferenceQuery = `-- name: PartialUpdateExtDatagovukRamsarForReference :exec
UPDATE public.ext_datagovuk_ramsar
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

export interface PartialUpdateExtDatagovukRamsarForReferenceArgs {
    name: string | null;
    entryDate: Date | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukRamsarForReference(client: Client, args: PartialUpdateExtDatagovukRamsarForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukRamsarForReferenceQuery,
        values: [args.name, args.entryDate, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukRamsarsQuery = `-- name: DeleteAllExtDatagovukRamsars :exec
DELETE FROM public.ext_datagovuk_ramsar
WHERE
    TRUE`;

export async function deleteAllExtDatagovukRamsars(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukRamsarsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukRamsarsWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukRamsarsWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_ramsar
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetExtDatagovukRamsarsWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukRamsarsWithin1KmOfGeometryRow {
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

export async function getExtDatagovukRamsarsWithin1KmOfGeometry(client: Client, args: GetExtDatagovukRamsarsWithin1KmOfGeometryArgs): Promise<GetExtDatagovukRamsarsWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukRamsarsWithin1KmOfGeometryQuery,
        values: [args.geometry],
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

export const getExtDatagovukRamsarIntersectingGeometryQuery = `-- name: GetExtDatagovukRamsarIntersectingGeometry :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_ramsar
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukRamsarIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukRamsarIntersectingGeometryRow {
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

export async function getExtDatagovukRamsarIntersectingGeometry(client: Client, args: GetExtDatagovukRamsarIntersectingGeometryArgs): Promise<GetExtDatagovukRamsarIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukRamsarIntersectingGeometryQuery,
        values: [args.geometry],
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

export const getExtDatagovukRamsarInMvtQuery = `-- name: GetExtDatagovukRamsarInMvt :one
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
            ST_AsMVTGeom (
                ST_Simplify (
                    ip.geometry_3857,
                    CASE
                        WHEN $1 >= 12 THEN 0
                        ELSE GREATEST(0.5, POWER(2, 20 - $1) / 4)
                    END
                ),
                tile.envelope
            )::geometry AS geometry
        FROM
            public.ext_datagovuk_ramsar ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukRamsarInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukRamsarInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukRamsarInMvt(client: Client, args: GetExtDatagovukRamsarInMvtArgs): Promise<GetExtDatagovukRamsarInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukRamsarInMvtQuery,
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

