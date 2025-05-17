import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtSsenSubstationQuery = `-- name: UpsertExtSsenSubstation :one
INSERT INTO
    public.ext_ssen_substations (
        geometry,
        geometry_3857,
        name,
        number,
        voltage,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_GeomFromWKB ($1, 4326)::geometry,
        ST_Transform (ST_GeomFromWKB ($1, 4326), 3857)::geometry,
        $2,
        $3,
        $4,
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO UPDATE
SET
    geometry = coalesce(
        ST_Transform (
            ST_GeomFromWKB ($1, 27700),
            4326
        )::geometry,
        public.ext_ssen_substations.geometry
    ),
    number = coalesce(
        $3,
        public.ext_ssen_substations.number
    ),
    voltage = coalesce(
        $4,
        public.ext_ssen_substations.voltage
    ),
    last_imported_at = NOW()
RETURNING
    uuid, name, number, voltage, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtSsenSubstationArgs {
    geometry: string | null;
    name: string;
    number: string | null;
    voltage: number | null;
}

export interface UpsertExtSsenSubstationRow {
    uuid: string;
    name: string;
    number: string | null;
    voltage: number | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtSsenSubstation(client: Client, args: UpsertExtSsenSubstationArgs): Promise<UpsertExtSsenSubstationRow | null> {
    const result = await client.query({
        text: upsertExtSsenSubstationQuery,
        values: [args.geometry, args.name, args.number, args.voltage],
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

export const getLatestImportForExtSsenSubstationsQuery = `-- name: GetLatestImportForExtSsenSubstations :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ssen_substations`;

export interface GetLatestImportForExtSsenSubstationsRow {
    max: string;
}

export async function getLatestImportForExtSsenSubstations(client: Client): Promise<GetLatestImportForExtSsenSubstationsRow | null> {
    const result = await client.query({
        text: getLatestImportForExtSsenSubstationsQuery,
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

export const deleteAllExtSsenSubstationsQuery = `-- name: DeleteAllExtSsenSubstations :exec
DELETE FROM public.ext_ssen_substations`;

export async function deleteAllExtSsenSubstations(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtSsenSubstationsQuery,
        values: [],
        rowMode: "array"
    });
}

