import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getLatestImportForExtSsenTransmissionOverheadLineSupergridQuery = `-- name: GetLatestImportForExtSsenTransmissionOverheadLineSupergrid :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ssen_transmission_overhead_line_supergrid`;

export interface GetLatestImportForExtSsenTransmissionOverheadLineSupergridRow {
    max: string;
}

export async function getLatestImportForExtSsenTransmissionOverheadLineSupergrid(client: Client): Promise<GetLatestImportForExtSsenTransmissionOverheadLineSupergridRow | null> {
    const result = await client.query({
        text: getLatestImportForExtSsenTransmissionOverheadLineSupergridQuery,
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

export const upsertExtSsenTransmissionOverheadLineSupergridQuery = `-- name: UpsertExtSsenTransmissionOverheadLineSupergrid :one
INSERT INTO
    public.ext_ssen_transmission_overhead_line_supergrid (
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
        public.ext_ssen_transmission_overhead_line_supergrid.voltage
    ),
    situation = coalesce(
        $2,
        public.ext_ssen_transmission_overhead_line_supergrid.situation
    ),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($3)::geometry,
        public.ext_ssen_transmission_overhead_line_supergrid.geometry
    ),
    last_imported_at = NOW()
RETURNING
    uuid, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtSsenTransmissionOverheadLineSupergridArgs {
    voltage: number | null;
    situation: string | null;
    geometry: string | null;
}

export interface UpsertExtSsenTransmissionOverheadLineSupergridRow {
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

export async function upsertExtSsenTransmissionOverheadLineSupergrid(client: Client, args: UpsertExtSsenTransmissionOverheadLineSupergridArgs): Promise<UpsertExtSsenTransmissionOverheadLineSupergridRow | null> {
    const result = await client.query({
        text: upsertExtSsenTransmissionOverheadLineSupergridQuery,
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

export const deleteAllExtSsenTransmissionOverheadLineSupergridQuery = `-- name: DeleteAllExtSsenTransmissionOverheadLineSupergrid :exec
DELETE FROM public.ext_ssen_transmission_overhead_line_supergrid`;

export async function deleteAllExtSsenTransmissionOverheadLineSupergrid(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtSsenTransmissionOverheadLineSupergridQuery,
        values: [],
        rowMode: "array"
    });
}

