import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukAonbLatestImportQuery = `-- name: GetExtDatagovukAonbLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_aonb`;

export interface GetExtDatagovukAonbLatestImportRow {
    max: string;
}

export async function getExtDatagovukAonbLatestImport(client: Client): Promise<GetExtDatagovukAonbLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukAonbLatestImportQuery,
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

export const upsertExtDatagovukAonbFromWGS84Query = `-- name: UpsertExtDatagovukAonbFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_aonb (reference, name, entry_date, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromGeoJSON ($4)::geometry
    )
ON CONFLICT (reference) DO UPDATE
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($4)::geometry,
        public.ext_datagovuk_aonb.geometry
    ),
    name = coalesce(
        $2,
        public.ext_datagovuk_aonb.name
    ),
    entry_date = coalesce(
        $3,
        public.ext_datagovuk_aonb.entry_date
    ),
    last_imported_at = NOW()
RETURNING
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtDatagovukAonbFromWGS84Args {
    reference: string;
    name: string | null;
    entryDate: Date | null;
    geometry: string | null;
}

export interface UpsertExtDatagovukAonbFromWGS84Row {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtDatagovukAonbFromWGS84(client: Client, args: UpsertExtDatagovukAonbFromWGS84Args): Promise<UpsertExtDatagovukAonbFromWGS84Row | null> {
    const result = await client.query({
        text: upsertExtDatagovukAonbFromWGS84Query,
        values: [args.reference, args.name, args.entryDate, args.geometry],
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
        entryDate: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8],
        operation: row[9]
    };
}

export const insertExtDatagovukAonbFromWGS84Query = `-- name: InsertExtDatagovukAonbFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_aonb (reference, name, entry_date, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromGeoJSON ($4)::geometry
    )
RETURNING
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    'inserted' AS operation`;

export interface InsertExtDatagovukAonbFromWGS84Args {
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
}

export interface InsertExtDatagovukAonbFromWGS84Row {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function insertExtDatagovukAonbFromWGS84(client: Client, args: InsertExtDatagovukAonbFromWGS84Args): Promise<InsertExtDatagovukAonbFromWGS84Row | null> {
    const result = await client.query({
        text: insertExtDatagovukAonbFromWGS84Query,
        values: [args.reference, args.name, args.entryDate, args.geometry],
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
        entryDate: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8],
        operation: row[9]
    };
}

export const getExtDatagovukAonbInMvtQuery = `-- name: GetExtDatagovukAonbInMvt :one
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
            COALESCE('National Landscape: ' || name) AS annotation,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_aonb ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukAonbInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukAonbInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukAonbInMvt(client: Client, args: GetExtDatagovukAonbInMvtArgs): Promise<GetExtDatagovukAonbInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukAonbInMvtQuery,
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

export const deleteAllExtDatagovukAonbQuery = `-- name: DeleteAllExtDatagovukAonb :exec
DELETE FROM public.ext_datagovuk_aonb
WHERE
    TRUE`;

export async function deleteAllExtDatagovukAonb(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukAonbQuery,
        values: [],
        rowMode: "array"
    });
}

