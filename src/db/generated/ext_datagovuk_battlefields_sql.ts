import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukBattlefieldsQuery = `-- name: GetExtDatagovukBattlefields :many
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, document_url, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_battlefields`;

export interface GetExtDatagovukBattlefieldsRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    documentUrl: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBattlefields(client: Client): Promise<GetExtDatagovukBattlefieldsRow[]> {
    const result = await client.query({
        text: getExtDatagovukBattlefieldsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            startDate: row[4],
            endDate: row[5],
            entity: row[6],
            documentUrl: row[7],
            documentationUrl: row[8],
            geometry: row[9],
            geometry_3857: row[10],
            geometry_27700: row[11],
            firstImportedAt: row[12],
            lastImportedAt: row[13]
        };
    });
}

export const getExtDatagovukBattlefieldQuery = `-- name: GetExtDatagovukBattlefield :one
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, document_url, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_battlefields
WHERE
    uuid = $1`;

export interface GetExtDatagovukBattlefieldArgs {
    uuid: string;
}

export interface GetExtDatagovukBattlefieldRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    documentUrl: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBattlefield(client: Client, args: GetExtDatagovukBattlefieldArgs): Promise<GetExtDatagovukBattlefieldRow | null> {
    const result = await client.query({
        text: getExtDatagovukBattlefieldQuery,
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
        startDate: row[4],
        endDate: row[5],
        entity: row[6],
        documentUrl: row[7],
        documentationUrl: row[8],
        geometry: row[9],
        geometry_3857: row[10],
        geometry_27700: row[11],
        firstImportedAt: row[12],
        lastImportedAt: row[13]
    };
}

export const getExtDatagovukBattlefieldForReferenceQuery = `-- name: GetExtDatagovukBattlefieldForReference :one
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, document_url, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_battlefields
WHERE
    reference = $1`;

export interface GetExtDatagovukBattlefieldForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukBattlefieldForReferenceRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    documentUrl: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBattlefieldForReference(client: Client, args: GetExtDatagovukBattlefieldForReferenceArgs): Promise<GetExtDatagovukBattlefieldForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukBattlefieldForReferenceQuery,
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
        startDate: row[4],
        endDate: row[5],
        entity: row[6],
        documentUrl: row[7],
        documentationUrl: row[8],
        geometry: row[9],
        geometry_3857: row[10],
        geometry_27700: row[11],
        firstImportedAt: row[12],
        lastImportedAt: row[13]
    };
}

export const getExtDatagovukBattlefieldThatIntersectsGeometryQuery = `-- name: GetExtDatagovukBattlefieldThatIntersectsGeometry :one
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, document_url, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_battlefields
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukBattlefieldThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukBattlefieldThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    documentUrl: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBattlefieldThatIntersectsGeometry(client: Client, args: GetExtDatagovukBattlefieldThatIntersectsGeometryArgs): Promise<GetExtDatagovukBattlefieldThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukBattlefieldThatIntersectsGeometryQuery,
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
        startDate: row[4],
        endDate: row[5],
        entity: row[6],
        documentUrl: row[7],
        documentationUrl: row[8],
        geometry: row[9],
        geometry_3857: row[10],
        geometry_27700: row[11],
        firstImportedAt: row[12],
        lastImportedAt: row[13]
    };
}

export const getExtDatagovukBattlefieldsWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukBattlefieldsWithin1KmOfGeometry :many
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, document_url, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_battlefields
WHERE
    geometry_3857 && ST_Expand (ST_GeomFromGeoJSON ($1)::geometry, 1000)
    AND ST_DWithin (
        geometry_3857,
        ST_GeomFromGeoJSON ($2)::geometry,
        1000
    )
    AND NOT ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($2)::geometry
    )`;

export interface GetExtDatagovukBattlefieldsWithin1KmOfGeometryArgs {
    stGeomfromgeojson: string;
    geometry: string;
}

export interface GetExtDatagovukBattlefieldsWithin1KmOfGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    documentUrl: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBattlefieldsWithin1KmOfGeometry(client: Client, args: GetExtDatagovukBattlefieldsWithin1KmOfGeometryArgs): Promise<GetExtDatagovukBattlefieldsWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukBattlefieldsWithin1KmOfGeometryQuery,
        values: [args.stGeomfromgeojson, args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            startDate: row[4],
            endDate: row[5],
            entity: row[6],
            documentUrl: row[7],
            documentationUrl: row[8],
            geometry: row[9],
            geometry_3857: row[10],
            geometry_27700: row[11],
            firstImportedAt: row[12],
            lastImportedAt: row[13]
        };
    });
}

export const getExtDatagovukBattlefieldLatestImportQuery = `-- name: GetExtDatagovukBattlefieldLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_battlefields`;

export interface GetExtDatagovukBattlefieldLatestImportRow {
    max: string;
}

export async function getExtDatagovukBattlefieldLatestImport(client: Client): Promise<GetExtDatagovukBattlefieldLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukBattlefieldLatestImportQuery,
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

export const newExtDatagovukBattlefieldFromWGS84Query = `-- name: NewExtDatagovukBattlefieldFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_battlefields (
        reference,
        name,
        geometry,
        entry_date,
        start_date,
        end_date,
        entity,
        document_url,
        documentation_url,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        $1,
        $2,
        ST_GeomFromGeoJSON ($3)::geometry,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        NOW(),
        NOW()
    )`;

export interface NewExtDatagovukBattlefieldFromWGS84Args {
    reference: string;
    name: string;
    geometry: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    documentUrl: string | null;
    documentationUrl: string | null;
}

export async function newExtDatagovukBattlefieldFromWGS84(client: Client, args: NewExtDatagovukBattlefieldFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukBattlefieldFromWGS84Query,
        values: [args.reference, args.name, args.geometry, args.entryDate, args.startDate, args.endDate, args.entity, args.documentUrl, args.documentationUrl],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukBattlefieldForReferenceQuery = `-- name: PartialUpdateExtDatagovukBattlefieldForReference :exec
UPDATE public.ext_datagovuk_battlefields
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        geometry
    ),
    name = coalesce($2, name),
    entry_date = coalesce($3, entry_date),
    start_date = coalesce($4, start_date),
    end_date = coalesce($5, end_date),
    entity = coalesce($6, entity),
    document_url = coalesce($7, document_url),
    documentation_url = coalesce(
        $8,
        documentation_url
    ),
    last_imported_at = NOW()
WHERE
    reference = $9`;

export interface PartialUpdateExtDatagovukBattlefieldForReferenceArgs {
    geometry: string | null;
    name: string | null;
    entryDate: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentUrl: string | null;
    documentationUrl: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukBattlefieldForReference(client: Client, args: PartialUpdateExtDatagovukBattlefieldForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukBattlefieldForReferenceQuery,
        values: [args.geometry, args.name, args.entryDate, args.startDate, args.endDate, args.entity, args.documentUrl, args.documentationUrl, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukBattlefieldsQuery = `-- name: DeleteAllExtDatagovukBattlefields :exec
DELETE FROM public.ext_datagovuk_battlefields
WHERE
    TRUE`;

export async function deleteAllExtDatagovukBattlefields(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukBattlefieldsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukBattlefieldsInMvtQuery = `-- name: GetExtDatagovukBattlefieldsInMvt :one
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
            public.ext_datagovuk_battlefields ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukBattlefieldsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukBattlefieldsInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukBattlefieldsInMvt(client: Client, args: GetExtDatagovukBattlefieldsInMvtArgs): Promise<GetExtDatagovukBattlefieldsInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukBattlefieldsInMvtQuery,
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

export const getExtDatagovukBattlefieldIntersectingGeometryQuery = `-- name: GetExtDatagovukBattlefieldIntersectingGeometry :many
SELECT
    uuid, reference, name, entry_date, start_date, end_date, entity, document_url, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_battlefields
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukBattlefieldIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukBattlefieldIntersectingGeometryRow {
    uuid: string;
    reference: string;
    name: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string;
    documentUrl: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukBattlefieldIntersectingGeometry(client: Client, args: GetExtDatagovukBattlefieldIntersectingGeometryArgs): Promise<GetExtDatagovukBattlefieldIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukBattlefieldIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            name: row[2],
            entryDate: row[3],
            startDate: row[4],
            endDate: row[5],
            entity: row[6],
            documentUrl: row[7],
            documentationUrl: row[8],
            geometry: row[9],
            geometry_3857: row[10],
            geometry_27700: row[11],
            firstImportedAt: row[12],
            lastImportedAt: row[13]
        };
    });
}

