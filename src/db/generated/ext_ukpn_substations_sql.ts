import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtUkpnSubstationQuery = `-- name: UpsertExtUkpnSubstation :one
INSERT INTO
    public.ext_ukpn_substations (
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
        ST_GeomFromGeoJSON ($1)::geometry,
        ST_Transform (ST_GeomFromGeoJSON ($1), 3857)::geometry,
        $2,
        $3,
        $4,
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO UPDATE
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        public.ext_ukpn_substations.geometry
    ),
    number = coalesce(
        $3,
        public.ext_ukpn_substations.number
    ),
    voltage = coalesce(
        $4,
        public.ext_ukpn_substations.voltage
    ),
    last_imported_at = NOW()
RETURNING
    uuid, name, number, voltage, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtUkpnSubstationArgs {
    geometry: string | null;
    name: string;
    number: string | null;
    voltage: number | null;
}

export interface UpsertExtUkpnSubstationRow {
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

export async function upsertExtUkpnSubstation(client: Client, args: UpsertExtUkpnSubstationArgs): Promise<UpsertExtUkpnSubstationRow | null> {
    const result = await client.query({
        text: upsertExtUkpnSubstationQuery,
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

export const getLatestImportForExtUkpnSubstationsQuery = `-- name: GetLatestImportForExtUkpnSubstations :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ukpn_substations`;

export interface GetLatestImportForExtUkpnSubstationsRow {
    max: string;
}

export async function getLatestImportForExtUkpnSubstations(client: Client): Promise<GetLatestImportForExtUkpnSubstationsRow | null> {
    const result = await client.query({
        text: getLatestImportForExtUkpnSubstationsQuery,
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

export const deleteAllExtUkpnSubstationsQuery = `-- name: DeleteAllExtUkpnSubstations :exec
DELETE FROM public.ext_ukpn_substations`;

export async function deleteAllExtUkpnSubstations(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtUkpnSubstationsQuery,
        values: [],
        rowMode: "array"
    });
}

