import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtEnwSubstationQuery = `-- name: UpsertExtEnwSubstation :one
INSERT INTO
    public.ext_enw_substations (
        geometry,
        geometry_3857,
        name,
        number,
        infeed_voltage,
        outfeed_voltage,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        ST_Transform (ST_GeomFromGeoJSON ($1), 3857)::geometry,
        $2,
        $3,
        $4,
        $5,
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO UPDATE
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        public.ext_enw_substations.geometry
    ),
    number = coalesce(
        $3,
        public.ext_enw_substations.number
    ),
    infeed_voltage = coalesce(
        $4,
        public.ext_enw_substations.infeed_voltage
    ),
    outfeed_voltage = coalesce(
        $5,
        public.ext_enw_substations.outfeed_voltage
    ),
    last_imported_at = NOW()
RETURNING
    uuid, name, number, infeed_voltage, outfeed_voltage, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtEnwSubstationArgs {
    geometry: string | null;
    name: string;
    number: string | null;
    infeedVoltage: number | null;
    outfeedVoltage: number | null;
}

export interface UpsertExtEnwSubstationRow {
    uuid: string;
    name: string;
    number: string | null;
    infeedVoltage: number | null;
    outfeedVoltage: number | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtEnwSubstation(client: Client, args: UpsertExtEnwSubstationArgs): Promise<UpsertExtEnwSubstationRow | null> {
    const result = await client.query({
        text: upsertExtEnwSubstationQuery,
        values: [args.geometry, args.name, args.number, args.infeedVoltage, args.outfeedVoltage],
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
        infeedVoltage: row[3],
        outfeedVoltage: row[4],
        geometry: row[5],
        geometry_3857: row[6],
        geometry_27700: row[7],
        firstImportedAt: row[8],
        lastImportedAt: row[9],
        operation: row[10]
    };
}

export const getLatestImportForExtEnwSubstationsQuery = `-- name: GetLatestImportForExtEnwSubstations :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_enw_substations`;

export interface GetLatestImportForExtEnwSubstationsRow {
    max: string;
}

export async function getLatestImportForExtEnwSubstations(client: Client): Promise<GetLatestImportForExtEnwSubstationsRow | null> {
    const result = await client.query({
        text: getLatestImportForExtEnwSubstationsQuery,
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

export const deleteAllExtEnwSubstationsQuery = `-- name: DeleteAllExtEnwSubstations :exec
DELETE FROM public.ext_enw_substations`;

export async function deleteAllExtEnwSubstations(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtEnwSubstationsQuery,
        values: [],
        rowMode: "array"
    });
}

