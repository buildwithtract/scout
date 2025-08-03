import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtNged66kvOverheadLineQuery = `-- name: UpsertExtNged66kvOverheadLine :one
INSERT INTO
    public.ext_nged_66kv_overhead_lines (voltage, situation, geometry)
VALUES
    ($1, $2, $3)
ON CONFLICT (uuid) DO UPDATE
SET
    voltage = EXCLUDED.voltage,
    situation = EXCLUDED.situation,
    geometry = EXCLUDED.geometry,
    last_imported_at = now()
RETURNING
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface UpsertExtNged66kvOverheadLineArgs {
    voltage: number | null;
    situation: string | null;
    geometry: string;
}

export interface UpsertExtNged66kvOverheadLineRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function upsertExtNged66kvOverheadLine(client: Client, args: UpsertExtNged66kvOverheadLineArgs): Promise<UpsertExtNged66kvOverheadLineRow | null> {
    const result = await client.query({
        text: upsertExtNged66kvOverheadLineQuery,
        values: [args.voltage, args.situation, args.geometry],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        voltage: row[1],
        situation: row[2],
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        firstImportedAt: row[6],
        lastImportedAt: row[7]
    };
}

export const deleteExtNged66kvOverheadLineQuery = `-- name: DeleteExtNged66kvOverheadLine :exec
DELETE FROM public.ext_nged_66kv_overhead_lines
WHERE
    uuid = $1`;

export interface DeleteExtNged66kvOverheadLineArgs {
    uuid: string;
}

export async function deleteExtNged66kvOverheadLine(client: Client, args: DeleteExtNged66kvOverheadLineArgs): Promise<void> {
    await client.query({
        text: deleteExtNged66kvOverheadLineQuery,
        values: [args.uuid],
        rowMode: "array"
    });
}

export const getExtNged66kvOverheadLineQuery = `-- name: GetExtNged66kvOverheadLine :one
SELECT
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_nged_66kv_overhead_lines
WHERE
    uuid = $1`;

export interface GetExtNged66kvOverheadLineArgs {
    uuid: string;
}

export interface GetExtNged66kvOverheadLineRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtNged66kvOverheadLine(client: Client, args: GetExtNged66kvOverheadLineArgs): Promise<GetExtNged66kvOverheadLineRow | null> {
    const result = await client.query({
        text: getExtNged66kvOverheadLineQuery,
        values: [args.uuid],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        voltage: row[1],
        situation: row[2],
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        firstImportedAt: row[6],
        lastImportedAt: row[7]
    };
}

export const listExtNged66kvOverheadLinesQuery = `-- name: ListExtNged66kvOverheadLines :many
SELECT
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_nged_66kv_overhead_lines
ORDER BY
    first_imported_at DESC`;

export interface ListExtNged66kvOverheadLinesRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function listExtNged66kvOverheadLines(client: Client): Promise<ListExtNged66kvOverheadLinesRow[]> {
    const result = await client.query({
        text: listExtNged66kvOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            voltage: row[1],
            situation: row[2],
            geometry: row[3],
            geometry_3857: row[4],
            geometry_27700: row[5],
            firstImportedAt: row[6],
            lastImportedAt: row[7]
        };
    });
}

export const truncateExtNged66kvOverheadLinesQuery = `-- name: TruncateExtNged66kvOverheadLines :exec
TRUNCATE TABLE public.ext_nged_66kv_overhead_lines`;

export async function truncateExtNged66kvOverheadLines(client: Client): Promise<void> {
    await client.query({
        text: truncateExtNged66kvOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
}

