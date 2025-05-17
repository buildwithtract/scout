import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukBuiltUpAreaLatestImportQuery = `-- name: GetExtDatagovukBuiltUpAreaLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_built_up_areas`;

export interface GetExtDatagovukBuiltUpAreaLatestImportRow {
    max: string;
}

export async function getExtDatagovukBuiltUpAreaLatestImport(client: Client): Promise<GetExtDatagovukBuiltUpAreaLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukBuiltUpAreaLatestImportQuery,
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

export const getExtDatagovukBuiltUpAreaForReferenceQuery = `-- name: GetExtDatagovukBuiltUpAreaForReference :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_built_up_areas
WHERE
    reference = $1`;

export interface GetExtDatagovukBuiltUpAreaForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukBuiltUpAreaForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBuiltUpAreaForReference(client: Client, args: GetExtDatagovukBuiltUpAreaForReferenceArgs): Promise<GetExtDatagovukBuiltUpAreaForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukBuiltUpAreaForReferenceQuery,
        values: [args.reference],
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
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        firstImportedAt: row[6],
        lastImportedAt: row[7]
    };
}

export const getExtDatagovukBuiltUpAreasInMvtQuery = `-- name: GetExtDatagovukBuiltUpAreasInMvt :one
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
            COALESCE('Built Up Area: ' || name) AS annotation,
            ST_AsMVTGeom (
                ST_Simplify (
                    ip.geometry_3857,
                    CASE
                        WHEN $1 >= 12 THEN 0
                        ELSE GREATEST(0.5, POWER(2, 20 - $1) / 4)
                    END
                ),
                tile.envelope
            )::geometry AS geometry
        FROM
            public.ext_datagovuk_built_up_areas ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukBuiltUpAreasInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukBuiltUpAreasInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukBuiltUpAreasInMvt(client: Client, args: GetExtDatagovukBuiltUpAreasInMvtArgs): Promise<GetExtDatagovukBuiltUpAreasInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukBuiltUpAreasInMvtQuery,
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

export const newExtDatagovukBuiltUpAreaFromWGS84Query = `-- name: NewExtDatagovukBuiltUpAreaFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_built_up_areas (geometry, reference, name)
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3
    )
RETURNING
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface NewExtDatagovukBuiltUpAreaFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
}

export interface NewExtDatagovukBuiltUpAreaFromWGS84Row {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function newExtDatagovukBuiltUpAreaFromWGS84(client: Client, args: NewExtDatagovukBuiltUpAreaFromWGS84Args): Promise<NewExtDatagovukBuiltUpAreaFromWGS84Row | null> {
    const result = await client.query({
        text: newExtDatagovukBuiltUpAreaFromWGS84Query,
        values: [args.geometry, args.reference, args.name],
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
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        firstImportedAt: row[6],
        lastImportedAt: row[7]
    };
}

export const partialUpdateExtDatagovukBuiltUpAreaForReferenceQuery = `-- name: PartialUpdateExtDatagovukBuiltUpAreaForReference :exec
UPDATE public.ext_datagovuk_built_up_areas
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        geometry
    ),
    name = coalesce($2, name),
    last_imported_at = NOW()
WHERE
    reference = $3`;

export interface PartialUpdateExtDatagovukBuiltUpAreaForReferenceArgs {
    geometry: string | null;
    name: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukBuiltUpAreaForReference(client: Client, args: PartialUpdateExtDatagovukBuiltUpAreaForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukBuiltUpAreaForReferenceQuery,
        values: [args.geometry, args.name, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukBuiltUpAreasQuery = `-- name: DeleteAllExtDatagovukBuiltUpAreas :exec
DELETE FROM public.ext_datagovuk_built_up_areas
WHERE
    TRUE`;

export async function deleteAllExtDatagovukBuiltUpAreas(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukBuiltUpAreasQuery,
        values: [],
        rowMode: "array"
    });
}

