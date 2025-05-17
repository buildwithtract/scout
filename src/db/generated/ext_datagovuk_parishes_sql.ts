import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukParishesQuery = `-- name: GetExtDatagovukParishes :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_parishes`;

export interface GetExtDatagovukParishesRow {
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

export async function getExtDatagovukParishes(client: Client): Promise<GetExtDatagovukParishesRow[]> {
    const result = await client.query({
        text: getExtDatagovukParishesQuery,
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

export const getExtDatagovukParishQuery = `-- name: GetExtDatagovukParish :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_parishes
WHERE
    uuid = $1`;

export interface GetExtDatagovukParishArgs {
    uuid: string;
}

export interface GetExtDatagovukParishRow {
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

export async function getExtDatagovukParish(client: Client, args: GetExtDatagovukParishArgs): Promise<GetExtDatagovukParishRow | null> {
    const result = await client.query({
        text: getExtDatagovukParishQuery,
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

export const getExtDatagovukParishForReferenceQuery = `-- name: GetExtDatagovukParishForReference :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_parishes
WHERE
    reference = $1`;

export interface GetExtDatagovukParishForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukParishForReferenceRow {
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

export async function getExtDatagovukParishForReference(client: Client, args: GetExtDatagovukParishForReferenceArgs): Promise<GetExtDatagovukParishForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukParishForReferenceQuery,
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

export const getExtDatagovukParishThatIntersectsGeometryQuery = `-- name: GetExtDatagovukParishThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_parishes
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukParishThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukParishThatIntersectsGeometryRow {
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

export async function getExtDatagovukParishThatIntersectsGeometry(client: Client, args: GetExtDatagovukParishThatIntersectsGeometryArgs): Promise<GetExtDatagovukParishThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukParishThatIntersectsGeometryQuery,
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

export const getExtDatagovukParishLatestImportQuery = `-- name: GetExtDatagovukParishLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_parishes`;

export interface GetExtDatagovukParishLatestImportRow {
    max: string;
}

export async function getExtDatagovukParishLatestImport(client: Client): Promise<GetExtDatagovukParishLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukParishLatestImportQuery,
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

export const newExtDatagovukParishFromWGS84Query = `-- name: NewExtDatagovukParishFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_parishes (reference, name, entry_date, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromGeoJSON ($4)::geometry
    )`;

export interface NewExtDatagovukParishFromWGS84Args {
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
}

export async function newExtDatagovukParishFromWGS84(client: Client, args: NewExtDatagovukParishFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukParishFromWGS84Query,
        values: [args.reference, args.name, args.entryDate, args.geometry],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukParishForReferenceQuery = `-- name: PartialUpdateExtDatagovukParishForReference :exec
UPDATE public.ext_datagovuk_parishes
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

export interface PartialUpdateExtDatagovukParishForReferenceArgs {
    name: string | null;
    entryDate: Date | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukParishForReference(client: Client, args: PartialUpdateExtDatagovukParishForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukParishForReferenceQuery,
        values: [args.name, args.entryDate, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukParishesQuery = `-- name: DeleteAllExtDatagovukParishes :exec
DELETE FROM public.ext_datagovuk_parishes
WHERE
    TRUE`;

export async function deleteAllExtDatagovukParishes(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukParishesQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukParishAtPointQuery = `-- name: GetExtDatagovukParishAtPoint :one
SELECT
    uuid,
    reference,
    name,
    entry_date,
    ST_AsGeoJSON (geometry)::text AS geometry_geojson
FROM
    public.ext_datagovuk_parishes
WHERE
    ST_Intersects (
        geometry,
        ST_SetSRID (
            ST_Point ($1, $2),
            4326
        )
    )`;

export interface GetExtDatagovukParishAtPointArgs {
    longitude: string;
    latitude: string;
}

export interface GetExtDatagovukParishAtPointRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometryGeojson: string;
}

export async function getExtDatagovukParishAtPoint(client: Client, args: GetExtDatagovukParishAtPointArgs): Promise<GetExtDatagovukParishAtPointRow | null> {
    const result = await client.query({
        text: getExtDatagovukParishAtPointQuery,
        values: [args.longitude, args.latitude],
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
        geometryGeojson: row[4]
    };
}

export const getExtDatagovukParishesInMvtQuery = `-- name: GetExtDatagovukParishesInMvt :one
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
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_parishes ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukParishesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukParishesInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukParishesInMvt(client: Client, args: GetExtDatagovukParishesInMvtArgs): Promise<GetExtDatagovukParishesInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukParishesInMvtQuery,
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

