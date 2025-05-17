import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtOpenstreetmapHealthcareQuery = `-- name: GetExtOpenstreetmapHealthcare :many
SELECT
    uuid, name, reference, node_type, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_openstreetmap_healthcare`;

export interface GetExtOpenstreetmapHealthcareRow {
    uuid: string;
    name: string;
    reference: string;
    nodeType: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtOpenstreetmapHealthcare(client: Client): Promise<GetExtOpenstreetmapHealthcareRow[]> {
    const result = await client.query({
        text: getExtOpenstreetmapHealthcareQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            name: row[1],
            reference: row[2],
            nodeType: row[3],
            geometry: row[4],
            geometry_3857: row[5],
            geometry_27700: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8]
        };
    });
}

export const getExtOpenstreetmapHealthcareNodeQuery = `-- name: GetExtOpenstreetmapHealthcareNode :one
SELECT
    uuid, name, reference, node_type, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_openstreetmap_healthcare
WHERE
    uuid = $1`;

export interface GetExtOpenstreetmapHealthcareNodeArgs {
    uuid: string;
}

export interface GetExtOpenstreetmapHealthcareNodeRow {
    uuid: string;
    name: string;
    reference: string;
    nodeType: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtOpenstreetmapHealthcareNode(client: Client, args: GetExtOpenstreetmapHealthcareNodeArgs): Promise<GetExtOpenstreetmapHealthcareNodeRow | null> {
    const result = await client.query({
        text: getExtOpenstreetmapHealthcareNodeQuery,
        values: [args.uuid],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        name: row[1],
        reference: row[2],
        nodeType: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtOpenstreetmapHealthcareForReferenceQuery = `-- name: GetExtOpenstreetmapHealthcareForReference :one
SELECT
    uuid, name, reference, node_type, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_openstreetmap_healthcare
WHERE
    reference = $1`;

export interface GetExtOpenstreetmapHealthcareForReferenceArgs {
    reference: string;
}

export interface GetExtOpenstreetmapHealthcareForReferenceRow {
    uuid: string;
    name: string;
    reference: string;
    nodeType: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtOpenstreetmapHealthcareForReference(client: Client, args: GetExtOpenstreetmapHealthcareForReferenceArgs): Promise<GetExtOpenstreetmapHealthcareForReferenceRow | null> {
    const result = await client.query({
        text: getExtOpenstreetmapHealthcareForReferenceQuery,
        values: [args.reference],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        name: row[1],
        reference: row[2],
        nodeType: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtOpenstreetmapHealthcareLatestImportQuery = `-- name: GetExtOpenstreetmapHealthcareLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_openstreetmap_healthcare`;

export interface GetExtOpenstreetmapHealthcareLatestImportRow {
    max: string;
}

export async function getExtOpenstreetmapHealthcareLatestImport(client: Client): Promise<GetExtOpenstreetmapHealthcareLatestImportRow | null> {
    const result = await client.query({
        text: getExtOpenstreetmapHealthcareLatestImportQuery,
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

export const newOpenstreetmapHealthcareQuery = `-- name: NewOpenstreetmapHealthcare :exec
INSERT INTO
    public.ext_openstreetmap_healthcare (name, reference, node_type, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromWKB ($4, 4326)::geometry
    )`;

export interface NewOpenstreetmapHealthcareArgs {
    name: string;
    reference: string;
    nodeType: string;
    geometry: string;
}

export async function newOpenstreetmapHealthcare(client: Client, args: NewOpenstreetmapHealthcareArgs): Promise<void> {
    await client.query({
        text: newOpenstreetmapHealthcareQuery,
        values: [args.name, args.reference, args.nodeType, args.geometry],
        rowMode: "array"
    });
}

export const partialUpdateExtOpenstreetmapHealthcareQuery = `-- name: PartialUpdateExtOpenstreetmapHealthcare :exec
UPDATE public.ext_openstreetmap_healthcare
SET
    name = coalesce($1, name),
    node_type = coalesce($2, node_type),
    geometry = coalesce(
        ST_GeomFromWKB ($3, 4326)::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = $4`;

export interface PartialUpdateExtOpenstreetmapHealthcareArgs {
    name: string | null;
    nodeType: string | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtOpenstreetmapHealthcare(client: Client, args: PartialUpdateExtOpenstreetmapHealthcareArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtOpenstreetmapHealthcareQuery,
        values: [args.name, args.nodeType, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtOpenstreetmapHealthcareQuery = `-- name: DeleteAllExtOpenstreetmapHealthcare :exec
DELETE FROM public.ext_openstreetmap_healthcare
WHERE
    TRUE`;

export async function deleteAllExtOpenstreetmapHealthcare(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtOpenstreetmapHealthcareQuery,
        values: [],
        rowMode: "array"
    });
}

export const getNearestExtOpenstreetmapHealthcareByTypeQuery = `-- name: GetNearestExtOpenstreetmapHealthcareByType :many
SELECT
    uuid, name, reference, node_type, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    ST_Distance (
        geometry::geography,
        ST_GeomFromWKB ($1, 4326)::geography
    )::float AS distance
FROM
    public.ext_openstreetmap_healthcare
WHERE
    node_type = $2
ORDER BY
    distance ASC
LIMIT
    $3`;

export interface GetNearestExtOpenstreetmapHealthcareByTypeArgs {
    geometry: string;
    nodeType: string;
    numResults: string;
}

export interface GetNearestExtOpenstreetmapHealthcareByTypeRow {
    uuid: string;
    name: string;
    reference: string;
    nodeType: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    distance: number;
}

export async function getNearestExtOpenstreetmapHealthcareByType(client: Client, args: GetNearestExtOpenstreetmapHealthcareByTypeArgs): Promise<GetNearestExtOpenstreetmapHealthcareByTypeRow[]> {
    const result = await client.query({
        text: getNearestExtOpenstreetmapHealthcareByTypeQuery,
        values: [args.geometry, args.nodeType, args.numResults],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            name: row[1],
            reference: row[2],
            nodeType: row[3],
            geometry: row[4],
            geometry_3857: row[5],
            geometry_27700: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8],
            distance: row[9]
        };
    });
}

export const getExtOpenstreetmapHealthcareInMvtByTypeQuery = `-- name: GetExtOpenstreetmapHealthcareInMvtByType :one
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
            COALESCE(NULLIF(name, ''), 'Doctors') AS annotation,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_openstreetmap_healthcare ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
            AND node_type = $4
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtOpenstreetmapHealthcareInMvtByTypeArgs {
    z: number;
    x: number;
    y: number;
    nodeType: string;
}

export interface GetExtOpenstreetmapHealthcareInMvtByTypeRow {
    mvt: Buffer;
}

export async function getExtOpenstreetmapHealthcareInMvtByType(client: Client, args: GetExtOpenstreetmapHealthcareInMvtByTypeArgs): Promise<GetExtOpenstreetmapHealthcareInMvtByTypeRow | null> {
    const result = await client.query({
        text: getExtOpenstreetmapHealthcareInMvtByTypeQuery,
        values: [args.z, args.x, args.y, args.nodeType],
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

