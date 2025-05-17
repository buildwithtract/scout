import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtEnw6Point6kvOverheadLineQuery = `-- name: UpsertExtEnw6Point6kvOverheadLine :one
INSERT INTO
    public.ext_enw_6_6kv_overhead_lines (
        geometry,
        geometry_3857,
        voltage,
        situation,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        ST_Transform (ST_GeomFromGeoJSON ($1), 3857)::geometry,
        $2,
        $3,
        NOW(),
        NOW()
    )
ON CONFLICT (uuid) DO UPDATE
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        public.ext_enw_6_6kv_overhead_lines.geometry
    ),
    voltage = coalesce(
        $2,
        public.ext_enw_6_6kv_overhead_lines.voltage
    ),
    situation = coalesce(
        $3,
        public.ext_enw_6_6kv_overhead_lines.situation
    ),
    last_imported_at = NOW()
RETURNING
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtEnw6Point6kvOverheadLineArgs {
    geometry: string | null;
    voltage: number | null;
    situation: string | null;
}

export interface UpsertExtEnw6Point6kvOverheadLineRow {
    uuid: string;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtEnw6Point6kvOverheadLine(client: Client, args: UpsertExtEnw6Point6kvOverheadLineArgs): Promise<UpsertExtEnw6Point6kvOverheadLineRow | null> {
    const result = await client.query({
        text: upsertExtEnw6Point6kvOverheadLineQuery,
        values: [args.geometry, args.voltage, args.situation],
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
        lastImportedAt: row[7],
        operation: row[8]
    };
}

export const getLatestImportForExtEnw6Point6kvOverheadLinesQuery = `-- name: GetLatestImportForExtEnw6Point6kvOverheadLines :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_enw_6_6kv_overhead_lines`;

export interface GetLatestImportForExtEnw6Point6kvOverheadLinesRow {
    max: string;
}

export async function getLatestImportForExtEnw6Point6kvOverheadLines(client: Client): Promise<GetLatestImportForExtEnw6Point6kvOverheadLinesRow | null> {
    const result = await client.query({
        text: getLatestImportForExtEnw6Point6kvOverheadLinesQuery,
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

export const deleteAllExtEnw6Point6kvOverheadLinesQuery = `-- name: DeleteAllExtEnw6Point6kvOverheadLines :exec
DELETE FROM public.ext_enw_6_6kv_overhead_lines`;

export async function deleteAllExtEnw6Point6kvOverheadLines(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtEnw6Point6kvOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
}

