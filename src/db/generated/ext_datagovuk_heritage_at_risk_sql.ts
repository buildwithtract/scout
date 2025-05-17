import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukHeritageAtRisksQuery = `-- name: GetExtDatagovukHeritageAtRisks :many
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_at_risk`;

export interface GetExtDatagovukHeritageAtRisksRow {
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

export async function getExtDatagovukHeritageAtRisks(client: Client): Promise<GetExtDatagovukHeritageAtRisksRow[]> {
    const result = await client.query({
        text: getExtDatagovukHeritageAtRisksQuery,
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

export const getExtDatagovukHeritageAtRiskQuery = `-- name: GetExtDatagovukHeritageAtRisk :one
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    uuid = $1`;

export interface GetExtDatagovukHeritageAtRiskArgs {
    uuid: string;
}

export interface GetExtDatagovukHeritageAtRiskRow {
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

export async function getExtDatagovukHeritageAtRisk(client: Client, args: GetExtDatagovukHeritageAtRiskArgs): Promise<GetExtDatagovukHeritageAtRiskRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageAtRiskQuery,
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

export const getExtDatagovukHeritageAtRiskForReferenceQuery = `-- name: GetExtDatagovukHeritageAtRiskForReference :one
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    reference = $1`;

export interface GetExtDatagovukHeritageAtRiskForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukHeritageAtRiskForReferenceRow {
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

export async function getExtDatagovukHeritageAtRiskForReference(client: Client, args: GetExtDatagovukHeritageAtRiskForReferenceArgs): Promise<GetExtDatagovukHeritageAtRiskForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageAtRiskForReferenceQuery,
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

export const getExtDatagovukHeritageAtRiskLatestImportQuery = `-- name: GetExtDatagovukHeritageAtRiskLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_heritage_at_risk`;

export interface GetExtDatagovukHeritageAtRiskLatestImportRow {
    max: string;
}

export async function getExtDatagovukHeritageAtRiskLatestImport(client: Client): Promise<GetExtDatagovukHeritageAtRiskLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageAtRiskLatestImportQuery,
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

export const newExtDatagovukHeritageAtRiskFromWGS84Query = `-- name: NewExtDatagovukHeritageAtRiskFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_heritage_at_risk (geometry, reference, name, documentation_url)
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4
    )`;

export interface NewExtDatagovukHeritageAtRiskFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
    documentationUrl: string | null;
}

export async function newExtDatagovukHeritageAtRiskFromWGS84(client: Client, args: NewExtDatagovukHeritageAtRiskFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukHeritageAtRiskFromWGS84Query,
        values: [args.geometry, args.reference, args.name, args.documentationUrl],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukHeritageAtRiskForReferenceQuery = `-- name: PartialUpdateExtDatagovukHeritageAtRiskForReference :exec
UPDATE public.ext_datagovuk_heritage_at_risk
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

export interface PartialUpdateExtDatagovukHeritageAtRiskForReferenceArgs {
    geometry: string | null;
    name: string | null;
    documentationUrl: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukHeritageAtRiskForReference(client: Client, args: PartialUpdateExtDatagovukHeritageAtRiskForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukHeritageAtRiskForReferenceQuery,
        values: [args.geometry, args.name, args.documentationUrl, args.reference],
        rowMode: "array"
    });
}

export const getExtDatagovukHeritageAtRiskThatIntersectsGeometryQuery = `-- name: GetExtDatagovukHeritageAtRiskThatIntersectsGeometry :one
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukHeritageAtRiskThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukHeritageAtRiskThatIntersectsGeometryRow {
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

export async function getExtDatagovukHeritageAtRiskThatIntersectsGeometry(client: Client, args: GetExtDatagovukHeritageAtRiskThatIntersectsGeometryArgs): Promise<GetExtDatagovukHeritageAtRiskThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageAtRiskThatIntersectsGeometryQuery,
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

export const deleteAllExtDatagovukHeritageAtRisksQuery = `-- name: DeleteAllExtDatagovukHeritageAtRisks :exec
DELETE FROM public.ext_datagovuk_heritage_at_risk
WHERE
    TRUE`;

export async function deleteAllExtDatagovukHeritageAtRisks(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukHeritageAtRisksQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukHeritageAtRisksWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukHeritageAtRisksWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetExtDatagovukHeritageAtRisksWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukHeritageAtRisksWithin1KmOfGeometryRow {
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

export async function getExtDatagovukHeritageAtRisksWithin1KmOfGeometry(client: Client, args: GetExtDatagovukHeritageAtRisksWithin1KmOfGeometryArgs): Promise<GetExtDatagovukHeritageAtRisksWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukHeritageAtRisksWithin1KmOfGeometryQuery,
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

export const getExtDatagovukHeritageAtRiskIntersectingGeometryQuery = `-- name: GetExtDatagovukHeritageAtRiskIntersectingGeometry :many
SELECT
    uuid, reference, name, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukHeritageAtRiskIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukHeritageAtRiskIntersectingGeometryRow {
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

export async function getExtDatagovukHeritageAtRiskIntersectingGeometry(client: Client, args: GetExtDatagovukHeritageAtRiskIntersectingGeometryArgs): Promise<GetExtDatagovukHeritageAtRiskIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukHeritageAtRiskIntersectingGeometryQuery,
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

export const getExtDatagovukHeritageAtRiskInMvtQuery = `-- name: GetExtDatagovukHeritageAtRiskInMvt :one
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
            public.ext_datagovuk_heritage_at_risk ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukHeritageAtRiskInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukHeritageAtRiskInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukHeritageAtRiskInMvt(client: Client, args: GetExtDatagovukHeritageAtRiskInMvtArgs): Promise<GetExtDatagovukHeritageAtRiskInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukHeritageAtRiskInMvtQuery,
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

