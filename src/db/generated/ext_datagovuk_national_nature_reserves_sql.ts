import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukNationalNatureReserveLatestImportQuery = `-- name: GetExtDatagovukNationalNatureReserveLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_national_nature_reserves`;

export interface GetExtDatagovukNationalNatureReserveLatestImportRow {
    max: string;
}

export async function getExtDatagovukNationalNatureReserveLatestImport(client: Client): Promise<GetExtDatagovukNationalNatureReserveLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukNationalNatureReserveLatestImportQuery,
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

export const upsertExtDatagovukNationalNatureReserveFromWGS84Query = `-- name: UpsertExtDatagovukNationalNatureReserveFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_national_nature_reserves (
        reference,
        geometry,
        name,
        status,
        entry_date,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        $1,
        ST_GeomFromGeoJSON ($2)::geometry,
        $3,
        $4,
        $5,
        NOW(),
        NOW()
    )
ON CONFLICT (reference) DO UPDATE
SET
    geometry = CASE
        WHEN $2::text IS NOT NULL THEN ST_GeomFromGeoJSON ($2)::geometry
        ELSE public.ext_datagovuk_national_nature_reserves.geometry
    END,
    name = coalesce(
        $3,
        public.ext_datagovuk_national_nature_reserves.name
    ),
    status = coalesce(
        $4,
        public.ext_datagovuk_national_nature_reserves.status
    ),
    entry_date = coalesce(
        $5,
        public.ext_datagovuk_national_nature_reserves.entry_date
    ),
    last_imported_at = NOW()
RETURNING
    uuid, reference, name, status, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtDatagovukNationalNatureReserveFromWGS84Args {
    reference: string;
    geometry: string | null;
    name: string | null;
    status: string | null;
    entryDate: Date | null;
}

export interface UpsertExtDatagovukNationalNatureReserveFromWGS84Row {
    uuid: string;
    reference: string;
    name: string;
    status: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtDatagovukNationalNatureReserveFromWGS84(client: Client, args: UpsertExtDatagovukNationalNatureReserveFromWGS84Args): Promise<UpsertExtDatagovukNationalNatureReserveFromWGS84Row | null> {
    const result = await client.query({
        text: upsertExtDatagovukNationalNatureReserveFromWGS84Query,
        values: [args.reference, args.geometry, args.name, args.status, args.entryDate],
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
        entryDate: row[4],
        geometry: row[5],
        geometry_3857: row[6],
        geometry_27700: row[7],
        firstImportedAt: row[8],
        lastImportedAt: row[9],
        operation: row[10]
    };
}

export const deleteAllExtDatagovukNationalNatureReservesQuery = `-- name: DeleteAllExtDatagovukNationalNatureReserves :exec
DELETE FROM public.ext_datagovuk_national_nature_reserves
WHERE
    TRUE`;

export async function deleteAllExtDatagovukNationalNatureReserves(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukNationalNatureReservesQuery,
        values: [],
        rowMode: "array"
    });
}

export const deleteMissingExtDatagovukNationalNatureReservesQuery = `-- name: DeleteMissingExtDatagovukNationalNatureReserves :one
WITH
    deleted_rows AS (
        DELETE FROM public.ext_datagovuk_national_nature_reserves AS d
        WHERE
            NOT EXISTS (
                SELECT
                    1
                FROM
                    public.ext_datagovuk_national_nature_reserves AS q
                WHERE
                    q.reference = ANY ($1::text[])
            )
        RETURNING
            uuid, reference, name, status, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
    )
SELECT
    COUNT(*) AS deleted_count
FROM
    deleted_rows`;

export interface DeleteMissingExtDatagovukNationalNatureReservesArgs {
    reference: string[];
}

export interface DeleteMissingExtDatagovukNationalNatureReservesRow {
    deletedCount: string;
}

export async function deleteMissingExtDatagovukNationalNatureReserves(client: Client, args: DeleteMissingExtDatagovukNationalNatureReservesArgs): Promise<DeleteMissingExtDatagovukNationalNatureReservesRow | null> {
    const result = await client.query({
        text: deleteMissingExtDatagovukNationalNatureReservesQuery,
        values: [args.reference],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        deletedCount: row[0]
    };
}

export const getDatagovukNationalNatureReservesIntersectingGeometryQuery = `-- name: GetDatagovukNationalNatureReservesIntersectingGeometry :many
SELECT
    uuid, reference, name, status, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_national_nature_reserves
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetDatagovukNationalNatureReservesIntersectingGeometryArgs {
    geometry: string;
}

export interface GetDatagovukNationalNatureReservesIntersectingGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    status: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getDatagovukNationalNatureReservesIntersectingGeometry(client: Client, args: GetDatagovukNationalNatureReservesIntersectingGeometryArgs): Promise<GetDatagovukNationalNatureReservesIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getDatagovukNationalNatureReservesIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            status: row[3],
            entryDate: row[4],
            geometry: row[5],
            geometry_3857: row[6],
            geometry_27700: row[7],
            firstImportedAt: row[8],
            lastImportedAt: row[9]
        };
    });
}

export const getExtDatagovukNationalNatureReservesInMvtQuery = `-- name: GetExtDatagovukNationalNatureReservesInMvt :one
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
            name,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_national_nature_reserves ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukNationalNatureReservesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukNationalNatureReservesInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukNationalNatureReservesInMvt(client: Client, args: GetExtDatagovukNationalNatureReservesInMvtArgs): Promise<GetExtDatagovukNationalNatureReservesInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukNationalNatureReservesInMvtQuery,
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

