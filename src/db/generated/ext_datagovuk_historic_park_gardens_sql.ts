import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukHistoricParkGardensQuery = `-- name: GetExtDatagovukHistoricParkGardens :many
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, entry_date, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_historic_park_garden`;

export interface GetExtDatagovukHistoricParkGardensRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    entryDate: Date;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHistoricParkGardens(client: Client): Promise<GetExtDatagovukHistoricParkGardensRow[]> {
    const result = await client.query({
        text: getExtDatagovukHistoricParkGardensQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            geometry: row[3],
            geometry_3857: row[4],
            geometry_27700: row[5],
            entryDate: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
}

export const getExtDatagovukHistoricParkGardenQuery = `-- name: GetExtDatagovukHistoricParkGarden :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, entry_date, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    uuid = $1`;

export interface GetExtDatagovukHistoricParkGardenArgs {
    uuid: string;
}

export interface GetExtDatagovukHistoricParkGardenRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    entryDate: Date;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHistoricParkGarden(client: Client, args: GetExtDatagovukHistoricParkGardenArgs): Promise<GetExtDatagovukHistoricParkGardenRow | null> {
    const result = await client.query({
        text: getExtDatagovukHistoricParkGardenQuery,
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
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        entryDate: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtDatagovukHistoricParkGardenForReferenceQuery = `-- name: GetExtDatagovukHistoricParkGardenForReference :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, entry_date, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    reference = $1`;

export interface GetExtDatagovukHistoricParkGardenForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukHistoricParkGardenForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    entryDate: Date;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHistoricParkGardenForReference(client: Client, args: GetExtDatagovukHistoricParkGardenForReferenceArgs): Promise<GetExtDatagovukHistoricParkGardenForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukHistoricParkGardenForReferenceQuery,
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
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        entryDate: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const newExtDatagovukHistoricParkGardenFromWGS84Query = `-- name: NewExtDatagovukHistoricParkGardenFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_historic_park_garden (geometry, reference, name, entry_date)
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4
    )
RETURNING
    uuid, reference, name, geometry, geometry_3857, geometry_27700, entry_date, first_imported_at, last_imported_at`;

export interface NewExtDatagovukHistoricParkGardenFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
    entryDate: Date;
}

export interface NewExtDatagovukHistoricParkGardenFromWGS84Row {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    entryDate: Date;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function newExtDatagovukHistoricParkGardenFromWGS84(client: Client, args: NewExtDatagovukHistoricParkGardenFromWGS84Args): Promise<NewExtDatagovukHistoricParkGardenFromWGS84Row | null> {
    const result = await client.query({
        text: newExtDatagovukHistoricParkGardenFromWGS84Query,
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
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        entryDate: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtDatagovukHistoricParkGardenThatIntersectsGeometryQuery = `-- name: GetExtDatagovukHistoricParkGardenThatIntersectsGeometry :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, entry_date, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukHistoricParkGardenThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukHistoricParkGardenThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    entryDate: Date;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHistoricParkGardenThatIntersectsGeometry(client: Client, args: GetExtDatagovukHistoricParkGardenThatIntersectsGeometryArgs): Promise<GetExtDatagovukHistoricParkGardenThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukHistoricParkGardenThatIntersectsGeometryQuery,
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
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        entryDate: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const deleteAllExtDatagovukHistoricParkGardensQuery = `-- name: DeleteAllExtDatagovukHistoricParkGardens :exec
DELETE FROM public.ext_datagovuk_historic_park_garden
WHERE
    TRUE`;

export async function deleteAllExtDatagovukHistoricParkGardens(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukHistoricParkGardensQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukHistoricParkGardenLatestImportQuery = `-- name: GetExtDatagovukHistoricParkGardenLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_historic_park_garden`;

export interface GetExtDatagovukHistoricParkGardenLatestImportRow {
    max: string;
}

export async function getExtDatagovukHistoricParkGardenLatestImport(client: Client): Promise<GetExtDatagovukHistoricParkGardenLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukHistoricParkGardenLatestImportQuery,
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

export const partialUpdateExtDatagovukHistoricParkGardenForReferenceQuery = `-- name: PartialUpdateExtDatagovukHistoricParkGardenForReference :exec
UPDATE public.ext_datagovuk_historic_park_garden
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

export interface PartialUpdateExtDatagovukHistoricParkGardenForReferenceArgs {
    geometry: string | null;
    name: string | null;
    entryDate: Date | null;
    reference: string;
}

export async function partialUpdateExtDatagovukHistoricParkGardenForReference(client: Client, args: PartialUpdateExtDatagovukHistoricParkGardenForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukHistoricParkGardenForReferenceQuery,
        values: [args.geometry, args.name, args.entryDate, args.reference],
        rowMode: "array"
    });
}

export const getExtDatagovukHistoricParkGardensWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukHistoricParkGardensWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, entry_date, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetExtDatagovukHistoricParkGardensWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukHistoricParkGardensWithin1KmOfGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    entryDate: Date;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHistoricParkGardensWithin1KmOfGeometry(client: Client, args: GetExtDatagovukHistoricParkGardensWithin1KmOfGeometryArgs): Promise<GetExtDatagovukHistoricParkGardensWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukHistoricParkGardensWithin1KmOfGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            geometry: row[3],
            geometry_3857: row[4],
            geometry_27700: row[5],
            entryDate: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
}

export const getExtDatagovukHistoricParkGardensIntersectingGeometryQuery = `-- name: GetExtDatagovukHistoricParkGardensIntersectingGeometry :many
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, entry_date, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_historic_park_garden
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukHistoricParkGardensIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukHistoricParkGardensIntersectingGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    entryDate: Date;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHistoricParkGardensIntersectingGeometry(client: Client, args: GetExtDatagovukHistoricParkGardensIntersectingGeometryArgs): Promise<GetExtDatagovukHistoricParkGardensIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukHistoricParkGardensIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            geometry: row[3],
            geometry_3857: row[4],
            geometry_27700: row[5],
            entryDate: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
}

export const getExtDatagovukHistoricParkGardenInMvtQuery = `-- name: GetExtDatagovukHistoricParkGardenInMvt :one
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
            public.ext_datagovuk_historic_park_garden ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukHistoricParkGardenInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukHistoricParkGardenInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukHistoricParkGardenInMvt(client: Client, args: GetExtDatagovukHistoricParkGardenInMvtArgs): Promise<GetExtDatagovukHistoricParkGardenInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukHistoricParkGardenInMvtQuery,
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

