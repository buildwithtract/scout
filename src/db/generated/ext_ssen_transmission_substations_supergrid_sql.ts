import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getLatestImportForExtSsenSubstationsSupergridQuery = `-- name: GetLatestImportForExtSsenSubstationsSupergrid :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ssen_transmission_substations_supergrid`;

export interface GetLatestImportForExtSsenSubstationsSupergridRow {
    max: string;
}

export async function getLatestImportForExtSsenSubstationsSupergrid(client: Client): Promise<GetLatestImportForExtSsenSubstationsSupergridRow | null> {
    const result = await client.query({
        text: getLatestImportForExtSsenSubstationsSupergridQuery,
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

export const upsertExtSsenSubstationSupergridQuery = `-- name: UpsertExtSsenSubstationSupergrid :one
INSERT INTO
    public.ext_ssen_transmission_substations_supergrid (
        name,
        number,
        voltage,
        geometry,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromGeoJSON ($4)::geometry,
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO UPDATE
SET
    number = coalesce(
        $2,
        public.ext_ssen_transmission_substations_supergrid.number
    ),
    voltage = coalesce(
        $3,
        public.ext_ssen_transmission_substations_supergrid.voltage
    ),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($4)::geometry,
        public.ext_ssen_transmission_substations_supergrid.geometry
    ),
    last_imported_at = NOW()
RETURNING
    uuid, name, number, voltage, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtSsenSubstationSupergridArgs {
    name: string | null;
    number: string | null;
    voltage: number | null;
    geometry: string | null;
}

export interface UpsertExtSsenSubstationSupergridRow {
    uuid: string;
    name: string | null;
    number: string | null;
    voltage: number | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtSsenSubstationSupergrid(client: Client, args: UpsertExtSsenSubstationSupergridArgs): Promise<UpsertExtSsenSubstationSupergridRow | null> {
    const result = await client.query({
        text: upsertExtSsenSubstationSupergridQuery,
        values: [args.name, args.number, args.voltage, args.geometry],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        name: row[1],
        number: row[2],
        voltage: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8],
        operation: row[9]
    };
}

export const deleteAllExtSsenSubstationsSupergridQuery = `-- name: DeleteAllExtSsenSubstationsSupergrid :exec
DELETE FROM public.ext_ssen_transmission_substations_supergrid`;

export async function deleteAllExtSsenSubstationsSupergrid(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtSsenSubstationsSupergridQuery,
        values: [],
        rowMode: "array"
    });
}

