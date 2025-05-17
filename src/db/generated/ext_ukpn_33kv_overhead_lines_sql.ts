import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getLatestImportForExtUkpn33kvOverheadLinesQuery = `-- name: GetLatestImportForExtUkpn33kvOverheadLines :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ukpn_33kv_overhead_lines`;

export interface GetLatestImportForExtUkpn33kvOverheadLinesRow {
    max: string;
}

export async function getLatestImportForExtUkpn33kvOverheadLines(client: Client): Promise<GetLatestImportForExtUkpn33kvOverheadLinesRow | null> {
    const result = await client.query({
        text: getLatestImportForExtUkpn33kvOverheadLinesQuery,
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

export const upsertExtUkpn33kvOverheadLineQuery = `-- name: UpsertExtUkpn33kvOverheadLine :one
INSERT INTO
    public.ext_ukpn_33kv_overhead_lines (
        voltage,
        situation,
        geometry,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        $1,
        $2,
        ST_GeomFromGeoJSON ($3)::geometry,
        NOW(),
        NOW()
    )
ON CONFLICT (uuid) DO UPDATE
SET
    voltage = coalesce(
        $1,
        public.ext_ukpn_33kv_overhead_lines.voltage
    ),
    situation = coalesce(
        $2,
        public.ext_ukpn_33kv_overhead_lines.situation
    ),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($3)::geometry,
        public.ext_ukpn_33kv_overhead_lines.geometry
    ),
    last_imported_at = NOW()
RETURNING
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtUkpn33kvOverheadLineArgs {
    voltage: number | null;
    situation: string | null;
    geometry: string | null;
}

export interface UpsertExtUkpn33kvOverheadLineRow {
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

export async function upsertExtUkpn33kvOverheadLine(client: Client, args: UpsertExtUkpn33kvOverheadLineArgs): Promise<UpsertExtUkpn33kvOverheadLineRow | null> {
    const result = await client.query({
        text: upsertExtUkpn33kvOverheadLineQuery,
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
        lastImportedAt: row[7],
        operation: row[8]
    };
}

export const deleteAllExtUkpn33kvOverheadLinesQuery = `-- name: DeleteAllExtUkpn33kvOverheadLines :exec
DELETE FROM public.ext_ukpn_33kv_overhead_lines`;

export async function deleteAllExtUkpn33kvOverheadLines(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtUkpn33kvOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
}

