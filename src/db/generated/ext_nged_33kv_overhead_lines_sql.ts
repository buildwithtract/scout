import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtNged33kvOverheadLineQuery = `-- name: UpsertExtNged33kvOverheadLine :one
INSERT INTO
    public.ext_nged_33kv_overhead_lines (
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

export interface UpsertExtNged33kvOverheadLineArgs {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export interface UpsertExtNged33kvOverheadLineRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function upsertExtNged33kvOverheadLine(client: Client, args: UpsertExtNged33kvOverheadLineArgs): Promise<UpsertExtNged33kvOverheadLineRow | null> {
    const result = await client.query({
        text: upsertExtNged33kvOverheadLineQuery,
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

export const deleteAllExtNged33kvOverheadLinesQuery = `-- name: DeleteAllExtNged33kvOverheadLines :exec
DELETE FROM public.ext_nged_33kv_overhead_lines`;

export async function deleteAllExtNged33kvOverheadLines(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtNged33kvOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtNged33kvOverheadLinesQuery = `-- name: GetExtNged33kvOverheadLines :many
SELECT
    ext_nged_33kv_overhead_lines.uuid,
    ext_nged_33kv_overhead_lines.voltage,
    ext_nged_33kv_overhead_lines.situation,
    ext_nged_33kv_overhead_lines.geometry,
    ext_nged_33kv_overhead_lines.geometry_3857,
    ext_nged_33kv_overhead_lines.geometry_27700,
    ext_nged_33kv_overhead_lines.first_imported_at,
    ext_nged_33kv_overhead_lines.last_imported_at
FROM
    public.ext_nged_33kv_overhead_lines
ORDER BY
    ext_nged_33kv_overhead_lines.last_imported_at DESC`;

export interface GetExtNged33kvOverheadLinesRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtNged33kvOverheadLines(client: Client): Promise<GetExtNged33kvOverheadLinesRow[]> {
    const result = await client.query({
        text: getExtNged33kvOverheadLinesQuery,
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

