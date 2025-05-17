import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukSpecialProtectionAreasQuery = `-- name: GetExtDatagovukSpecialProtectionAreas :many
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_special_protection_area`;

export interface GetExtDatagovukSpecialProtectionAreasRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukSpecialProtectionAreas(client: Client): Promise<GetExtDatagovukSpecialProtectionAreasRow[]> {
    const result = await client.query({
        text: getExtDatagovukSpecialProtectionAreasQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
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
    });
}

export const getExtDatagovukSpecialProtectionAreaQuery = `-- name: GetExtDatagovukSpecialProtectionArea :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    uuid = $1`;

export interface GetExtDatagovukSpecialProtectionAreaArgs {
    uuid: string;
}

export interface GetExtDatagovukSpecialProtectionAreaRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukSpecialProtectionArea(client: Client, args: GetExtDatagovukSpecialProtectionAreaArgs): Promise<GetExtDatagovukSpecialProtectionAreaRow | null> {
    const result = await client.query({
        text: getExtDatagovukSpecialProtectionAreaQuery,
        values: [args.uuid],
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

export const getExtDatagovukSpecialProtectionAreaForReferenceQuery = `-- name: GetExtDatagovukSpecialProtectionAreaForReference :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    reference = $1`;

export interface GetExtDatagovukSpecialProtectionAreaForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukSpecialProtectionAreaForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukSpecialProtectionAreaForReference(client: Client, args: GetExtDatagovukSpecialProtectionAreaForReferenceArgs): Promise<GetExtDatagovukSpecialProtectionAreaForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukSpecialProtectionAreaForReferenceQuery,
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

export const newExtDatagovukSpecialProtectionAreaFromWGS84Query = `-- name: NewExtDatagovukSpecialProtectionAreaFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_special_protection_area (geometry, reference, name)
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3
    )
RETURNING
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at`;

export interface NewExtDatagovukSpecialProtectionAreaFromWGS84Args {
    geometry: string;
    reference: string;
    name: string;
}

export interface NewExtDatagovukSpecialProtectionAreaFromWGS84Row {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function newExtDatagovukSpecialProtectionAreaFromWGS84(client: Client, args: NewExtDatagovukSpecialProtectionAreaFromWGS84Args): Promise<NewExtDatagovukSpecialProtectionAreaFromWGS84Row | null> {
    const result = await client.query({
        text: newExtDatagovukSpecialProtectionAreaFromWGS84Query,
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

export const getExtDatagovukSpecialProtectionAreaThatIntersectsGeometryQuery = `-- name: GetExtDatagovukSpecialProtectionAreaThatIntersectsGeometry :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukSpecialProtectionAreaThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukSpecialProtectionAreaThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukSpecialProtectionAreaThatIntersectsGeometry(client: Client, args: GetExtDatagovukSpecialProtectionAreaThatIntersectsGeometryArgs): Promise<GetExtDatagovukSpecialProtectionAreaThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukSpecialProtectionAreaThatIntersectsGeometryQuery,
        values: [args.geometry],
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

export const deleteAllExtDatagovukSpecialProtectionAreasQuery = `-- name: DeleteAllExtDatagovukSpecialProtectionAreas :exec
DELETE FROM public.ext_datagovuk_special_protection_area
WHERE
    TRUE`;

export async function deleteAllExtDatagovukSpecialProtectionAreas(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukSpecialProtectionAreasQuery,
        values: [],
        rowMode: "array"
    });
}

export const getUkSpecialProtectionAreaQuery = `-- name: GetUkSpecialProtectionArea :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    uuid = $1`;

export interface GetUkSpecialProtectionAreaArgs {
    uuid: string;
}

export interface GetUkSpecialProtectionAreaRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getUkSpecialProtectionArea(client: Client, args: GetUkSpecialProtectionAreaArgs): Promise<GetUkSpecialProtectionAreaRow | null> {
    const result = await client.query({
        text: getUkSpecialProtectionAreaQuery,
        values: [args.uuid],
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

export const getUkSpecialProtectionAreasWithin1KmOfGeometryQuery = `-- name: GetUkSpecialProtectionAreasWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetUkSpecialProtectionAreasWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetUkSpecialProtectionAreasWithin1KmOfGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getUkSpecialProtectionAreasWithin1KmOfGeometry(client: Client, args: GetUkSpecialProtectionAreasWithin1KmOfGeometryArgs): Promise<GetUkSpecialProtectionAreasWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getUkSpecialProtectionAreasWithin1KmOfGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
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
    });
}

export const getExtDatagovukSpecialProtectionAreasIntersectingGeometryQuery = `-- name: GetExtDatagovukSpecialProtectionAreasIntersectingGeometry :many
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_special_protection_area
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukSpecialProtectionAreasIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukSpecialProtectionAreasIntersectingGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukSpecialProtectionAreasIntersectingGeometry(client: Client, args: GetExtDatagovukSpecialProtectionAreasIntersectingGeometryArgs): Promise<GetExtDatagovukSpecialProtectionAreasIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukSpecialProtectionAreasIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
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
    });
}

export const getExtDatagovukSpecialProtectionAreasLatestImportQuery = `-- name: GetExtDatagovukSpecialProtectionAreasLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_special_protection_area`;

export interface GetExtDatagovukSpecialProtectionAreasLatestImportRow {
    max: string;
}

export async function getExtDatagovukSpecialProtectionAreasLatestImport(client: Client): Promise<GetExtDatagovukSpecialProtectionAreasLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukSpecialProtectionAreasLatestImportQuery,
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

export const partialUpdateExtDatagovukSpecialProtectionAreaForReferenceQuery = `-- name: PartialUpdateExtDatagovukSpecialProtectionAreaForReference :exec
UPDATE public.ext_datagovuk_special_protection_area
SET
    name = coalesce($1, name),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($2)::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = $3`;

export interface PartialUpdateExtDatagovukSpecialProtectionAreaForReferenceArgs {
    name: string | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukSpecialProtectionAreaForReference(client: Client, args: PartialUpdateExtDatagovukSpecialProtectionAreaForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukSpecialProtectionAreaForReferenceQuery,
        values: [args.name, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const getExtDatagovukSpecialProtectionAreasInMvtQuery = `-- name: GetExtDatagovukSpecialProtectionAreasInMvt :one
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
            public.ext_datagovuk_special_protection_area ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukSpecialProtectionAreasInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukSpecialProtectionAreasInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukSpecialProtectionAreasInMvt(client: Client, args: GetExtDatagovukSpecialProtectionAreasInMvtArgs): Promise<GetExtDatagovukSpecialProtectionAreasInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukSpecialProtectionAreasInMvtQuery,
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

