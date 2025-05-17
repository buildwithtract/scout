import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukLocalAuthoritiesQuery = `-- name: GetExtDatagovukLocalAuthorities :many
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_authorities`;

export interface GetExtDatagovukLocalAuthoritiesRow {
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

export async function getExtDatagovukLocalAuthorities(client: Client): Promise<GetExtDatagovukLocalAuthoritiesRow[]> {
    const result = await client.query({
        text: getExtDatagovukLocalAuthoritiesQuery,
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

export const getExtDatagovukLocalAuthorityQuery = `-- name: GetExtDatagovukLocalAuthority :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_authorities
WHERE
    uuid = $1`;

export interface GetExtDatagovukLocalAuthorityArgs {
    uuid: string;
}

export interface GetExtDatagovukLocalAuthorityRow {
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

export async function getExtDatagovukLocalAuthority(client: Client, args: GetExtDatagovukLocalAuthorityArgs): Promise<GetExtDatagovukLocalAuthorityRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalAuthorityQuery,
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

export const getExtDatagovukLocalAuthorityForReferenceQuery = `-- name: GetExtDatagovukLocalAuthorityForReference :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_authorities
WHERE
    reference = $1`;

export interface GetExtDatagovukLocalAuthorityForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukLocalAuthorityForReferenceRow {
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

export async function getExtDatagovukLocalAuthorityForReference(client: Client, args: GetExtDatagovukLocalAuthorityForReferenceArgs): Promise<GetExtDatagovukLocalAuthorityForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalAuthorityForReferenceQuery,
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

export const getExtDatagovukLocalAuthorityThatIntersectsGeometryQuery = `-- name: GetExtDatagovukLocalAuthorityThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_local_authorities
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukLocalAuthorityThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukLocalAuthorityThatIntersectsGeometryRow {
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

export async function getExtDatagovukLocalAuthorityThatIntersectsGeometry(client: Client, args: GetExtDatagovukLocalAuthorityThatIntersectsGeometryArgs): Promise<GetExtDatagovukLocalAuthorityThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalAuthorityThatIntersectsGeometryQuery,
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

export const getExtDatagovukLocalAuthorityLatestImportQuery = `-- name: GetExtDatagovukLocalAuthorityLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_local_authorities`;

export interface GetExtDatagovukLocalAuthorityLatestImportRow {
    max: string;
}

export async function getExtDatagovukLocalAuthorityLatestImport(client: Client): Promise<GetExtDatagovukLocalAuthorityLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalAuthorityLatestImportQuery,
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

export const newExtDatagovukLocalAuthorityFromWGS84Query = `-- name: NewExtDatagovukLocalAuthorityFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_local_authorities (reference, name, entry_date, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromGeoJSON ($4)::geometry
    )`;

export interface NewExtDatagovukLocalAuthorityFromWGS84Args {
    reference: string;
    name: string;
    entryDate: Date;
    geometry: string;
}

export async function newExtDatagovukLocalAuthorityFromWGS84(client: Client, args: NewExtDatagovukLocalAuthorityFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukLocalAuthorityFromWGS84Query,
        values: [args.reference, args.name, args.entryDate, args.geometry],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukLocalAuthorityForReferenceQuery = `-- name: PartialUpdateExtDatagovukLocalAuthorityForReference :exec
UPDATE public.ext_datagovuk_local_authorities
SET
    name = coalesce($1, name),
    entry_date = coalesce($2, entry_date),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($3)::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = $4`;

export interface PartialUpdateExtDatagovukLocalAuthorityForReferenceArgs {
    name: string | null;
    entryDate: Date | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukLocalAuthorityForReference(client: Client, args: PartialUpdateExtDatagovukLocalAuthorityForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukLocalAuthorityForReferenceQuery,
        values: [args.name, args.entryDate, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukLocalAuthoritiesQuery = `-- name: DeleteAllExtDatagovukLocalAuthorities :exec
DELETE FROM public.ext_datagovuk_local_authorities
WHERE
    TRUE`;

export async function deleteAllExtDatagovukLocalAuthorities(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukLocalAuthoritiesQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukLocalAuthoritiesInMvtQuery = `-- name: GetExtDatagovukLocalAuthoritiesInMvt :one
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
            public.ext_datagovuk_local_authorities ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukLocalAuthoritiesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukLocalAuthoritiesInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukLocalAuthoritiesInMvt(client: Client, args: GetExtDatagovukLocalAuthoritiesInMvtArgs): Promise<GetExtDatagovukLocalAuthoritiesInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukLocalAuthoritiesInMvtQuery,
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

