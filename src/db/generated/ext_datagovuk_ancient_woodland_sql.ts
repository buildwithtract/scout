import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukAncientWoodlandForReferenceQuery = `-- name: GetExtDatagovukAncientWoodlandForReference :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_ancient_woodland
WHERE
    reference = $1`;

export interface GetExtDatagovukAncientWoodlandForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukAncientWoodlandForReferenceRow {
    uuid: string;
    reference: string;
    name: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukAncientWoodlandForReference(client: Client, args: GetExtDatagovukAncientWoodlandForReferenceArgs): Promise<GetExtDatagovukAncientWoodlandForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukAncientWoodlandForReferenceQuery,
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

export const getExtDatagovukAncientWoodlandLatestImportQuery = `-- name: GetExtDatagovukAncientWoodlandLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_ancient_woodland`;

export interface GetExtDatagovukAncientWoodlandLatestImportRow {
    max: string;
}

export async function getExtDatagovukAncientWoodlandLatestImport(client: Client): Promise<GetExtDatagovukAncientWoodlandLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukAncientWoodlandLatestImportQuery,
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

export const getExtDatagovukAncientWoodlandInMvtQuery = `-- name: GetExtDatagovukAncientWoodlandInMvt :one
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
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_ancient_woodland ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukAncientWoodlandInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukAncientWoodlandInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukAncientWoodlandInMvt(client: Client, args: GetExtDatagovukAncientWoodlandInMvtArgs): Promise<GetExtDatagovukAncientWoodlandInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukAncientWoodlandInMvtQuery,
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

export const insertExtDatagovukAncientWoodlandFromWGS84Query = `-- name: InsertExtDatagovukAncientWoodlandFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_ancient_woodland (geometry, reference, name)
VALUES
    (ST_GeomFromGeoJSON ($1)::geometry, $2, $3)
RETURNING
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface InsertExtDatagovukAncientWoodlandFromWGS84Args {
    stGeomfromgeojson: string;
    reference: string;
    name: string | null;
}

export interface InsertExtDatagovukAncientWoodlandFromWGS84Row {
    uuid: string;
    reference: string;
    name: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function insertExtDatagovukAncientWoodlandFromWGS84(client: Client, args: InsertExtDatagovukAncientWoodlandFromWGS84Args): Promise<InsertExtDatagovukAncientWoodlandFromWGS84Row | null> {
    const result = await client.query({
        text: insertExtDatagovukAncientWoodlandFromWGS84Query,
        values: [args.stGeomfromgeojson, args.reference, args.name],
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

export const partialUpdateExtDatagovukAncientWoodlandForReferenceQuery = `-- name: PartialUpdateExtDatagovukAncientWoodlandForReference :exec
UPDATE public.ext_datagovuk_ancient_woodland
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($2)::geometry,
        geometry
    ),
    name = coalesce($3, name),
    last_imported_at = NOW()
WHERE
    reference = $1`;

export interface PartialUpdateExtDatagovukAncientWoodlandForReferenceArgs {
    reference: string;
    geometry: string | null;
    name: string | null;
}

export async function partialUpdateExtDatagovukAncientWoodlandForReference(client: Client, args: PartialUpdateExtDatagovukAncientWoodlandForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukAncientWoodlandForReferenceQuery,
        values: [args.reference, args.geometry, args.name],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukAncientWoodlandsQuery = `-- name: DeleteAllExtDatagovukAncientWoodlands :exec
DELETE FROM public.ext_datagovuk_ancient_woodland
WHERE
    TRUE`;

export async function deleteAllExtDatagovukAncientWoodlands(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukAncientWoodlandsQuery,
        values: [],
        rowMode: "array"
    });
}

