import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukLocalNatureReservesQuery = `-- name: GetExtDatagovukLocalNatureReserves :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_nature_reserve`;

export interface GetExtDatagovukLocalNatureReservesRow {
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

export async function getExtDatagovukLocalNatureReserves(client: Client): Promise<GetExtDatagovukLocalNatureReservesRow[]> {
    const result = await client.query({
        text: getExtDatagovukLocalNatureReservesQuery,
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

export const getExtDatagovukLocalNatureReserveQuery = `-- name: GetExtDatagovukLocalNatureReserve :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    uuid = $1`;

export interface GetExtDatagovukLocalNatureReserveArgs {
    uuid: string;
}

export interface GetExtDatagovukLocalNatureReserveRow {
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

export async function getExtDatagovukLocalNatureReserve(client: Client, args: GetExtDatagovukLocalNatureReserveArgs): Promise<GetExtDatagovukLocalNatureReserveRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalNatureReserveQuery,
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

export const getExtDatagovukLocalNatureReserveForReferenceQuery = `-- name: GetExtDatagovukLocalNatureReserveForReference :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    reference = $1`;

export interface GetExtDatagovukLocalNatureReserveForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukLocalNatureReserveForReferenceRow {
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

export async function getExtDatagovukLocalNatureReserveForReference(client: Client, args: GetExtDatagovukLocalNatureReserveForReferenceArgs): Promise<GetExtDatagovukLocalNatureReserveForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalNatureReserveForReferenceQuery,
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

export const newExtDatagovukLocalNatureReserveFromWGS84Query = `-- name: NewExtDatagovukLocalNatureReserveFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_local_nature_reserve (geometry, reference, name, entry_date)
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4
    )
RETURNING
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface NewExtDatagovukLocalNatureReserveFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
    entryDate: Date;
}

export interface NewExtDatagovukLocalNatureReserveFromWGS84Row {
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

export async function newExtDatagovukLocalNatureReserveFromWGS84(client: Client, args: NewExtDatagovukLocalNatureReserveFromWGS84Args): Promise<NewExtDatagovukLocalNatureReserveFromWGS84Row | null> {
    const result = await client.query({
        text: newExtDatagovukLocalNatureReserveFromWGS84Query,
        values: [args.geometry, args.reference, args.name, args.entryDate],
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

export const getExtDatagovukLocalNatureReserveThatIntersectsGeometryQuery = `-- name: GetExtDatagovukLocalNatureReserveThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukLocalNatureReserveThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukLocalNatureReserveThatIntersectsGeometryRow {
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

export async function getExtDatagovukLocalNatureReserveThatIntersectsGeometry(client: Client, args: GetExtDatagovukLocalNatureReserveThatIntersectsGeometryArgs): Promise<GetExtDatagovukLocalNatureReserveThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalNatureReserveThatIntersectsGeometryQuery,
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

export const deleteAllExtDatagovukLocalNatureReservesQuery = `-- name: DeleteAllExtDatagovukLocalNatureReserves :exec
DELETE FROM public.ext_datagovuk_local_nature_reserve
WHERE
    TRUE`;

export async function deleteAllExtDatagovukLocalNatureReserves(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukLocalNatureReservesQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukLocalNatureReserveLatestImportQuery = `-- name: GetExtDatagovukLocalNatureReserveLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_local_nature_reserve`;

export interface GetExtDatagovukLocalNatureReserveLatestImportRow {
    max: string;
}

export async function getExtDatagovukLocalNatureReserveLatestImport(client: Client): Promise<GetExtDatagovukLocalNatureReserveLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalNatureReserveLatestImportQuery,
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

export const partialUpdateExtDatagovukLocalNatureReserveForReferenceQuery = `-- name: PartialUpdateExtDatagovukLocalNatureReserveForReference :exec
UPDATE public.ext_datagovuk_local_nature_reserve
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        geometry
    ),
    name = coalesce($2, name),
    entry_date = coalesce($3, entry_date),
    last_imported_at = NOW()
WHERE
    reference = $4`;

export interface PartialUpdateExtDatagovukLocalNatureReserveForReferenceArgs {
    geometry: string | null;
    name: string | null;
    entryDate: Date | null;
    reference: string;
}

export async function partialUpdateExtDatagovukLocalNatureReserveForReference(client: Client, args: PartialUpdateExtDatagovukLocalNatureReserveForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukLocalNatureReserveForReferenceQuery,
        values: [args.geometry, args.name, args.entryDate, args.reference],
        rowMode: "array"
    });
}

export const getExtDatagovukLocalNatureReservesWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukLocalNatureReservesWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetExtDatagovukLocalNatureReservesWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukLocalNatureReservesWithin1KmOfGeometryRow {
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

export async function getExtDatagovukLocalNatureReservesWithin1KmOfGeometry(client: Client, args: GetExtDatagovukLocalNatureReservesWithin1KmOfGeometryArgs): Promise<GetExtDatagovukLocalNatureReservesWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukLocalNatureReservesWithin1KmOfGeometryQuery,
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

export const getExtDatagovukLocalNatureReservesIntersectingGeometryQuery = `-- name: GetExtDatagovukLocalNatureReservesIntersectingGeometry :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_nature_reserve
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukLocalNatureReservesIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukLocalNatureReservesIntersectingGeometryRow {
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

export async function getExtDatagovukLocalNatureReservesIntersectingGeometry(client: Client, args: GetExtDatagovukLocalNatureReservesIntersectingGeometryArgs): Promise<GetExtDatagovukLocalNatureReservesIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukLocalNatureReservesIntersectingGeometryQuery,
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

export const getExtDatagovukLocalNatureReserveInMvtQuery = `-- name: GetExtDatagovukLocalNatureReserveInMvt :one
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
            public.ext_datagovuk_local_nature_reserve ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukLocalNatureReserveInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukLocalNatureReserveInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukLocalNatureReserveInMvt(client: Client, args: GetExtDatagovukLocalNatureReserveInMvtArgs): Promise<GetExtDatagovukLocalNatureReserveInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalNatureReserveInMvtQuery,
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

