import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukLocalPlanningAuthoritiesQuery = `-- name: GetExtDatagovukLocalPlanningAuthorities :many
SELECT
    uuid, reference, name, entry_date, normalised_name, local_planning_authorities_uuid, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_planning_authorities`;

export interface GetExtDatagovukLocalPlanningAuthoritiesRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    normalisedName: string | null;
    localPlanningAuthoritiesUuid: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukLocalPlanningAuthorities(client: Client): Promise<GetExtDatagovukLocalPlanningAuthoritiesRow[]> {
    const result = await client.query({
        text: getExtDatagovukLocalPlanningAuthoritiesQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            normalisedName: row[4],
            localPlanningAuthoritiesUuid: row[5],
            geometry: row[6],
            geometry_3857: row[7],
            geometry_27700: row[8],
            firstImportedAt: row[9],
            lastImportedAt: row[10]
        };
    });
}

export const getExtDatagovukLocalPlanningAuthorityQuery = `-- name: GetExtDatagovukLocalPlanningAuthority :one
SELECT
    uuid, reference, name, entry_date, normalised_name, local_planning_authorities_uuid, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    uuid = $1`;

export interface GetExtDatagovukLocalPlanningAuthorityArgs {
    uuid: string;
}

export interface GetExtDatagovukLocalPlanningAuthorityRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    normalisedName: string | null;
    localPlanningAuthoritiesUuid: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukLocalPlanningAuthority(client: Client, args: GetExtDatagovukLocalPlanningAuthorityArgs): Promise<GetExtDatagovukLocalPlanningAuthorityRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalPlanningAuthorityQuery,
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
        normalisedName: row[4],
        localPlanningAuthoritiesUuid: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const getExtDatagovukLocalPlanningAuthorityForReferenceQuery = `-- name: GetExtDatagovukLocalPlanningAuthorityForReference :one
SELECT
    uuid, reference, name, entry_date, normalised_name, local_planning_authorities_uuid, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    reference = $1`;

export interface GetExtDatagovukLocalPlanningAuthorityForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukLocalPlanningAuthorityForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    normalisedName: string | null;
    localPlanningAuthoritiesUuid: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukLocalPlanningAuthorityForReference(client: Client, args: GetExtDatagovukLocalPlanningAuthorityForReferenceArgs): Promise<GetExtDatagovukLocalPlanningAuthorityForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalPlanningAuthorityForReferenceQuery,
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
        normalisedName: row[4],
        localPlanningAuthoritiesUuid: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const getExtDatagovukLocalPlanningAuthorityForNameQuery = `-- name: GetExtDatagovukLocalPlanningAuthorityForName :one
SELECT
    uuid, reference, name, entry_date, normalised_name, local_planning_authorities_uuid, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    name = $1`;

export interface GetExtDatagovukLocalPlanningAuthorityForNameArgs {
    name: string;
}

export interface GetExtDatagovukLocalPlanningAuthorityForNameRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    normalisedName: string | null;
    localPlanningAuthoritiesUuid: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukLocalPlanningAuthorityForName(client: Client, args: GetExtDatagovukLocalPlanningAuthorityForNameArgs): Promise<GetExtDatagovukLocalPlanningAuthorityForNameRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalPlanningAuthorityForNameQuery,
        values: [args.name],
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
        normalisedName: row[4],
        localPlanningAuthoritiesUuid: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const getExtDatagovukLocalPlanningAuthorityThatIntersectsGeometryQuery = `-- name: GetExtDatagovukLocalPlanningAuthorityThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, normalised_name, local_planning_authorities_uuid, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukLocalPlanningAuthorityThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukLocalPlanningAuthorityThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    normalisedName: string | null;
    localPlanningAuthoritiesUuid: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukLocalPlanningAuthorityThatIntersectsGeometry(client: Client, args: GetExtDatagovukLocalPlanningAuthorityThatIntersectsGeometryArgs): Promise<GetExtDatagovukLocalPlanningAuthorityThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalPlanningAuthorityThatIntersectsGeometryQuery,
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
        normalisedName: row[4],
        localPlanningAuthoritiesUuid: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const getExtDatagovukLocalPlanningAuthorityLatestImportQuery = `-- name: GetExtDatagovukLocalPlanningAuthorityLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_local_planning_authorities`;

export interface GetExtDatagovukLocalPlanningAuthorityLatestImportRow {
    max: string;
}

export async function getExtDatagovukLocalPlanningAuthorityLatestImport(client: Client): Promise<GetExtDatagovukLocalPlanningAuthorityLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalPlanningAuthorityLatestImportQuery,
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

export const newExtDatagovukLocalPlanningAuthorityFromWGS84Query = `-- name: NewExtDatagovukLocalPlanningAuthorityFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_local_planning_authorities (
        reference,
        name,
        entry_date,
        geometry,
        normalised_name,
        local_planning_authorities_uuid
    )
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromGeoJSON ($4)::geometry,
        $5,
        $6
    )`;

export interface NewExtDatagovukLocalPlanningAuthorityFromWGS84Args {
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
    normalisedName: string | null;
    localPlanningAuthoritiesUuid: string | null;
}

export async function newExtDatagovukLocalPlanningAuthorityFromWGS84(client: Client, args: NewExtDatagovukLocalPlanningAuthorityFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukLocalPlanningAuthorityFromWGS84Query,
        values: [args.reference, args.name, args.entryDate, args.geometry, args.normalisedName, args.localPlanningAuthoritiesUuid],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukLocalPlanningAuthorityForReferenceQuery = `-- name: PartialUpdateExtDatagovukLocalPlanningAuthorityForReference :exec
UPDATE public.ext_datagovuk_local_planning_authorities
SET
    name = coalesce($1, name),
    entry_date = coalesce($2, entry_date),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($3)::geometry,
        geometry
    ),
    normalised_name = coalesce($4, normalised_name),
    local_planning_authorities_uuid = coalesce(
        $5,
        local_planning_authorities_uuid
    ),
    last_imported_at = NOW()
WHERE
    reference = $6`;

export interface PartialUpdateExtDatagovukLocalPlanningAuthorityForReferenceArgs {
    name: string | null;
    entryDate: Date | null;
    geometry: string | null;
    normalisedName: string | null;
    localPlanningAuthoritiesUuid: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukLocalPlanningAuthorityForReference(client: Client, args: PartialUpdateExtDatagovukLocalPlanningAuthorityForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukLocalPlanningAuthorityForReferenceQuery,
        values: [args.name, args.entryDate, args.geometry, args.normalisedName, args.localPlanningAuthoritiesUuid, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukLocalPlanningAuthoritiesQuery = `-- name: DeleteAllExtDatagovukLocalPlanningAuthorities :exec
DELETE FROM public.ext_datagovuk_local_planning_authorities
WHERE
    TRUE`;

export async function deleteAllExtDatagovukLocalPlanningAuthorities(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukLocalPlanningAuthoritiesQuery,
        values: [],
        rowMode: "array"
    });
}

export const getAllExtDatagovukLocalPlanningAuthoritiesQuery = `-- name: GetAllExtDatagovukLocalPlanningAuthorities :many
SELECT
    uuid,
    reference,
    name,
    entry_date,
    ST_AsGeoJSON (geometry)::text AS geometry_geojson
FROM
    public.ext_datagovuk_local_planning_authorities`;

export interface GetAllExtDatagovukLocalPlanningAuthoritiesRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    geometryGeojson: string;
}

export async function getAllExtDatagovukLocalPlanningAuthorities(client: Client): Promise<GetAllExtDatagovukLocalPlanningAuthoritiesRow[]> {
    const result = await client.query({
        text: getAllExtDatagovukLocalPlanningAuthoritiesQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            geometryGeojson: row[4]
        };
    });
}

export const getExtDatagovukLocalPlanningAuthorityAtPointQuery = `-- name: GetExtDatagovukLocalPlanningAuthorityAtPoint :one
SELECT
    uuid, reference, name, entry_date, normalised_name, local_planning_authorities_uuid, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_planning_authorities
WHERE
    ST_Intersects (
        geometry,
        ST_SetSRID (
            ST_Point ($1, $2),
            4326
        )
    )
ORDER BY
    entry_date DESC`;

export interface GetExtDatagovukLocalPlanningAuthorityAtPointArgs {
    longitude: string;
    latitude: string;
}

export interface GetExtDatagovukLocalPlanningAuthorityAtPointRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    normalisedName: string | null;
    localPlanningAuthoritiesUuid: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukLocalPlanningAuthorityAtPoint(client: Client, args: GetExtDatagovukLocalPlanningAuthorityAtPointArgs): Promise<GetExtDatagovukLocalPlanningAuthorityAtPointRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalPlanningAuthorityAtPointQuery,
        values: [args.longitude, args.latitude],
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
        normalisedName: row[4],
        localPlanningAuthoritiesUuid: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const getExtDatagovukLocalPlanningAuthoritiesInMvtQuery = `-- name: GetExtDatagovukLocalPlanningAuthoritiesInMvt :one
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
            public.ext_datagovuk_local_planning_authorities ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukLocalPlanningAuthoritiesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukLocalPlanningAuthoritiesInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukLocalPlanningAuthoritiesInMvt(client: Client, args: GetExtDatagovukLocalPlanningAuthoritiesInMvtArgs): Promise<GetExtDatagovukLocalPlanningAuthoritiesInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalPlanningAuthoritiesInMvtQuery,
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

