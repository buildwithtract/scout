import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukBrownfieldsQuery = `-- name: GetExtDatagovukBrownfields :many
SELECT
    uuid, reference, name, organisation_entity, address, notes, ownership_status, minimum_net_dwellings, maximum_net_dwellings, planning_permission_date, planning_permission_type, planning_permission_status, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_brownfield`;

export interface GetExtDatagovukBrownfieldsRow {
    uuid: string;
    reference: string;
    name: string | null;
    organisationEntity: string | null;
    address: string | null;
    notes: string | null;
    ownershipStatus: string | null;
    minimumNetDwellings: string | null;
    maximumNetDwellings: string | null;
    planningPermissionDate: Date | null;
    planningPermissionType: string | null;
    planningPermissionStatus: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBrownfields(client: Client): Promise<GetExtDatagovukBrownfieldsRow[]> {
    const result = await client.query({
        text: getExtDatagovukBrownfieldsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            organisationEntity: row[3],
            address: row[4],
            notes: row[5],
            ownershipStatus: row[6],
            minimumNetDwellings: row[7],
            maximumNetDwellings: row[8],
            planningPermissionDate: row[9],
            planningPermissionType: row[10],
            planningPermissionStatus: row[11],
            geometry: row[12],
            geometry_3857: row[13],
            geometry_27700: row[14],
            firstImportedAt: row[15],
            lastImportedAt: row[16]
        };
    });
}

export const getExtDatagovukBrownfieldQuery = `-- name: GetExtDatagovukBrownfield :one
SELECT
    uuid, reference, name, organisation_entity, address, notes, ownership_status, minimum_net_dwellings, maximum_net_dwellings, planning_permission_date, planning_permission_type, planning_permission_status, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_brownfield
WHERE
    uuid = $1`;

export interface GetExtDatagovukBrownfieldArgs {
    uuid: string;
}

export interface GetExtDatagovukBrownfieldRow {
    uuid: string;
    reference: string;
    name: string | null;
    organisationEntity: string | null;
    address: string | null;
    notes: string | null;
    ownershipStatus: string | null;
    minimumNetDwellings: string | null;
    maximumNetDwellings: string | null;
    planningPermissionDate: Date | null;
    planningPermissionType: string | null;
    planningPermissionStatus: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBrownfield(client: Client, args: GetExtDatagovukBrownfieldArgs): Promise<GetExtDatagovukBrownfieldRow | null> {
    const result = await client.query({
        text: getExtDatagovukBrownfieldQuery,
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
        organisationEntity: row[3],
        address: row[4],
        notes: row[5],
        ownershipStatus: row[6],
        minimumNetDwellings: row[7],
        maximumNetDwellings: row[8],
        planningPermissionDate: row[9],
        planningPermissionType: row[10],
        planningPermissionStatus: row[11],
        geometry: row[12],
        geometry_3857: row[13],
        geometry_27700: row[14],
        firstImportedAt: row[15],
        lastImportedAt: row[16]
    };
}

export const getExtDatagovukBrownfieldForReferenceQuery = `-- name: GetExtDatagovukBrownfieldForReference :one
SELECT
    uuid, reference, name, organisation_entity, address, notes, ownership_status, minimum_net_dwellings, maximum_net_dwellings, planning_permission_date, planning_permission_type, planning_permission_status, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_brownfield
WHERE
    reference = $1`;

export interface GetExtDatagovukBrownfieldForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukBrownfieldForReferenceRow {
    uuid: string;
    reference: string;
    name: string | null;
    organisationEntity: string | null;
    address: string | null;
    notes: string | null;
    ownershipStatus: string | null;
    minimumNetDwellings: string | null;
    maximumNetDwellings: string | null;
    planningPermissionDate: Date | null;
    planningPermissionType: string | null;
    planningPermissionStatus: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBrownfieldForReference(client: Client, args: GetExtDatagovukBrownfieldForReferenceArgs): Promise<GetExtDatagovukBrownfieldForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukBrownfieldForReferenceQuery,
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
        organisationEntity: row[3],
        address: row[4],
        notes: row[5],
        ownershipStatus: row[6],
        minimumNetDwellings: row[7],
        maximumNetDwellings: row[8],
        planningPermissionDate: row[9],
        planningPermissionType: row[10],
        planningPermissionStatus: row[11],
        geometry: row[12],
        geometry_3857: row[13],
        geometry_27700: row[14],
        firstImportedAt: row[15],
        lastImportedAt: row[16]
    };
}

export const getExtDatagovukBrownfieldLatestImportQuery = `-- name: GetExtDatagovukBrownfieldLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_brownfield`;

export interface GetExtDatagovukBrownfieldLatestImportRow {
    max: string;
}

export async function getExtDatagovukBrownfieldLatestImport(client: Client): Promise<GetExtDatagovukBrownfieldLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukBrownfieldLatestImportQuery,
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

export const newExtDatagovukBrownfieldFromWGS84Query = `-- name: NewExtDatagovukBrownfieldFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_brownfield (
        geometry,
        reference,
        name,
        organisation_entity,
        address,
        notes,
        ownership_status,
        minimum_net_dwellings,
        maximum_net_dwellings,
        planning_permission_date,
        planning_permission_type,
        planning_permission_status,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        NOW(),
        NOW()
    )`;

export interface NewExtDatagovukBrownfieldFromWGS84Args {
    geometry: string;
    reference: string;
    name: string | null;
    organisationEntity: string | null;
    address: string | null;
    notes: string | null;
    ownershipStatus: string | null;
    minimumNetDwellings: string | null;
    maximumNetDwellings: string | null;
    planningPermissionDate: Date | null;
    planningPermissionType: string | null;
    planningPermissionStatus: string | null;
}

export async function newExtDatagovukBrownfieldFromWGS84(client: Client, args: NewExtDatagovukBrownfieldFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukBrownfieldFromWGS84Query,
        values: [args.geometry, args.reference, args.name, args.organisationEntity, args.address, args.notes, args.ownershipStatus, args.minimumNetDwellings, args.maximumNetDwellings, args.planningPermissionDate, args.planningPermissionType, args.planningPermissionStatus],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukBrownfieldForReferenceQuery = `-- name: PartialUpdateExtDatagovukBrownfieldForReference :exec
UPDATE public.ext_datagovuk_brownfield
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        geometry
    ),
    name = coalesce($2, name),
    address = coalesce($3, address),
    notes = coalesce($4, notes),
    ownership_status = coalesce($5, ownership_status),
    minimum_net_dwellings = coalesce(
        $6,
        minimum_net_dwellings
    ),
    maximum_net_dwellings = coalesce(
        $7,
        maximum_net_dwellings
    ),
    planning_permission_date = coalesce(
        $8,
        planning_permission_date
    ),
    planning_permission_type = coalesce(
        $9,
        planning_permission_type
    ),
    planning_permission_status = coalesce(
        $10,
        planning_permission_status
    ),
    last_imported_at = NOW()
WHERE
    reference = $11`;

export interface PartialUpdateExtDatagovukBrownfieldForReferenceArgs {
    geometry: string | null;
    name: string | null;
    address: string | null;
    notes: string | null;
    ownershipStatus: string | null;
    minimumNetDwellings: string | null;
    maximumNetDwellings: string | null;
    planningPermissionDate: Date | null;
    planningPermissionType: string | null;
    planningPermissionStatus: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukBrownfieldForReference(client: Client, args: PartialUpdateExtDatagovukBrownfieldForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukBrownfieldForReferenceQuery,
        values: [args.geometry, args.name, args.address, args.notes, args.ownershipStatus, args.minimumNetDwellings, args.maximumNetDwellings, args.planningPermissionDate, args.planningPermissionType, args.planningPermissionStatus, args.reference],
        rowMode: "array"
    });
}

export const getExtDatagovukBrownfieldThatIntersectsGeometryQuery = `-- name: GetExtDatagovukBrownfieldThatIntersectsGeometry :one
SELECT
    uuid, reference, name, organisation_entity, address, notes, ownership_status, minimum_net_dwellings, maximum_net_dwellings, planning_permission_date, planning_permission_type, planning_permission_status, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_brownfield
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukBrownfieldThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukBrownfieldThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    name: string | null;
    organisationEntity: string | null;
    address: string | null;
    notes: string | null;
    ownershipStatus: string | null;
    minimumNetDwellings: string | null;
    maximumNetDwellings: string | null;
    planningPermissionDate: Date | null;
    planningPermissionType: string | null;
    planningPermissionStatus: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBrownfieldThatIntersectsGeometry(client: Client, args: GetExtDatagovukBrownfieldThatIntersectsGeometryArgs): Promise<GetExtDatagovukBrownfieldThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukBrownfieldThatIntersectsGeometryQuery,
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
        organisationEntity: row[3],
        address: row[4],
        notes: row[5],
        ownershipStatus: row[6],
        minimumNetDwellings: row[7],
        maximumNetDwellings: row[8],
        planningPermissionDate: row[9],
        planningPermissionType: row[10],
        planningPermissionStatus: row[11],
        geometry: row[12],
        geometry_3857: row[13],
        geometry_27700: row[14],
        firstImportedAt: row[15],
        lastImportedAt: row[16]
    };
}

export const deleteAllExtDatagovukBrownfieldsQuery = `-- name: DeleteAllExtDatagovukBrownfields :exec
DELETE FROM public.ext_datagovuk_brownfield
WHERE
    TRUE`;

export async function deleteAllExtDatagovukBrownfields(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukBrownfieldsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukBrownfieldWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukBrownfieldWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, organisation_entity, address, notes, ownership_status, minimum_net_dwellings, maximum_net_dwellings, planning_permission_date, planning_permission_type, planning_permission_status, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_brownfield
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetExtDatagovukBrownfieldWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukBrownfieldWithin1KmOfGeometryRow {
    uuid: string;
    reference: string;
    name: string | null;
    organisationEntity: string | null;
    address: string | null;
    notes: string | null;
    ownershipStatus: string | null;
    minimumNetDwellings: string | null;
    maximumNetDwellings: string | null;
    planningPermissionDate: Date | null;
    planningPermissionType: string | null;
    planningPermissionStatus: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBrownfieldWithin1KmOfGeometry(client: Client, args: GetExtDatagovukBrownfieldWithin1KmOfGeometryArgs): Promise<GetExtDatagovukBrownfieldWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukBrownfieldWithin1KmOfGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            organisationEntity: row[3],
            address: row[4],
            notes: row[5],
            ownershipStatus: row[6],
            minimumNetDwellings: row[7],
            maximumNetDwellings: row[8],
            planningPermissionDate: row[9],
            planningPermissionType: row[10],
            planningPermissionStatus: row[11],
            geometry: row[12],
            geometry_3857: row[13],
            geometry_27700: row[14],
            firstImportedAt: row[15],
            lastImportedAt: row[16]
        };
    });
}

export const getExtDatagovukBrownfieldIntersectingGeometryQuery = `-- name: GetExtDatagovukBrownfieldIntersectingGeometry :many
SELECT
    uuid, reference, name, organisation_entity, address, notes, ownership_status, minimum_net_dwellings, maximum_net_dwellings, planning_permission_date, planning_permission_type, planning_permission_status, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_brownfield
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukBrownfieldIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukBrownfieldIntersectingGeometryRow {
    uuid: string;
    reference: string;
    name: string | null;
    organisationEntity: string | null;
    address: string | null;
    notes: string | null;
    ownershipStatus: string | null;
    minimumNetDwellings: string | null;
    maximumNetDwellings: string | null;
    planningPermissionDate: Date | null;
    planningPermissionType: string | null;
    planningPermissionStatus: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBrownfieldIntersectingGeometry(client: Client, args: GetExtDatagovukBrownfieldIntersectingGeometryArgs): Promise<GetExtDatagovukBrownfieldIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukBrownfieldIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            organisationEntity: row[3],
            address: row[4],
            notes: row[5],
            ownershipStatus: row[6],
            minimumNetDwellings: row[7],
            maximumNetDwellings: row[8],
            planningPermissionDate: row[9],
            planningPermissionType: row[10],
            planningPermissionStatus: row[11],
            geometry: row[12],
            geometry_3857: row[13],
            geometry_27700: row[14],
            firstImportedAt: row[15],
            lastImportedAt: row[16]
        };
    });
}

export const getExtDatagovukBrownfieldInMvtQuery = `-- name: GetExtDatagovukBrownfieldInMvt :one
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
            public.ext_datagovuk_brownfield ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukBrownfieldInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukBrownfieldInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukBrownfieldInMvt(client: Client, args: GetExtDatagovukBrownfieldInMvtArgs): Promise<GetExtDatagovukBrownfieldInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukBrownfieldInMvtQuery,
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

