import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukWorldHeritageSiteForReferenceQuery = `-- name: GetExtDatagovukWorldHeritageSiteForReference :one
SELECT
    uuid, name, reference, entry_date, start_date, end_date, entity, notes, documentation_url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_world_heritage_sites
WHERE
    reference = $1`;

export interface GetExtDatagovukWorldHeritageSiteForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukWorldHeritageSiteForReferenceRow {
    uuid: string;
    name: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    notes: string | null;
    documentationUrl: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukWorldHeritageSiteForReference(client: Client, args: GetExtDatagovukWorldHeritageSiteForReferenceArgs): Promise<GetExtDatagovukWorldHeritageSiteForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSiteForReferenceQuery,
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
        notes: row[7],
        documentationUrl: row[8],
        geometry: row[9],
        geometry_3857: row[10],
        geometry_27700: row[11],
        firstImportedAt: row[12],
        lastImportedAt: row[13]
    };
}

export const getExtDatagovukWorldHeritageSiteLatestImportQuery = `-- name: GetExtDatagovukWorldHeritageSiteLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_world_heritage_sites`;

export interface GetExtDatagovukWorldHeritageSiteLatestImportRow {
    max: string;
}

export async function getExtDatagovukWorldHeritageSiteLatestImport(client: Client): Promise<GetExtDatagovukWorldHeritageSiteLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSiteLatestImportQuery,
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

export const getExtDatagovukWorldHeritageSitesInMvtQuery = `-- name: GetExtDatagovukWorldHeritageSitesInMvt :one
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
            public.ext_datagovuk_world_heritage_sites ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukWorldHeritageSitesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukWorldHeritageSitesInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukWorldHeritageSitesInMvt(client: Client, args: GetExtDatagovukWorldHeritageSitesInMvtArgs): Promise<GetExtDatagovukWorldHeritageSitesInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukWorldHeritageSitesInMvtQuery,
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

export const newExtDatagovukWorldHeritageSiteFromWGS84Query = `-- name: NewExtDatagovukWorldHeritageSiteFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_world_heritage_sites (
        geometry,
        name,
        reference,
        entry_date,
        start_date,
        end_date,
        entity,
        notes,
        documentation_url
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
        $9
    )`;

export interface NewExtDatagovukWorldHeritageSiteFromWGS84Args {
    geometry: string;
    name: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    notes: string | null;
    documentationUrl: string | null;
}

export async function newExtDatagovukWorldHeritageSiteFromWGS84(client: Client, args: NewExtDatagovukWorldHeritageSiteFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukWorldHeritageSiteFromWGS84Query,
        values: [args.geometry, args.name, args.reference, args.entryDate, args.startDate, args.endDate, args.entity, args.notes, args.documentationUrl],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukWorldHeritageSiteForReferenceQuery = `-- name: PartialUpdateExtDatagovukWorldHeritageSiteForReference :exec
UPDATE public.ext_datagovuk_world_heritage_sites
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
    notes = coalesce($7, notes),
    documentation_url = coalesce(
        $8,
        documentation_url
    ),
    last_imported_at = NOW()
WHERE
    reference = $9`;

export interface PartialUpdateExtDatagovukWorldHeritageSiteForReferenceArgs {
    name: string | null;
    geometry: string | null;
    entryDate: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    notes: string | null;
    documentationUrl: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukWorldHeritageSiteForReference(client: Client, args: PartialUpdateExtDatagovukWorldHeritageSiteForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukWorldHeritageSiteForReferenceQuery,
        values: [args.name, args.geometry, args.entryDate, args.startDate, args.endDate, args.entity, args.notes, args.documentationUrl, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukWorldHeritageSitesQuery = `-- name: DeleteAllExtDatagovukWorldHeritageSites :exec
DELETE FROM public.ext_datagovuk_world_heritage_sites
WHERE
    TRUE`;

export async function deleteAllExtDatagovukWorldHeritageSites(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukWorldHeritageSitesQuery,
        values: [],
        rowMode: "array"
    });
}

