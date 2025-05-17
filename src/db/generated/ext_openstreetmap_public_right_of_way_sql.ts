import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtOpenstreetmapPublicRightOfWayQuery = `-- name: GetExtOpenstreetmapPublicRightOfWay :many
SELECT
    uuid, reference, way_type, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_openstreetmap_public_right_of_way`;

export interface GetExtOpenstreetmapPublicRightOfWayRow {
    uuid: string;
    reference: string;
    wayType: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtOpenstreetmapPublicRightOfWay(client: Client): Promise<GetExtOpenstreetmapPublicRightOfWayRow[]> {
    const result = await client.query({
        text: getExtOpenstreetmapPublicRightOfWayQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            wayType: row[2],
            geometry: row[3],
            geometry_3857: row[4],
            geometry_27700: row[5],
            firstImportedAt: row[6],
            lastImportedAt: row[7]
        };
    });
}

export const getExtOpenstreetmapPublicRightsOfWayQuery = `-- name: GetExtOpenstreetmapPublicRightsOfWay :one
SELECT
    uuid, reference, way_type, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_openstreetmap_public_right_of_way
WHERE
    uuid = $1`;

export interface GetExtOpenstreetmapPublicRightsOfWayArgs {
    uuid: string;
}

export interface GetExtOpenstreetmapPublicRightsOfWayRow {
    uuid: string;
    reference: string;
    wayType: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtOpenstreetmapPublicRightsOfWay(client: Client, args: GetExtOpenstreetmapPublicRightsOfWayArgs): Promise<GetExtOpenstreetmapPublicRightsOfWayRow | null> {
    const result = await client.query({
        text: getExtOpenstreetmapPublicRightsOfWayQuery,
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
        wayType: row[2],
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        firstImportedAt: row[6],
        lastImportedAt: row[7]
    };
}

export const getExtOpenstreetmapPublicRightsOfWayForReferenceQuery = `-- name: GetExtOpenstreetmapPublicRightsOfWayForReference :one
SELECT
    uuid, reference, way_type, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_openstreetmap_public_right_of_way
WHERE
    reference = $1`;

export interface GetExtOpenstreetmapPublicRightsOfWayForReferenceArgs {
    reference: string;
}

export interface GetExtOpenstreetmapPublicRightsOfWayForReferenceRow {
    uuid: string;
    reference: string;
    wayType: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtOpenstreetmapPublicRightsOfWayForReference(client: Client, args: GetExtOpenstreetmapPublicRightsOfWayForReferenceArgs): Promise<GetExtOpenstreetmapPublicRightsOfWayForReferenceRow | null> {
    const result = await client.query({
        text: getExtOpenstreetmapPublicRightsOfWayForReferenceQuery,
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
        wayType: row[2],
        geometry: row[3],
        geometry_3857: row[4],
        geometry_27700: row[5],
        firstImportedAt: row[6],
        lastImportedAt: row[7]
    };
}

export const getExtOpenstreetmapPublicRightOfWayLatestImportQuery = `-- name: GetExtOpenstreetmapPublicRightOfWayLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_openstreetmap_public_right_of_way`;

export interface GetExtOpenstreetmapPublicRightOfWayLatestImportRow {
    max: string;
}

export async function getExtOpenstreetmapPublicRightOfWayLatestImport(client: Client): Promise<GetExtOpenstreetmapPublicRightOfWayLatestImportRow | null> {
    const result = await client.query({
        text: getExtOpenstreetmapPublicRightOfWayLatestImportQuery,
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

export const newOpenstreetmapPublicRightOfWayQuery = `-- name: NewOpenstreetmapPublicRightOfWay :exec
INSERT INTO
    public.ext_openstreetmap_public_right_of_way (reference, way_type, geometry)
VALUES
    (
        $1,
        $2,
        ST_GeomFromWKB ($3, 4326)::geometry
    )`;

export interface NewOpenstreetmapPublicRightOfWayArgs {
    reference: string;
    wayType: string;
    geometry: string;
}

export async function newOpenstreetmapPublicRightOfWay(client: Client, args: NewOpenstreetmapPublicRightOfWayArgs): Promise<void> {
    await client.query({
        text: newOpenstreetmapPublicRightOfWayQuery,
        values: [args.reference, args.wayType, args.geometry],
        rowMode: "array"
    });
}

export const partialUpdateExtOpenstreetmapPublicRightOfWayQuery = `-- name: PartialUpdateExtOpenstreetmapPublicRightOfWay :exec
UPDATE public.ext_openstreetmap_public_right_of_way
SET
    way_type = coalesce($1, way_type),
    geometry = coalesce(
        ST_GeomFromWKB ($2, 4326)::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = $3`;

export interface PartialUpdateExtOpenstreetmapPublicRightOfWayArgs {
    wayType: string | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtOpenstreetmapPublicRightOfWay(client: Client, args: PartialUpdateExtOpenstreetmapPublicRightOfWayArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtOpenstreetmapPublicRightOfWayQuery,
        values: [args.wayType, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtOpenstreetmapPublicRightOfWayQuery = `-- name: DeleteAllExtOpenstreetmapPublicRightOfWay :exec
DELETE FROM public.ext_openstreetmap_public_right_of_way
WHERE
    TRUE`;

export async function deleteAllExtOpenstreetmapPublicRightOfWay(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtOpenstreetmapPublicRightOfWayQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtOpenstreetmapPublicRightsOfWayIntersectingGeometryQuery = `-- name: GetExtOpenstreetmapPublicRightsOfWayIntersectingGeometry :many
SELECT
    "c"."uuid",
    "c"."reference",
    "c"."way_type",
    ST_Intersection (
        c."geometry",
        ST_GeomFromWKB ($1, 4326)::geometry
    )::geometry AS "intersection_polygon"
FROM
    "public"."ext_openstreetmap_public_right_of_way" c
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromWKB ($1, 4326)::geometry
    )`;

export interface GetExtOpenstreetmapPublicRightsOfWayIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtOpenstreetmapPublicRightsOfWayIntersectingGeometryRow {
    uuid: string;
    reference: string;
    wayType: string;
    intersectionPolygon: string;
}

export async function getExtOpenstreetmapPublicRightsOfWayIntersectingGeometry(client: Client, args: GetExtOpenstreetmapPublicRightsOfWayIntersectingGeometryArgs): Promise<GetExtOpenstreetmapPublicRightsOfWayIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtOpenstreetmapPublicRightsOfWayIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            wayType: row[2],
            intersectionPolygon: row[3]
        };
    });
}

export const getOpenstreetmapPublicRightsOfWayInMvtByTypeQuery = `-- name: GetOpenstreetmapPublicRightsOfWayInMvtByType :one
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
            way_type,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_openstreetmap_public_right_of_way ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
            AND way_type = $4
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetOpenstreetmapPublicRightsOfWayInMvtByTypeArgs {
    z: number;
    x: number;
    y: number;
    wayType: string;
}

export interface GetOpenstreetmapPublicRightsOfWayInMvtByTypeRow {
    mvt: Buffer;
}

export async function getOpenstreetmapPublicRightsOfWayInMvtByType(client: Client, args: GetOpenstreetmapPublicRightsOfWayInMvtByTypeArgs): Promise<GetOpenstreetmapPublicRightsOfWayInMvtByTypeRow | null> {
    const result = await client.query({
        text: getOpenstreetmapPublicRightsOfWayInMvtByTypeQuery,
        values: [args.z, args.x, args.y, args.wayType],
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

