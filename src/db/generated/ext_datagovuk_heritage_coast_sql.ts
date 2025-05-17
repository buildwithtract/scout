import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukHeritageCoastsQuery = `-- name: GetExtDatagovukHeritageCoasts :many
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_coast`;

export interface GetExtDatagovukHeritageCoastsRow {
    uuid: string;
    reference: string;
    name: string;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHeritageCoasts(client: Client): Promise<GetExtDatagovukHeritageCoastsRow[]> {
    const result = await client.query({
        text: getExtDatagovukHeritageCoastsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            documentationUrl: row[3],
            geometry: row[4],
            geometry_3857: row[5],
            geometry_27700: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
}

export const getExtDatagovukHeritageCoastQuery = `-- name: GetExtDatagovukHeritageCoast :one
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    uuid = $1`;

export interface GetExtDatagovukHeritageCoastArgs {
    uuid: string;
}

export interface GetExtDatagovukHeritageCoastRow {
    uuid: string;
    reference: string;
    name: string;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHeritageCoast(client: Client, args: GetExtDatagovukHeritageCoastArgs): Promise<GetExtDatagovukHeritageCoastRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageCoastQuery,
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
        documentationUrl: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtDatagovukHeritageCoastForReferenceQuery = `-- name: GetExtDatagovukHeritageCoastForReference :one
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    reference = $1`;

export interface GetExtDatagovukHeritageCoastForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukHeritageCoastForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHeritageCoastForReference(client: Client, args: GetExtDatagovukHeritageCoastForReferenceArgs): Promise<GetExtDatagovukHeritageCoastForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageCoastForReferenceQuery,
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
        documentationUrl: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtDatagovukHeritageCoastLatestImportQuery = `-- name: GetExtDatagovukHeritageCoastLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_heritage_coast`;

export interface GetExtDatagovukHeritageCoastLatestImportRow {
    max: string;
}

export async function getExtDatagovukHeritageCoastLatestImport(client: Client): Promise<GetExtDatagovukHeritageCoastLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageCoastLatestImportQuery,
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

export const newExtDatagovukHeritageCoastFromWGS84Query = `-- name: NewExtDatagovukHeritageCoastFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_heritage_coast (geometry, reference, name, documentation_url)
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4
    )`;

export interface NewExtDatagovukHeritageCoastFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
    documentationUrl: string | null;
}

export async function newExtDatagovukHeritageCoastFromWGS84(client: Client, args: NewExtDatagovukHeritageCoastFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukHeritageCoastFromWGS84Query,
        values: [args.geometry, args.reference, args.name, args.documentationUrl],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukHeritageCoastForReferenceQuery = `-- name: PartialUpdateExtDatagovukHeritageCoastForReference :exec
UPDATE public.ext_datagovuk_heritage_coast
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        geometry
    ),
    name = coalesce($2, name),
    documentation_url = coalesce(
        $3,
        documentation_url
    ),
    last_imported_at = NOW()
WHERE
    reference = $4`;

export interface PartialUpdateExtDatagovukHeritageCoastForReferenceArgs {
    geometry: string | null;
    name: string | null;
    documentationUrl: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukHeritageCoastForReference(client: Client, args: PartialUpdateExtDatagovukHeritageCoastForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukHeritageCoastForReferenceQuery,
        values: [args.geometry, args.name, args.documentationUrl, args.reference],
        rowMode: "array"
    });
}

export const getExtDatagovukHeritageCoastThatIntersectsGeometryQuery = `-- name: GetExtDatagovukHeritageCoastThatIntersectsGeometry :one
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukHeritageCoastThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukHeritageCoastThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHeritageCoastThatIntersectsGeometry(client: Client, args: GetExtDatagovukHeritageCoastThatIntersectsGeometryArgs): Promise<GetExtDatagovukHeritageCoastThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageCoastThatIntersectsGeometryQuery,
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
        documentationUrl: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const deleteAllExtDatagovukHeritageCoastsQuery = `-- name: DeleteAllExtDatagovukHeritageCoasts :exec
DELETE FROM public.ext_datagovuk_heritage_coast
WHERE
    TRUE`;

export async function deleteAllExtDatagovukHeritageCoasts(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukHeritageCoastsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukHeritageCoastsWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukHeritageCoastsWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetExtDatagovukHeritageCoastsWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukHeritageCoastsWithin1KmOfGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHeritageCoastsWithin1KmOfGeometry(client: Client, args: GetExtDatagovukHeritageCoastsWithin1KmOfGeometryArgs): Promise<GetExtDatagovukHeritageCoastsWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukHeritageCoastsWithin1KmOfGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            documentationUrl: row[3],
            geometry: row[4],
            geometry_3857: row[5],
            geometry_27700: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
}

export const getExtDatagovukHeritageCoastIntersectingGeometryQuery = `-- name: GetExtDatagovukHeritageCoastIntersectingGeometry :many
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_coast
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukHeritageCoastIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukHeritageCoastIntersectingGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukHeritageCoastIntersectingGeometry(client: Client, args: GetExtDatagovukHeritageCoastIntersectingGeometryArgs): Promise<GetExtDatagovukHeritageCoastIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukHeritageCoastIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            documentationUrl: row[3],
            geometry: row[4],
            geometry_3857: row[5],
            geometry_27700: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
}

export const getExtDatagovukHeritageCoastInMvtQuery = `-- name: GetExtDatagovukHeritageCoastInMvt :one
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
            public.ext_datagovuk_heritage_coast ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukHeritageCoastInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukHeritageCoastInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukHeritageCoastInMvt(client: Client, args: GetExtDatagovukHeritageCoastInMvtArgs): Promise<GetExtDatagovukHeritageCoastInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageCoastInMvtQuery,
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

