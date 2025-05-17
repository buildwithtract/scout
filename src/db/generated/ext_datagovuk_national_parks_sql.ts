import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukNationalParksQuery = `-- name: GetExtDatagovukNationalParks :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_national_parks`;

export interface GetExtDatagovukNationalParksRow {
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

export async function getExtDatagovukNationalParks(client: Client): Promise<GetExtDatagovukNationalParksRow[]> {
    const result = await client.query({
        text: getExtDatagovukNationalParksQuery,
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

export const getExtDatagovukNationalParkQuery = `-- name: GetExtDatagovukNationalPark :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_national_parks
WHERE
    uuid = $1`;

export interface GetExtDatagovukNationalParkArgs {
    uuid: string;
}

export interface GetExtDatagovukNationalParkRow {
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

export async function getExtDatagovukNationalPark(client: Client, args: GetExtDatagovukNationalParkArgs): Promise<GetExtDatagovukNationalParkRow | null> {
    const result = await client.query({
        text: getExtDatagovukNationalParkQuery,
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

export const getExtDatagovukNationalParkForReferenceQuery = `-- name: GetExtDatagovukNationalParkForReference :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_national_parks
WHERE
    reference = $1`;

export interface GetExtDatagovukNationalParkForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukNationalParkForReferenceRow {
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

export async function getExtDatagovukNationalParkForReference(client: Client, args: GetExtDatagovukNationalParkForReferenceArgs): Promise<GetExtDatagovukNationalParkForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukNationalParkForReferenceQuery,
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

export const getExtDatagovukNationalParkThatIntersectsGeometryQuery = `-- name: GetExtDatagovukNationalParkThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_national_parks
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukNationalParkThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukNationalParkThatIntersectsGeometryRow {
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

export async function getExtDatagovukNationalParkThatIntersectsGeometry(client: Client, args: GetExtDatagovukNationalParkThatIntersectsGeometryArgs): Promise<GetExtDatagovukNationalParkThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukNationalParkThatIntersectsGeometryQuery,
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

export const getExtDatagovukNationalParkLatestImportQuery = `-- name: GetExtDatagovukNationalParkLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_national_parks`;

export interface GetExtDatagovukNationalParkLatestImportRow {
    max: string;
}

export async function getExtDatagovukNationalParkLatestImport(client: Client): Promise<GetExtDatagovukNationalParkLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukNationalParkLatestImportQuery,
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

export const newExtDatagovukNationalParkFromWGS84Query = `-- name: NewExtDatagovukNationalParkFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_national_parks (reference, name, entry_date, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromGeoJSON ($4)::geometry
    )`;

export interface NewExtDatagovukNationalParkFromWGS84Args {
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
}

export async function newExtDatagovukNationalParkFromWGS84(client: Client, args: NewExtDatagovukNationalParkFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukNationalParkFromWGS84Query,
        values: [args.reference, args.name, args.entryDate, args.geometry],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukNationalParkForReferenceQuery = `-- name: PartialUpdateExtDatagovukNationalParkForReference :exec
UPDATE public.ext_datagovuk_national_parks
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

export interface PartialUpdateExtDatagovukNationalParkForReferenceArgs {
    name: string | null;
    entryDate: Date | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukNationalParkForReference(client: Client, args: PartialUpdateExtDatagovukNationalParkForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukNationalParkForReferenceQuery,
        values: [args.name, args.entryDate, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukNationalParksQuery = `-- name: DeleteAllExtDatagovukNationalParks :exec
DELETE FROM public.ext_datagovuk_national_parks
WHERE
    TRUE`;

export async function deleteAllExtDatagovukNationalParks(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukNationalParksQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukNationalParksInMvtQuery = `-- name: GetExtDatagovukNationalParksInMvt :one
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
            public.ext_datagovuk_national_parks ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukNationalParksInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukNationalParksInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukNationalParksInMvt(client: Client, args: GetExtDatagovukNationalParksInMvtArgs): Promise<GetExtDatagovukNationalParksInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukNationalParksInMvtQuery,
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

export const getExtDatagovukNationalParkIntersectingGeometryQuery = `-- name: GetExtDatagovukNationalParkIntersectingGeometry :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_national_parks
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukNationalParkIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukNationalParkIntersectingGeometryRow {
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

export async function getExtDatagovukNationalParkIntersectingGeometry(client: Client, args: GetExtDatagovukNationalParkIntersectingGeometryArgs): Promise<GetExtDatagovukNationalParkIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukNationalParkIntersectingGeometryQuery,
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

