import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukBuiltUpAreasQuery = `-- name: GetExtDatagovukBuiltUpAreas :many
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_built_up_areas`;

export interface GetExtDatagovukBuiltUpAreasRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBuiltUpAreas(client: Client): Promise<GetExtDatagovukBuiltUpAreasRow[]> {
    const result = await client.query({
        text: getExtDatagovukBuiltUpAreasQuery,
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

export const getExtDatagovukBuiltUpAreaUuidsAndIntersectionsThatIntersectGeometryQuery = `-- name: GetExtDatagovukBuiltUpAreaUuidsAndIntersectionsThatIntersectGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON ($1)::geometry as geom
    )
SELECT
    uuid,
    ST_Intersection (u.geometry, i.geom)::geometry AS intersection
FROM
    public.ext_datagovuk_built_up_areas u,
    input_geom i
WHERE
    ST_Intersects (u.geometry, i.geom)`;

export interface GetExtDatagovukBuiltUpAreaUuidsAndIntersectionsThatIntersectGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukBuiltUpAreaUuidsAndIntersectionsThatIntersectGeometryRow {
    uuid: string;
    intersection: string;
}

export async function getExtDatagovukBuiltUpAreaUuidsAndIntersectionsThatIntersectGeometry(client: Client, args: GetExtDatagovukBuiltUpAreaUuidsAndIntersectionsThatIntersectGeometryArgs): Promise<GetExtDatagovukBuiltUpAreaUuidsAndIntersectionsThatIntersectGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukBuiltUpAreaUuidsAndIntersectionsThatIntersectGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            intersection: row[1]
        };
    });
}

export const getExtDatagovukBuiltUpAreaUuidsAndZonesThatIntersectGeometryQuery = `-- name: GetExtDatagovukBuiltUpAreaUuidsAndZonesThatIntersectGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON ($1)::geometry as geom
    )
SELECT
    uuid,
    name
FROM
    public.ext_datagovuk_built_up_areas u,
    input_geom i
WHERE
    ST_Intersects (u.geometry, i.geom)`;

export interface GetExtDatagovukBuiltUpAreaUuidsAndZonesThatIntersectGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukBuiltUpAreaUuidsAndZonesThatIntersectGeometryRow {
    uuid: string;
    name: string;
}

export async function getExtDatagovukBuiltUpAreaUuidsAndZonesThatIntersectGeometry(client: Client, args: GetExtDatagovukBuiltUpAreaUuidsAndZonesThatIntersectGeometryArgs): Promise<GetExtDatagovukBuiltUpAreaUuidsAndZonesThatIntersectGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukBuiltUpAreaUuidsAndZonesThatIntersectGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            name: row[1]
        };
    });
}

export const getExtDatagovukBuiltUpAreasNearGeometryQuery = `-- name: GetExtDatagovukBuiltUpAreasNearGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromGeoJSON ($3)::geometry as geom
    )
SELECT
    u.uuid, u.reference, u.name, u.geometry, u.geometry_3857, u.geometry_27700, u.first_imported_at, u.last_imported_at,
    ST_Distance (u.geometry::geography, i.geom::geography)::float AS distance
FROM
    public.ext_datagovuk_built_up_areas u,
    input_geom i
WHERE
    ST_DWithin (
        u.geometry::geography,
        i.geom::geography,
        $2
    )
ORDER BY
    distance ASC
LIMIT
    $1`;

export interface GetExtDatagovukBuiltUpAreasNearGeometryArgs {
    limit: string;
    distance: string;
    geometry: string;
}

export interface GetExtDatagovukBuiltUpAreasNearGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    distance: number;
}

export async function getExtDatagovukBuiltUpAreasNearGeometry(client: Client, args: GetExtDatagovukBuiltUpAreasNearGeometryArgs): Promise<GetExtDatagovukBuiltUpAreasNearGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukBuiltUpAreasNearGeometryQuery,
        values: [args.limit, args.distance, args.geometry],
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
            lastImportedAt: row[7],
            distance: row[8]
        };
    });
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
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_built_up_areas ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
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

export const getExtDatagovukBuiltUpAreaQuery = `-- name: GetExtDatagovukBuiltUpArea :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_built_up_areas
WHERE
    uuid = $1`;

export interface GetExtDatagovukBuiltUpAreaArgs {
    uuid: string;
}

export interface GetExtDatagovukBuiltUpAreaRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBuiltUpArea(client: Client, args: GetExtDatagovukBuiltUpAreaArgs): Promise<GetExtDatagovukBuiltUpAreaRow | null> {
    const result = await client.query({
        text: getExtDatagovukBuiltUpAreaQuery,
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

export const getExtDatagovukBuiltUpAreaThatIntersectsGeometryQuery = `-- name: GetExtDatagovukBuiltUpAreaThatIntersectsGeometry :one
SELECT
    uuid, reference, name, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_built_up_areas
WHERE
    ST_Intersects (geometry_3857, ST_GeomFromGeoJSON ($1)::geometry)`;

export interface GetExtDatagovukBuiltUpAreaThatIntersectsGeometryArgs {
    stGeomfromgeojson: string;
}

export interface GetExtDatagovukBuiltUpAreaThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBuiltUpAreaThatIntersectsGeometry(client: Client, args: GetExtDatagovukBuiltUpAreaThatIntersectsGeometryArgs): Promise<GetExtDatagovukBuiltUpAreaThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukBuiltUpAreaThatIntersectsGeometryQuery,
        values: [args.stGeomfromgeojson],
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

