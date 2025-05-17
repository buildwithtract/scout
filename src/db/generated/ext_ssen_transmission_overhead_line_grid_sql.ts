import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getLatestImportForExtSsenTransmissionOverheadLineGridQuery = `-- name: GetLatestImportForExtSsenTransmissionOverheadLineGrid :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ssen_transmission_overhead_line_grid`;

export interface GetLatestImportForExtSsenTransmissionOverheadLineGridRow {
    max: string;
}

export async function getLatestImportForExtSsenTransmissionOverheadLineGrid(client: Client): Promise<GetLatestImportForExtSsenTransmissionOverheadLineGridRow | null> {
    const result = await client.query({
        text: getLatestImportForExtSsenTransmissionOverheadLineGridQuery,
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

export const upsertExtSsenTransmissionOverheadLineGridQuery = `-- name: UpsertExtSsenTransmissionOverheadLineGrid :one
INSERT INTO
    public.ext_ssen_transmission_overhead_line_grid (
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
        public.ext_ssen_transmission_overhead_line_grid.voltage
    ),
    situation = coalesce(
        $2,
        public.ext_ssen_transmission_overhead_line_grid.situation
    ),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($3)::geometry,
        public.ext_ssen_transmission_overhead_line_grid.geometry
    ),
    last_imported_at = NOW()
RETURNING
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtSsenTransmissionOverheadLineGridArgs {
    voltage: number | null;
    situation: string | null;
    geometry: string | null;
}

export interface UpsertExtSsenTransmissionOverheadLineGridRow {
    uuid: string;
    voltage: number;
    situation: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtSsenTransmissionOverheadLineGrid(client: Client, args: UpsertExtSsenTransmissionOverheadLineGridArgs): Promise<UpsertExtSsenTransmissionOverheadLineGridRow | null> {
    const result = await client.query({
        text: upsertExtSsenTransmissionOverheadLineGridQuery,
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

export const deleteAllExtSsenTransmissionOverheadLineGridQuery = `-- name: DeleteAllExtSsenTransmissionOverheadLineGrid :exec
DELETE FROM public.ext_ssen_transmission_overhead_line_grid`;

export async function deleteAllExtSsenTransmissionOverheadLineGrid(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtSsenTransmissionOverheadLineGridQuery,
        values: [],
        rowMode: "array"
    });
}

