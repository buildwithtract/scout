import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukSpecialAreaOfConservationForReferenceQuery = `-- name: GetExtDatagovukSpecialAreaOfConservationForReference :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_special_areas_of_conservation
WHERE
    reference = $1`;

export interface GetExtDatagovukSpecialAreaOfConservationForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukSpecialAreaOfConservationForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukSpecialAreaOfConservationForReference(client: Client, args: GetExtDatagovukSpecialAreaOfConservationForReferenceArgs): Promise<GetExtDatagovukSpecialAreaOfConservationForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukSpecialAreaOfConservationForReferenceQuery,
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

export const getExtDatagovukSpecialAreaOfConservationLatestImportQuery = `-- name: GetExtDatagovukSpecialAreaOfConservationLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_special_areas_of_conservation`;

export interface GetExtDatagovukSpecialAreaOfConservationLatestImportRow {
    max: string;
}

export async function getExtDatagovukSpecialAreaOfConservationLatestImport(client: Client): Promise<GetExtDatagovukSpecialAreaOfConservationLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukSpecialAreaOfConservationLatestImportQuery,
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

export const newExtDatagovukSpecialAreaOfConservationFromWGS84Query = `-- name: NewExtDatagovukSpecialAreaOfConservationFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_special_areas_of_conservation (geometry, reference, name)
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3
    )`;

export interface NewExtDatagovukSpecialAreaOfConservationFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
}

export async function newExtDatagovukSpecialAreaOfConservationFromWGS84(client: Client, args: NewExtDatagovukSpecialAreaOfConservationFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukSpecialAreaOfConservationFromWGS84Query,
        values: [args.geometry, args.reference, args.name],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukSpecialAreaOfConservationForReferenceQuery = `-- name: PartialUpdateExtDatagovukSpecialAreaOfConservationForReference :exec
UPDATE public.ext_datagovuk_special_areas_of_conservation
SET
    name = coalesce($1, name),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($2)::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = $3`;

export interface PartialUpdateExtDatagovukSpecialAreaOfConservationForReferenceArgs {
    name: string | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukSpecialAreaOfConservationForReference(client: Client, args: PartialUpdateExtDatagovukSpecialAreaOfConservationForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukSpecialAreaOfConservationForReferenceQuery,
        values: [args.name, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukSpecialAreasOfConservationQuery = `-- name: DeleteAllExtDatagovukSpecialAreasOfConservation :exec
DELETE FROM public.ext_datagovuk_special_areas_of_conservation
WHERE
    TRUE`;

export async function deleteAllExtDatagovukSpecialAreasOfConservation(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukSpecialAreasOfConservationQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukSpecialAreasOfConservationInMvtQuery = `-- name: GetExtDatagovukSpecialAreasOfConservationInMvt :one
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
            public.ext_datagovuk_special_areas_of_conservation ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukSpecialAreasOfConservationInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukSpecialAreasOfConservationInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukSpecialAreasOfConservationInMvt(client: Client, args: GetExtDatagovukSpecialAreasOfConservationInMvtArgs): Promise<GetExtDatagovukSpecialAreasOfConservationInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukSpecialAreasOfConservationInMvtQuery,
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

