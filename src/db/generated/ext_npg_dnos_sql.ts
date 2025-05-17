import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const upsertExtNpgDnoQuery = `-- name: UpsertExtNpgDno :one
INSERT INTO
    public.ext_npg_dnos (
        geometry,
        name,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_Transform (ST_GeomFromGeoJSON ($1), 4326)::geometry,
        $2,
        NOW(),
        NOW()
    )
ON CONFLICT (name) DO UPDATE
SET
    geometry = coalesce(
        ST_Transform (ST_GeomFromGeoJSON ($1), 4326)::geometry,
        public.ext_npg_dnos.geometry
    ),
    last_imported_at = NOW()
RETURNING
    uuid, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation`;

export interface UpsertExtNpgDnoArgs {
    geometry: string | null;
    name: string;
}

export interface UpsertExtNpgDnoRow {
    uuid: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    operation: string;
}

export async function upsertExtNpgDno(client: Client, args: UpsertExtNpgDnoArgs): Promise<UpsertExtNpgDnoRow | null> {
    const result = await client.query({
        text: upsertExtNpgDnoQuery,
        values: [args.geometry, args.name],
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
        lastImportedAt: row[6],
        operation: row[7]
    };
}

export const getLatestImportForExtNpgDnosQuery = `-- name: GetLatestImportForExtNpgDnos :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_npg_dnos`;

export interface GetLatestImportForExtNpgDnosRow {
    max: string;
}

export async function getLatestImportForExtNpgDnos(client: Client): Promise<GetLatestImportForExtNpgDnosRow | null> {
    const result = await client.query({
        text: getLatestImportForExtNpgDnosQuery,
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

export const deleteAllExtNpgDnosQuery = `-- name: DeleteAllExtNpgDnos :exec
DELETE FROM public.ext_npg_dnos`;

export async function deleteAllExtNpgDnos(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtNpgDnosQuery,
        values: [],
        rowMode: "array"
    });
}

export const getDnoForGeometryQuery = `-- name: GetDnoForGeometry :one
SELECT
    c."name"
FROM
    "public"."ext_npg_dnos" c
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )
ORDER BY
    ST_Area (
        ST_Intersection (
            c."geometry",
            ST_GeomFromGeoJSON ($1)::geometry
        )::geometry
    ) DESC
LIMIT
    1`;

export interface GetDnoForGeometryArgs {
    geometry: string;
}

export interface GetDnoForGeometryRow {
    name: string;
}

export async function getDnoForGeometry(client: Client, args: GetDnoForGeometryArgs): Promise<GetDnoForGeometryRow | null> {
    const result = await client.query({
        text: getDnoForGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        name: row[0]
    };
}

export const getExtNpgDnosInMvtQuery = `-- name: GetExtNpgDnosInMvt :one
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
            ST_AsMVTGeom (geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_npg_dnos,
            tile
        WHERE
            ST_Intersects (geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtNpgDnosInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtNpgDnosInMvtRow {
    mvt: Buffer;
}

export async function getExtNpgDnosInMvt(client: Client, args: GetExtNpgDnosInMvtArgs): Promise<GetExtNpgDnosInMvtRow | null> {
    const result = await client.query({
        text: getExtNpgDnosInMvtQuery,
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

