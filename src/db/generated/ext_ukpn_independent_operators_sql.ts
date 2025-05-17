import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const insertExtUkpnIndependentOperatorQuery = `-- name: InsertExtUkpnIndependentOperator :one
INSERT INTO
    public.ext_ukpn_independent_operators (geometry, first_imported_at, last_imported_at)
VALUES
    (
        ST_Transform (ST_GeomFromGeoJSON ($1), 4326)::geometry,
        NOW(),
        NOW()
    )
RETURNING
    uuid, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface InsertExtUkpnIndependentOperatorArgs {
    geometry: string;
}

export interface InsertExtUkpnIndependentOperatorRow {
    uuid: string;
    name: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function insertExtUkpnIndependentOperator(client: Client, args: InsertExtUkpnIndependentOperatorArgs): Promise<InsertExtUkpnIndependentOperatorRow | null> {
    const result = await client.query({
        text: insertExtUkpnIndependentOperatorQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        name: row[1],
        geometry: row[2],
        geometry_3857: row[3],
        geometry_27700: row[4],
        firstImportedAt: row[5],
        lastImportedAt: row[6]
    };
}

export const getLatestImportForExtUkpnIndependentOperatorsQuery = `-- name: GetLatestImportForExtUkpnIndependentOperators :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_ukpn_independent_operators`;

export interface GetLatestImportForExtUkpnIndependentOperatorsRow {
    max: string;
}

export async function getLatestImportForExtUkpnIndependentOperators(client: Client): Promise<GetLatestImportForExtUkpnIndependentOperatorsRow | null> {
    const result = await client.query({
        text: getLatestImportForExtUkpnIndependentOperatorsQuery,
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

export const deleteAllExtUkpnIndependentOperatorsQuery = `-- name: DeleteAllExtUkpnIndependentOperators :exec
DELETE FROM public.ext_ukpn_independent_operators`;

export async function deleteAllExtUkpnIndependentOperators(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtUkpnIndependentOperatorsQuery,
        values: [],
        rowMode: "array"
    });
}

