import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukGreenBeltsQuery = `-- name: GetExtDatagovukGreenBelts :many
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, green_belt_core, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_green_belt`;

export interface GetExtDatagovukGreenBeltsRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    greenBeltCore: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukGreenBelts(client: Client): Promise<GetExtDatagovukGreenBeltsRow[]> {
    const result = await client.query({
        text: getExtDatagovukGreenBeltsQuery,
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
            entity: row[6],
            greenBeltCore: row[7],
            geometry: row[8],
            geometry_3857: row[9],
            geometry_27700: row[10],
            firstImportedAt: row[11],
            lastImportedAt: row[12]
        };
    });
}

export const getExtDatagovukGreenBeltQuery = `-- name: GetExtDatagovukGreenBelt :one
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, green_belt_core, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_green_belt
WHERE
    uuid = $1`;

export interface GetExtDatagovukGreenBeltArgs {
    uuid: string;
}

export interface GetExtDatagovukGreenBeltRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    greenBeltCore: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukGreenBelt(client: Client, args: GetExtDatagovukGreenBeltArgs): Promise<GetExtDatagovukGreenBeltRow | null> {
    const result = await client.query({
        text: getExtDatagovukGreenBeltQuery,
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
        entity: row[6],
        greenBeltCore: row[7],
        geometry: row[8],
        geometry_3857: row[9],
        geometry_27700: row[10],
        firstImportedAt: row[11],
        lastImportedAt: row[12]
    };
}

export const getExtDatagovukGreenBeltForReferenceQuery = `-- name: GetExtDatagovukGreenBeltForReference :one
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, green_belt_core, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_green_belt
WHERE
    reference = $1`;

export interface GetExtDatagovukGreenBeltForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukGreenBeltForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    greenBeltCore: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukGreenBeltForReference(client: Client, args: GetExtDatagovukGreenBeltForReferenceArgs): Promise<GetExtDatagovukGreenBeltForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukGreenBeltForReferenceQuery,
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
        entity: row[6],
        greenBeltCore: row[7],
        geometry: row[8],
        geometry_3857: row[9],
        geometry_27700: row[10],
        firstImportedAt: row[11],
        lastImportedAt: row[12]
    };
}

export const getExtDatagovukGreenBeltThatIntersectsGeometryQuery = `-- name: GetExtDatagovukGreenBeltThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, green_belt_core, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_green_belt
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukGreenBeltThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukGreenBeltThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    greenBeltCore: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukGreenBeltThatIntersectsGeometry(client: Client, args: GetExtDatagovukGreenBeltThatIntersectsGeometryArgs): Promise<GetExtDatagovukGreenBeltThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukGreenBeltThatIntersectsGeometryQuery,
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
        entity: row[6],
        greenBeltCore: row[7],
        geometry: row[8],
        geometry_3857: row[9],
        geometry_27700: row[10],
        firstImportedAt: row[11],
        lastImportedAt: row[12]
    };
}

export const getExtDatagovukGreenBeltLatestImportQuery = `-- name: GetExtDatagovukGreenBeltLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_green_belt`;

export interface GetExtDatagovukGreenBeltLatestImportRow {
    max: string;
}

export async function getExtDatagovukGreenBeltLatestImport(client: Client): Promise<GetExtDatagovukGreenBeltLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukGreenBeltLatestImportQuery,
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

export const newExtDatagovukGreenBeltFromWGS84Query = `-- name: NewExtDatagovukGreenBeltFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_green_belt (
        reference,
        name,
        geometry,
        entry_date,
        start_date,
        end_date,
        entity,
        green_belt_core,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        $1,
        $2,
        ST_GeomFromGeoJSON ($3)::geometry,
        $4,
        $5,
        $6,
        $7,
        $8,
        NOW(),
        NOW()
    )`;

export interface NewExtDatagovukGreenBeltFromWGS84Args {
    reference: string;
    name: string;
    geometry: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    greenBeltCore: string;
}

export async function newExtDatagovukGreenBeltFromWGS84(client: Client, args: NewExtDatagovukGreenBeltFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukGreenBeltFromWGS84Query,
        values: [args.reference, args.name, args.geometry, args.entryDate, args.startDate, args.endDate, args.entity, args.greenBeltCore],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukGreenBeltForReferenceQuery = `-- name: PartialUpdateExtDatagovukGreenBeltForReference :exec
UPDATE public.ext_datagovuk_green_belt
SET
    name = coalesce($1, name),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($2)::geometry,
        geometry
    ),
    entry_date = coalesce($3, entry_date),
    start_date = coalesce($4, start_date),
    end_date = coalesce($5, end_date),
    entity = coalesce($6, entity),
    green_belt_core = coalesce($7, green_belt_core),
    last_imported_at = NOW()
WHERE
    reference = $8`;

export interface PartialUpdateExtDatagovukGreenBeltForReferenceArgs {
    name: string | null;
    geometry: string | null;
    entryDate: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    greenBeltCore: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukGreenBeltForReference(client: Client, args: PartialUpdateExtDatagovukGreenBeltForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukGreenBeltForReferenceQuery,
        values: [args.name, args.geometry, args.entryDate, args.startDate, args.endDate, args.entity, args.greenBeltCore, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukGreenBeltQuery = `-- name: DeleteAllExtDatagovukGreenBelt :exec
DELETE FROM public.ext_datagovuk_green_belt
WHERE
    TRUE`;

export async function deleteAllExtDatagovukGreenBelt(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukGreenBeltQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukGreenBeltIntersectingGeometryQuery = `-- name: GetExtDatagovukGreenBeltIntersectingGeometry :many
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, green_belt_core, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_green_belt
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukGreenBeltIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukGreenBeltIntersectingGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    greenBeltCore: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukGreenBeltIntersectingGeometry(client: Client, args: GetExtDatagovukGreenBeltIntersectingGeometryArgs): Promise<GetExtDatagovukGreenBeltIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukGreenBeltIntersectingGeometryQuery,
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
            entity: row[6],
            greenBeltCore: row[7],
            geometry: row[8],
            geometry_3857: row[9],
            geometry_27700: row[10],
            firstImportedAt: row[11],
            lastImportedAt: row[12]
        };
    });
}

export const getExtDatagovukGreenBeltInMvtQuery = `-- name: GetExtDatagovukGreenBeltInMvt :one
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
            COALESCE('Greenbelt: ' || name) AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_green_belt ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukGreenBeltInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukGreenBeltInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukGreenBeltInMvt(client: Client, args: GetExtDatagovukGreenBeltInMvtArgs): Promise<GetExtDatagovukGreenBeltInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukGreenBeltInMvtQuery,
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

