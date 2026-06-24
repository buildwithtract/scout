import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtNged132kvOverheadLineQuery = `-- name: UpsertExtNged132kvOverheadLine :one
INSERT INTO
    public.ext_nged_132kv_overhead_lines (voltage, situation, geometry)
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

export interface UpsertExtNged132kvOverheadLineArgs {
    voltage: number | null;
    situation: string | null;
    geometry: string;
}

export interface UpsertExtNged132kvOverheadLineRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function upsertExtNged132kvOverheadLine(client: Client, args: UpsertExtNged132kvOverheadLineArgs): Promise<UpsertExtNged132kvOverheadLineRow | null> {
    const result = await client.query({
        text: upsertExtNged132kvOverheadLineQuery,
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

export const deleteExtNged132kvOverheadLineQuery = `-- name: DeleteExtNged132kvOverheadLine :exec
DELETE FROM public.ext_nged_132kv_overhead_lines
WHERE
    uuid = $1`;

export interface DeleteExtNged132kvOverheadLineArgs {
    uuid: string;
}

export async function deleteExtNged132kvOverheadLine(client: Client, args: DeleteExtNged132kvOverheadLineArgs): Promise<void> {
    await client.query({
        text: deleteExtNged132kvOverheadLineQuery,
        values: [args.uuid],
        rowMode: "array"
    });
}

export const getExtNged132kvOverheadLineQuery = `-- name: GetExtNged132kvOverheadLine :one
SELECT
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_nged_132kv_overhead_lines
WHERE
    uuid = $1`;

export interface GetExtNged132kvOverheadLineArgs {
    uuid: string;
}

export interface GetExtNged132kvOverheadLineRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtNged132kvOverheadLine(client: Client, args: GetExtNged132kvOverheadLineArgs): Promise<GetExtNged132kvOverheadLineRow | null> {
    const result = await client.query({
        text: getExtNged132kvOverheadLineQuery,
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

export const listExtNged132kvOverheadLinesQuery = `-- name: ListExtNged132kvOverheadLines :many
SELECT
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_nged_132kv_overhead_lines
ORDER BY
    first_imported_at DESC`;

export interface ListExtNged132kvOverheadLinesRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function listExtNged132kvOverheadLines(client: Client): Promise<ListExtNged132kvOverheadLinesRow[]> {
    const result = await client.query({
        text: listExtNged132kvOverheadLinesQuery,
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

export const truncateExtNged132kvOverheadLinesQuery = `-- name: TruncateExtNged132kvOverheadLines :exec
TRUNCATE TABLE public.ext_nged_132kv_overhead_lines`;

export async function truncateExtNged132kvOverheadLines(client: Client): Promise<void> {
    await client.query({
        text: truncateExtNged132kvOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
}

