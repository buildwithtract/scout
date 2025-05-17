import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const deleteAllExtNgetTowersQuery = `-- name: DeleteAllExtNgetTowers :exec
DELETE FROM public.ext_nget_towers`;

export async function deleteAllExtNgetTowers(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtNgetTowersQuery,
        values: [],
        rowMode: "array"
    });
}

export const upsertExtNgetTowerQuery = `-- name: UpsertExtNgetTower :one
INSERT INTO
    public.ext_nget_towers (
        geometry,
        reference,
        status,
        tower_height,
        year_installed,
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
        public.ext_nget_towers.geometry
    ),
    status = coalesce(
        $3,
        public.ext_nget_towers.status
    ),
    tower_height = coalesce(
        $4,
        public.ext_nget_towers.tower_height
    ),
    year_installed = coalesce(
        $5,
        public.ext_nget_towers.year_installed
    ),
    last_imported_at = NOW()
RETURNING
    uuid, reference, status, tower_height, year_installed, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtNgetTowerArgs {
    geometry: string | null;
    reference: string;
    status: string | null;
    towerHeight: string | null;
    yearInstalled: number | null;
}

export interface UpsertExtNgetTowerRow {
    uuid: string;
    reference: string;
    status: string;
    towerHeight: string | null;
    yearInstalled: number | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtNgetTower(client: Client, args: UpsertExtNgetTowerArgs): Promise<UpsertExtNgetTowerRow | null> {
    const result = await client.query({
        text: upsertExtNgetTowerQuery,
        values: [args.geometry, args.reference, args.status, args.towerHeight, args.yearInstalled],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        reference: row[1],
        status: row[2],
        towerHeight: row[3],
        yearInstalled: row[4],
        geometry: row[5],
        geometry_3857: row[6],
        geometry_27700: row[7],
        firstImportedAt: row[8],
        lastImportedAt: row[9],
        operation: row[10]
    };
}

export const deleteMissingExtNgetTowersForReferenceQuery = `-- name: DeleteMissingExtNgetTowersForReference :one
WITH
    deleted_rows AS (
        DELETE FROM public.ext_nget_towers AS t
        WHERE
            t.reference NOT IN (
                SELECT
                    UNNEST($1::text[])
            )
        RETURNING
            uuid, reference, status, tower_height, year_installed, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
    )
SELECT
    COUNT(*)
FROM
    deleted_rows`;

export interface DeleteMissingExtNgetTowersForReferenceArgs {
    reference: string[];
}

export interface DeleteMissingExtNgetTowersForReferenceRow {
    count: string;
}

export async function deleteMissingExtNgetTowersForReference(client: Client, args: DeleteMissingExtNgetTowersForReferenceArgs): Promise<DeleteMissingExtNgetTowersForReferenceRow | null> {
    const result = await client.query({
        text: deleteMissingExtNgetTowersForReferenceQuery,
        values: [args.reference],
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

export const getLatestImportForExtNgetTowersQuery = `-- name: GetLatestImportForExtNgetTowers :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_nget_towers`;

export interface GetLatestImportForExtNgetTowersRow {
    max: string;
}

export async function getLatestImportForExtNgetTowers(client: Client): Promise<GetLatestImportForExtNgetTowersRow | null> {
    const result = await client.query({
        text: getLatestImportForExtNgetTowersQuery,
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

export const getExtNgetTowersInMvtQuery = `-- name: GetExtNgetTowersInMvt :one
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
            reference || ' (Height: ' || tower_height || 'M)' AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_nget_towers ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtNgetTowersInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtNgetTowersInMvtRow {
    mvt: Buffer;
}

export async function getExtNgetTowersInMvt(client: Client, args: GetExtNgetTowersInMvtArgs): Promise<GetExtNgetTowersInMvtRow | null> {
    const result = await client.query({
        text: getExtNgetTowersInMvtQuery,
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

