import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getLatestImportForExtNgetOverheadLinesQuery = `-- name: GetLatestImportForExtNgetOverheadLines :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_nget_overhead_lines`;

export interface GetLatestImportForExtNgetOverheadLinesRow {
    max: string;
}

export async function getLatestImportForExtNgetOverheadLines(client: Client): Promise<GetLatestImportForExtNgetOverheadLinesRow | null> {
    const result = await client.query({
        text: getLatestImportForExtNgetOverheadLinesQuery,
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

export const getExtNgetOverheadLinesInMvtQuery = `-- name: GetExtNgetOverheadLinesInMvt :one
WITH
    tile AS (
        SELECT
            ST_TileEnvelope (
                $1::int,
                $2::int,
                $3::int
            ) as envelope
    ),
    mvtgeom AS (
        SELECT
            uuid,
            circuit_one || ' (Voltage: ' || voltage || 'kV)' AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_nget_overhead_lines ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtNgetOverheadLinesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtNgetOverheadLinesInMvtRow {
    mvt: Buffer;
}

export async function getExtNgetOverheadLinesInMvt(client: Client, args: GetExtNgetOverheadLinesInMvtArgs): Promise<GetExtNgetOverheadLinesInMvtRow | null> {
    const result = await client.query({
        text: getExtNgetOverheadLinesInMvtQuery,
        values: [args.z, args.x, args.y],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        mvt: row[0]
    };
}

export const upsertExtNgetOverheadLineQuery = `-- name: UpsertExtNgetOverheadLine :one
INSERT INTO
    public.ext_nget_overhead_lines (
        reference,
        status,
        circuit_one,
        circuit_two,
        voltage,
        situation,
        geometry,
        geometry_3857,
        geometry_27700,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        ST_SetSRID (ST_GeomFromGeoJSON ($7), 4326),
        ST_Transform (
            ST_SetSRID (ST_GeomFromGeoJSON ($7), 4326),
            3857
        ),
        ST_Transform (
            ST_SetSRID (ST_GeomFromGeoJSON ($7), 4326),
            27700
        ),
        COALESCE($8, NOW()),
        NOW()
    )
ON CONFLICT (reference) DO UPDATE
SET
    status = EXCLUDED.status,
    circuit_one = EXCLUDED.circuit_one,
    circuit_two = EXCLUDED.circuit_two,
    voltage = EXCLUDED.voltage,
    situation = EXCLUDED.situation,
    geometry = EXCLUDED.geometry,
    geometry_3857 = EXCLUDED.geometry_3857,
    geometry_27700 = EXCLUDED.geometry_27700,
    last_imported_at = EXCLUDED.last_imported_at
RETURNING
    reference`;

export interface UpsertExtNgetOverheadLineArgs {
    reference: string;
    status: string | null;
    circuitOne: string | null;
    circuitTwo: string | null;
    voltage: number | null;
    situation: string | null;
    geometry: string;
    firstImportedAt: string | null;
}

export interface UpsertExtNgetOverheadLineRow {
    reference: string;
}

export async function upsertExtNgetOverheadLine(client: Client, args: UpsertExtNgetOverheadLineArgs): Promise<UpsertExtNgetOverheadLineRow | null> {
    const result = await client.query({
        text: upsertExtNgetOverheadLineQuery,
        values: [args.reference, args.status, args.circuitOne, args.circuitTwo, args.voltage, args.situation, args.geometry, args.firstImportedAt],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        reference: row[0]
    };
}

export const deleteAllExtNgetOverheadLinesQuery = `-- name: DeleteAllExtNgetOverheadLines :exec
DELETE FROM public.ext_nget_overhead_lines`;

export async function deleteAllExtNgetOverheadLines(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtNgetOverheadLinesQuery,
        values: [],
        rowMode: "array"
    });
}

export const deleteMissingExtNgetOverheadLinesForReferenceQuery = `-- name: DeleteMissingExtNgetOverheadLinesForReference :one
WITH
    deleted_rows AS (
        DELETE FROM public.ext_nget_overhead_lines AS o
        WHERE
            o.reference NOT IN (
                SELECT
                    UNNEST($1::text[])
            )
        RETURNING
            uuid, reference, status, circuit_one, circuit_two, voltage, situation, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
    )
SELECT
    COUNT(*)
FROM
    deleted_rows`;

export interface DeleteMissingExtNgetOverheadLinesForReferenceArgs {
    references: string[];
}

export interface DeleteMissingExtNgetOverheadLinesForReferenceRow {
    count: string;
}

export async function deleteMissingExtNgetOverheadLinesForReference(client: Client, args: DeleteMissingExtNgetOverheadLinesForReferenceArgs): Promise<DeleteMissingExtNgetOverheadLinesForReferenceRow | null> {
    const result = await client.query({
        text: deleteMissingExtNgetOverheadLinesForReferenceQuery,
        values: [args.references],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        count: row[0]
    };
}

