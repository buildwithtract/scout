import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtNpgHighVoltageOverheadLineQuery = `-- name: UpsertExtNpgHighVoltageOverheadLine :one
INSERT INTO
    public.ext_npg_high_voltage_overhead_lines (
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
        public.ext_npg_high_voltage_overhead_lines.geometry
    ),
    voltage = coalesce(
        $2,
        public.ext_npg_high_voltage_overhead_lines.voltage
    ),
    situation = coalesce(
        $3,
        public.ext_npg_high_voltage_overhead_lines.situation
    ),
    last_imported_at = NOW()
RETURNING
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtNpgHighVoltageOverheadLineArgs {
    geometry: string | null;
    voltage: number | null;
    situation: string | null;
}

export interface UpsertExtNpgHighVoltageOverheadLineRow {
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

export async function upsertExtNpgHighVoltageOverheadLine(client: Client, args: UpsertExtNpgHighVoltageOverheadLineArgs): Promise<UpsertExtNpgHighVoltageOverheadLineRow | null> {
    const result = await client.query({
        text: upsertExtNpgHighVoltageOverheadLineQuery,
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

export const getLatestImportForExtNpgHighVoltageOverheadLinesQuery = `-- name: GetLatestImportForExtNpgHighVoltageOverheadLines :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_npg_high_voltage_overhead_lines`;

export interface GetLatestImportForExtNpgHighVoltageOverheadLinesRow {
    max: string;
}

export async function getLatestImportForExtNpgHighVoltageOverheadLines(client: Client): Promise<GetLatestImportForExtNpgHighVoltageOverheadLinesRow | null> {
    const result = await client.query({
        text: getLatestImportForExtNpgHighVoltageOverheadLinesQuery,
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

export const deleteAllExtNpgHighVoltageOverheadLinesQuery = `-- name: DeleteAllExtNpgHighVoltageOverheadLines :exec
DELETE FROM public.ext_npg_high_voltage_overhead_lines`;

export async function deleteAllExtNpgHighVoltageOverheadLines(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtNpgHighVoltageOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
}

