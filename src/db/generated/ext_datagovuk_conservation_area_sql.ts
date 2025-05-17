import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukConservationAreasQuery = `-- name: GetExtDatagovukConservationAreas :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_conservation_area`;

export interface GetExtDatagovukConservationAreasRow {
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

export async function getExtDatagovukConservationAreas(client: Client): Promise<GetExtDatagovukConservationAreasRow[]> {
    const result = await client.query({
        text: getExtDatagovukConservationAreasQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
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
    });
}

export const getExtDatagovukConservationAreaQuery = `-- name: GetExtDatagovukConservationArea :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_conservation_area
WHERE
    uuid = $1`;

export interface GetExtDatagovukConservationAreaArgs {
    uuid: string;
}

export interface GetExtDatagovukConservationAreaRow {
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

export async function getExtDatagovukConservationArea(client: Client, args: GetExtDatagovukConservationAreaArgs): Promise<GetExtDatagovukConservationAreaRow | null> {
    const result = await client.query({
        text: getExtDatagovukConservationAreaQuery,
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
        entryDate: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
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

export const getExtDatagovukConservationAreaThatIntersectsGeometryQuery = `-- name: GetExtDatagovukConservationAreaThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_conservation_area
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukConservationAreaThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukConservationAreaThatIntersectsGeometryRow {
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

export async function getExtDatagovukConservationAreaThatIntersectsGeometry(client: Client, args: GetExtDatagovukConservationAreaThatIntersectsGeometryArgs): Promise<GetExtDatagovukConservationAreaThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukConservationAreaThatIntersectsGeometryQuery,
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
        entryDate: row[3],
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
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

export const getExtDatagovukConservationAreasWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukConservationAreasWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_conservation_area
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetExtDatagovukConservationAreasWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukConservationAreasWithin1KmOfGeometryRow {
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

export async function getExtDatagovukConservationAreasWithin1KmOfGeometry(client: Client, args: GetExtDatagovukConservationAreasWithin1KmOfGeometryArgs): Promise<GetExtDatagovukConservationAreasWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukConservationAreasWithin1KmOfGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
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
    });
}

export const getExtDatagovukConservationAreasIntersectingGeometryQuery = `-- name: GetExtDatagovukConservationAreasIntersectingGeometry :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_conservation_area
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukConservationAreasIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukConservationAreasIntersectingGeometryRow {
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

export async function getExtDatagovukConservationAreasIntersectingGeometry(client: Client, args: GetExtDatagovukConservationAreasIntersectingGeometryArgs): Promise<GetExtDatagovukConservationAreasIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukConservationAreasIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
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
    });
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
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_conservation_area ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
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

