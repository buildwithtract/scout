import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getLatestImportForExtSsenSubstationsGridQuery = `-- name: GetLatestImportForExtSsenSubstationsGrid :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ssen_transmission_substations_grid`;

export interface GetLatestImportForExtSsenSubstationsGridRow {
    max: string;
}

export async function getLatestImportForExtSsenSubstationsGrid(client: Client): Promise<GetLatestImportForExtSsenSubstationsGridRow | null> {
    const result = await client.query({
        text: getLatestImportForExtSsenSubstationsGridQuery,
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

export const upsertExtSsenSubstationGridQuery = `-- name: UpsertExtSsenSubstationGrid :one
INSERT INTO
    public.ext_ssen_transmission_substations_grid (
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
        public.ext_ssen_transmission_substations_grid.number
    ),
    voltage = coalesce(
        $3,
        public.ext_ssen_transmission_substations_grid.voltage
    ),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($4)::geometry,
        public.ext_ssen_transmission_substations_grid.geometry
    ),
    last_imported_at = NOW()
RETURNING
    uuid, name, number, voltage, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtSsenSubstationGridArgs {
    name: string | null;
    number: string | null;
    voltage: number | null;
    geometry: string | null;
}

export interface UpsertExtSsenSubstationGridRow {
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

export async function upsertExtSsenSubstationGrid(client: Client, args: UpsertExtSsenSubstationGridArgs): Promise<UpsertExtSsenSubstationGridRow | null> {
    const result = await client.query({
        text: upsertExtSsenSubstationGridQuery,
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

export const deleteAllExtSsenSubstationsGridQuery = `-- name: DeleteAllExtSsenSubstationsGrid :exec
DELETE FROM public.ext_ssen_transmission_substations_grid`;

export async function deleteAllExtSsenSubstationsGrid(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtSsenSubstationsGridQuery,
        values: [],
        rowMode: "array"
    });
}

