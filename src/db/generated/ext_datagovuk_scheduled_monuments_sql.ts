import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukScheduledMonumentsQuery = `-- name: GetExtDatagovukScheduledMonuments :many
SELECT
    uuid, name, reference, entry_date, start_date, end_date, entity, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_scheduled_monuments`;

export interface GetExtDatagovukScheduledMonumentsRow {
    uuid: string;
    name: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukScheduledMonuments(client: Client): Promise<GetExtDatagovukScheduledMonumentsRow[]> {
    const result = await client.query({
        text: getExtDatagovukScheduledMonumentsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            name: row[1],
            reference: row[2],
            entryDate: row[3],
            startDate: row[4],
            endDate: row[5],
            entity: row[6],
            documentationUrl: row[7],
            geometry: row[8],
            geometry_3857: row[9],
            geometry_27700: row[10],
            firstImportedAt: row[11],
            lastImportedAt: row[12]
        };
    });
}

export const getExtDatagovukScheduledMonumentQuery = `-- name: GetExtDatagovukScheduledMonument :one
SELECT
    uuid, name, reference, entry_date, start_date, end_date, entity, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_scheduled_monuments
WHERE
    uuid = $1`;

export interface GetExtDatagovukScheduledMonumentArgs {
    uuid: string;
}

export interface GetExtDatagovukScheduledMonumentRow {
    uuid: string;
    name: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukScheduledMonument(client: Client, args: GetExtDatagovukScheduledMonumentArgs): Promise<GetExtDatagovukScheduledMonumentRow | null> {
    const result = await client.query({
        text: getExtDatagovukScheduledMonumentQuery,
        values: [args.uuid],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        name: row[1],
        reference: row[2],
        entryDate: row[3],
        startDate: row[4],
        endDate: row[5],
        entity: row[6],
        documentationUrl: row[7],
        geometry: row[8],
        geometry_3857: row[9],
        geometry_27700: row[10],
        firstImportedAt: row[11],
        lastImportedAt: row[12]
    };
}

export const getExtDatagovukScheduledMonumentForReferenceQuery = `-- name: GetExtDatagovukScheduledMonumentForReference :one
SELECT
    uuid, name, reference, entry_date, start_date, end_date, entity, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_scheduled_monuments
WHERE
    reference = $1`;

export interface GetExtDatagovukScheduledMonumentForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukScheduledMonumentForReferenceRow {
    uuid: string;
    name: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukScheduledMonumentForReference(client: Client, args: GetExtDatagovukScheduledMonumentForReferenceArgs): Promise<GetExtDatagovukScheduledMonumentForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukScheduledMonumentForReferenceQuery,
        values: [args.reference],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        name: row[1],
        reference: row[2],
        entryDate: row[3],
        startDate: row[4],
        endDate: row[5],
        entity: row[6],
        documentationUrl: row[7],
        geometry: row[8],
        geometry_3857: row[9],
        geometry_27700: row[10],
        firstImportedAt: row[11],
        lastImportedAt: row[12]
    };
}

export const getExtDatagovukScheduledMonumentThatIntersectsGeometryQuery = `-- name: GetExtDatagovukScheduledMonumentThatIntersectsGeometry :one
SELECT
    uuid, name, reference, entry_date, start_date, end_date, entity, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_scheduled_monuments
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukScheduledMonumentThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukScheduledMonumentThatIntersectsGeometryRow {
    uuid: string;
    name: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukScheduledMonumentThatIntersectsGeometry(client: Client, args: GetExtDatagovukScheduledMonumentThatIntersectsGeometryArgs): Promise<GetExtDatagovukScheduledMonumentThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukScheduledMonumentThatIntersectsGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        name: row[1],
        reference: row[2],
        entryDate: row[3],
        startDate: row[4],
        endDate: row[5],
        entity: row[6],
        documentationUrl: row[7],
        geometry: row[8],
        geometry_3857: row[9],
        geometry_27700: row[10],
        firstImportedAt: row[11],
        lastImportedAt: row[12]
    };
}

export const getExtDatagovukScheduledMonumentLatestImportQuery = `-- name: GetExtDatagovukScheduledMonumentLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_scheduled_monuments`;

export interface GetExtDatagovukScheduledMonumentLatestImportRow {
    max: string;
}

export async function getExtDatagovukScheduledMonumentLatestImport(client: Client): Promise<GetExtDatagovukScheduledMonumentLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukScheduledMonumentLatestImportQuery,
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

export const newExtDatagovukScheduledMonumentFromWGS84Query = `-- name: NewExtDatagovukScheduledMonumentFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_scheduled_monuments (
        name,
        geometry,
        reference,
        entry_date,
        start_date,
        end_date,
        entity,
        documentation_url
    )
VALUES
    (
        $1,
        ST_GeomFromGeoJSON ($2)::geometry,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
    )`;

export interface NewExtDatagovukScheduledMonumentFromWGS84Args {
    name: string;
    geometry: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentationUrl: string | null;
}

export async function newExtDatagovukScheduledMonumentFromWGS84(client: Client, args: NewExtDatagovukScheduledMonumentFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukScheduledMonumentFromWGS84Query,
        values: [args.name, args.geometry, args.reference, args.entryDate, args.startDate, args.endDate, args.entity, args.documentationUrl],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukScheduledMonumentForReferenceQuery = `-- name: PartialUpdateExtDatagovukScheduledMonumentForReference :exec
UPDATE public.ext_datagovuk_scheduled_monuments
SET
    name = coalesce($1, name),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($2)::geometry,
        geometry
    ),
    entry_date = coalesce($3, entry_date),
    start_date = coalesce($4, start_date),
    end_date = coalesce($5, end_date),
    entity = coalesce($6, entity),
    documentation_url = coalesce(
        $7,
        documentation_url
    ),
    last_imported_at = NOW()
WHERE
    reference = $8`;

export interface PartialUpdateExtDatagovukScheduledMonumentForReferenceArgs {
    name: string | null;
    geometry: string | null;
    entryDate: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentationUrl: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukScheduledMonumentForReference(client: Client, args: PartialUpdateExtDatagovukScheduledMonumentForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukScheduledMonumentForReferenceQuery,
        values: [args.name, args.geometry, args.entryDate, args.startDate, args.endDate, args.entity, args.documentationUrl, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukScheduledMonumentsQuery = `-- name: DeleteAllExtDatagovukScheduledMonuments :exec
DELETE FROM public.ext_datagovuk_scheduled_monuments
WHERE
    TRUE`;

export async function deleteAllExtDatagovukScheduledMonuments(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukScheduledMonumentsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukScheduledMonumentsInMvtQuery = `-- name: GetExtDatagovukScheduledMonumentsInMvt :one
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
            public.ext_datagovuk_scheduled_monuments ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukScheduledMonumentsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukScheduledMonumentsInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukScheduledMonumentsInMvt(client: Client, args: GetExtDatagovukScheduledMonumentsInMvtArgs): Promise<GetExtDatagovukScheduledMonumentsInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukScheduledMonumentsInMvtQuery,
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

