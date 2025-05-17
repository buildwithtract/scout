import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukConservationAreaLatestImportQuery = `-- name: GetExtDatagovukConservationAreaLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_conservation_area`;

export interface GetExtDatagovukConservationAreaLatestImportRow {
    max: string;
}

export async function getExtDatagovukConservationAreaLatestImport(client: Client): Promise<GetExtDatagovukConservationAreaLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukConservationAreaLatestImportQuery,
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

export const getExtDatagovukConservationAreaForReferenceQuery = `-- name: GetExtDatagovukConservationAreaForReference :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_conservation_area
WHERE
    reference = $1`;

export interface GetExtDatagovukConservationAreaForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukConservationAreaForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukConservationAreaForReference(client: Client, args: GetExtDatagovukConservationAreaForReferenceArgs): Promise<GetExtDatagovukConservationAreaForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukConservationAreaForReferenceQuery,
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
        entryDate: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtDatagovukConservationAreaInMvtQuery = `-- name: GetExtDatagovukConservationAreaInMvt :one
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
            public.ext_datagovuk_conservation_area ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukConservationAreaInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukConservationAreaInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukConservationAreaInMvt(client: Client, args: GetExtDatagovukConservationAreaInMvtArgs): Promise<GetExtDatagovukConservationAreaInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukConservationAreaInMvtQuery,
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

export const newExtDatagovukConservationAreaFromWGS84Query = `-- name: NewExtDatagovukConservationAreaFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_conservation_area (geometry, reference, name, entry_date)
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4
    )
RETURNING
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface NewExtDatagovukConservationAreaFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
    entryDate: Date;
}

export interface NewExtDatagovukConservationAreaFromWGS84Row {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function newExtDatagovukConservationAreaFromWGS84(client: Client, args: NewExtDatagovukConservationAreaFromWGS84Args): Promise<NewExtDatagovukConservationAreaFromWGS84Row | null> {
    const result = await client.query({
        text: newExtDatagovukConservationAreaFromWGS84Query,
        values: [args.geometry, args.reference, args.name, args.entryDate],
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
        lastImportedAt: row[8]
    };
}

export const partialUpdateExtDatagovukConservationAreaForReferenceQuery = `-- name: PartialUpdateExtDatagovukConservationAreaForReference :exec
UPDATE public.ext_datagovuk_conservation_area
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        geometry
    ),
    name = coalesce($2, name),
    entry_date = coalesce($3, entry_date),
    last_imported_at = NOW()
WHERE
    reference = $4`;

export interface PartialUpdateExtDatagovukConservationAreaForReferenceArgs {
    geometry: string | null;
    name: string | null;
    entryDate: Date | null;
    reference: string;
}

export async function partialUpdateExtDatagovukConservationAreaForReference(client: Client, args: PartialUpdateExtDatagovukConservationAreaForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukConservationAreaForReferenceQuery,
        values: [args.geometry, args.name, args.entryDate, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukConservationAreasQuery = `-- name: DeleteAllExtDatagovukConservationAreas :exec
DELETE FROM public.ext_datagovuk_conservation_area
WHERE
    TRUE`;

export async function deleteAllExtDatagovukConservationAreas(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukConservationAreasQuery,
        values: [],
        rowMode: "array"
    });
}

