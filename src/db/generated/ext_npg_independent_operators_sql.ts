import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const insertExtNpgIndependentOperatorQuery = `-- name: InsertExtNpgIndependentOperator :one
INSERT INTO
    public.ext_npg_independent_operators (
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
RETURNING
    uuid, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface InsertExtNpgIndependentOperatorArgs {
    geometry: string;
    name: string;
}

export interface InsertExtNpgIndependentOperatorRow {
    uuid: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function insertExtNpgIndependentOperator(client: Client, args: InsertExtNpgIndependentOperatorArgs): Promise<InsertExtNpgIndependentOperatorRow | null> {
    const result = await client.query({
        text: insertExtNpgIndependentOperatorQuery,
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
        lastImportedAt: row[6]
    };
}

export const getLatestImportForExtNpgIndependentOperatorsQuery = `-- name: GetLatestImportForExtNpgIndependentOperators :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_npg_independent_operators`;

export interface GetLatestImportForExtNpgIndependentOperatorsRow {
    max: string;
}

export async function getLatestImportForExtNpgIndependentOperators(client: Client): Promise<GetLatestImportForExtNpgIndependentOperatorsRow | null> {
    const result = await client.query({
        text: getLatestImportForExtNpgIndependentOperatorsQuery,
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

export const deleteAllExtNpgIndependentOperatorsQuery = `-- name: DeleteAllExtNpgIndependentOperators :exec
DELETE FROM public.ext_npg_independent_operators`;

export async function deleteAllExtNpgIndependentOperators(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtNpgIndependentOperatorsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtNpgIndependentOperatorsForGeometryQuery = `-- name: GetExtNpgIndependentOperatorsForGeometry :many
SELECT
    c."name"
FROM
    "public"."ext_npg_independent_operators" c
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromWKB ($1, 4326)::geometry
    )
ORDER BY
    ST_Area (
        ST_Intersection (
            c."geometry",
            ST_GeomFromWKB ($1, 4326)::geometry
        )::geometry
    ) DESC
LIMIT
    3`;

export interface GetExtNpgIndependentOperatorsForGeometryArgs {
    geometry: string;
}

export interface GetExtNpgIndependentOperatorsForGeometryRow {
    name: string;
}

export async function getExtNpgIndependentOperatorsForGeometry(client: Client, args: GetExtNpgIndependentOperatorsForGeometryArgs): Promise<GetExtNpgIndependentOperatorsForGeometryRow[]> {
    const result = await client.query({
        text: getExtNpgIndependentOperatorsForGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            name: row[0]
        };
    });
}

export const getExtNpgIndependentOperatorsInMvtQuery = `-- name: GetExtNpgIndependentOperatorsInMvt :one
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
            ST_AsMVTGeom (ST_Transform (geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_npg_independent_operators,
            tile
        WHERE
            ST_Intersects (geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtNpgIndependentOperatorsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtNpgIndependentOperatorsInMvtRow {
    mvt: Buffer;
}

export async function getExtNpgIndependentOperatorsInMvt(client: Client, args: GetExtNpgIndependentOperatorsInMvtArgs): Promise<GetExtNpgIndependentOperatorsInMvtRow | null> {
    const result = await client.query({
        text: getExtNpgIndependentOperatorsInMvtQuery,
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

