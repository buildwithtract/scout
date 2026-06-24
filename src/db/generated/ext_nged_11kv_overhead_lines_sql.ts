import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtNged11kvOverheadLineQuery = `-- name: UpsertExtNged11kvOverheadLine :one
INSERT INTO
    public.ext_nged_11kv_overhead_lines (
        uuid,
        voltage,
        situation,
        geometry,
        geometry_3857,
        geometry_27700,
        first_imported_at,
        last_imported_at
    )
VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (uuid) DO UPDATE
SET
    voltage = EXCLUDED.voltage,
    situation = EXCLUDED.situation,
    geometry = EXCLUDED.geometry,
    geometry_3857 = EXCLUDED.geometry_3857,
    geometry_27700 = EXCLUDED.geometry_27700,
    last_imported_at = EXCLUDED.last_imported_at
RETURNING
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface UpsertExtNged11kvOverheadLineArgs {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export interface UpsertExtNged11kvOverheadLineRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function upsertExtNged11kvOverheadLine(client: Client, args: UpsertExtNged11kvOverheadLineArgs): Promise<UpsertExtNged11kvOverheadLineRow | null> {
    const result = await client.query({
        text: upsertExtNged11kvOverheadLineQuery,
        values: [args.uuid, args.voltage, args.situation, args.geometry, args.geometry_3857, args.geometry_27700, args.firstImportedAt, args.lastImportedAt],
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

export const deleteAllExtNged11kvOverheadLinesQuery = `-- name: DeleteAllExtNged11kvOverheadLines :exec
DELETE FROM public.ext_nged_11kv_overhead_lines`;

export async function deleteAllExtNged11kvOverheadLines(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtNged11kvOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtNged11kvOverheadLinesQuery = `-- name: GetExtNged11kvOverheadLines :many
SELECT
    ext_nged_11kv_overhead_lines.uuid,
    ext_nged_11kv_overhead_lines.geometry,
    ext_nged_11kv_overhead_lines.geometry_3857,
    ext_nged_11kv_overhead_lines.voltage,
    ext_nged_11kv_overhead_lines.situation,
    ext_nged_11kv_overhead_lines.first_imported_at,
    ext_nged_11kv_overhead_lines.last_imported_at
FROM
    public.ext_nged_11kv_overhead_lines`;

export interface GetExtNged11kvOverheadLinesRow {
    uuid: string;
    geometry: string;
    geometry_3857: string;
    voltage: number | null;
    situation: string | null;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtNged11kvOverheadLines(client: Client): Promise<GetExtNged11kvOverheadLinesRow[]> {
    const result = await client.query({
        text: getExtNged11kvOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            geometry: row[1],
            geometry_3857: row[2],
            voltage: row[3],
            situation: row[4],
            firstImportedAt: row[5],
            lastImportedAt: row[6]
        };
    });
}

