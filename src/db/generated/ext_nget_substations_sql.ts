import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getLatestImportForExtNgetSubstationsQuery = `-- name: GetLatestImportForExtNgetSubstations :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_nget_substations`;

export interface GetLatestImportForExtNgetSubstationsRow {
    max: string;
}

export async function getLatestImportForExtNgetSubstations(client: Client): Promise<GetLatestImportForExtNgetSubstationsRow | null> {
    const result = await client.query({
        text: getLatestImportForExtNgetSubstationsQuery,
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

export const getExtNgetSubstationsInMvtQuery = `-- name: GetExtNgetSubstationsInMvt :one
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
            name || ' (Voltage: ' || voltage || 'kV)' AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_nget_substations ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtNgetSubstationsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtNgetSubstationsInMvtRow {
    mvt: Buffer;
}

export async function getExtNgetSubstationsInMvt(client: Client, args: GetExtNgetSubstationsInMvtArgs): Promise<GetExtNgetSubstationsInMvtRow | null> {
    const result = await client.query({
        text: getExtNgetSubstationsInMvtQuery,
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

export const newExtNgetSubstationFrom27700Query = `-- name: NewExtNgetSubstationFrom27700 :one
INSERT INTO
    public.ext_nget_substations (
        geometry,
        reference,
        name,
        status,
        voltage,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_Transform (ST_GeomFromWKB ($1, 27700), 4326)::geometry,
        $2,
        $3,
        $4,
        $5,
        NOW(),
        NOW()
    )
RETURNING
    uuid,
    ST_AsBinary (geometry)::geometry AS geometry,
    reference,
    name,
    status,
    voltage,
    first_imported_at,
    last_imported_at`;

export interface NewExtNgetSubstationFrom27700Args {
    geometry: string;
    reference: string | null;
    name: string | null;
    status: string | null;
    voltage: number | null;
}

export interface NewExtNgetSubstationFrom27700Row {
    uuid: string;
    geometry: string;
    reference: string | null;
    name: string | null;
    status: string | null;
    voltage: number | null;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function newExtNgetSubstationFrom27700(client: Client, args: NewExtNgetSubstationFrom27700Args): Promise<NewExtNgetSubstationFrom27700Row | null> {
    const result = await client.query({
        text: newExtNgetSubstationFrom27700Query,
        values: [args.geometry, args.reference, args.name, args.status, args.voltage],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        geometry: row[1],
        reference: row[2],
        name: row[3],
        status: row[4],
        voltage: row[5],
        firstImportedAt: row[6],
        lastImportedAt: row[7]
    };
}

export const upsertExtNgetSubstationQuery = `-- name: UpsertExtNgetSubstation :one
INSERT INTO
    public.ext_nget_substations (
        geometry,
        reference,
        name,
        status,
        voltage,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_Force2D (
            ST_Transform (ST_GeomFromGeoJSON ($1), 4326)
        ),
        $2,
        $3,
        $4,
        $5,
        NOW(),
        NOW()
    )
ON CONFLICT (reference) DO UPDATE
SET
    geometry = coalesce(
        ST_Force2D (
            ST_Transform (ST_GeomFromGeoJSON ($1), 4326)
        ),
        public.ext_nget_substations.geometry
    ),
    name = coalesce(
        $3,
        public.ext_nget_substations.name
    ),
    status = coalesce(
        $4,
        public.ext_nget_substations.status
    ),
    voltage = coalesce(
        $5,
        public.ext_nget_substations.voltage
    ),
    last_imported_at = NOW()
RETURNING
    uuid, reference, name, status, voltage, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtNgetSubstationArgs {
    geometry: string | null;
    reference: string | null;
    name: string | null;
    status: string | null;
    voltage: number | null;
}

export interface UpsertExtNgetSubstationRow {
    uuid: string;
    reference: string | null;
    name: string | null;
    status: string | null;
    voltage: number | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtNgetSubstation(client: Client, args: UpsertExtNgetSubstationArgs): Promise<UpsertExtNgetSubstationRow | null> {
    const result = await client.query({
        text: upsertExtNgetSubstationQuery,
        values: [args.geometry, args.reference, args.name, args.status, args.voltage],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        reference: row[1],
        name: row[2],
        status: row[3],
        voltage: row[4],
        geometry: row[5],
        geometry_3857: row[6],
        geometry_27700: row[7],
        firstImportedAt: row[8],
        lastImportedAt: row[9],
        operation: row[10]
    };
}

export const deleteAllExtNgetSubstationsQuery = `-- name: DeleteAllExtNgetSubstations :exec
DELETE FROM public.ext_nget_substations`;

export async function deleteAllExtNgetSubstations(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtNgetSubstationsQuery,
        values: [],
        rowMode: "array"
    });
}

export const deleteMissingExtNgetSubstationsForReferenceQuery = `-- name: DeleteMissingExtNgetSubstationsForReference :one
WITH
    deleted_rows AS (
        DELETE FROM public.ext_nget_substations AS s
        WHERE
            s.reference NOT IN (
                SELECT
                    UNNEST($1::text[])
            )
        RETURNING
            uuid, reference, name, status, voltage, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
    )
SELECT
    COUNT(*)
FROM
    deleted_rows`;

export interface DeleteMissingExtNgetSubstationsForReferenceArgs {
    references: string[];
}

export interface DeleteMissingExtNgetSubstationsForReferenceRow {
    count: string;
}

export async function deleteMissingExtNgetSubstationsForReference(client: Client, args: DeleteMissingExtNgetSubstationsForReferenceArgs): Promise<DeleteMissingExtNgetSubstationsForReferenceRow | null> {
    const result = await client.query({
        text: deleteMissingExtNgetSubstationsForReferenceQuery,
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

