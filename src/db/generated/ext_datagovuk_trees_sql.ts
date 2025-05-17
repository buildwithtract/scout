import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukTreesQuery = `-- name: GetExtDatagovukTrees :many
SELECT
    uuid, reference, species, name, notes, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_trees`;

export interface GetExtDatagovukTreesRow {
    uuid: string;
    reference: string;
    species: string | null;
    name: string | null;
    notes: string | null;
    entryDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukTrees(client: Client): Promise<GetExtDatagovukTreesRow[]> {
    const result = await client.query({
        text: getExtDatagovukTreesQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            species: row[2],
            name: row[3],
            notes: row[4],
            entryDate: row[5],
            geometry: row[6],
            geometry_3857: row[7],
            geometry_27700: row[8],
            firstImportedAt: row[9],
            lastImportedAt: row[10]
        };
    });
}

export const getExtDatagovukTreeQuery = `-- name: GetExtDatagovukTree :one
SELECT
    uuid, reference, species, name, notes, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_trees
WHERE
    uuid = $1`;

export interface GetExtDatagovukTreeArgs {
    uuid: string;
}

export interface GetExtDatagovukTreeRow {
    uuid: string;
    reference: string;
    species: string | null;
    name: string | null;
    notes: string | null;
    entryDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukTree(client: Client, args: GetExtDatagovukTreeArgs): Promise<GetExtDatagovukTreeRow | null> {
    const result = await client.query({
        text: getExtDatagovukTreeQuery,
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
        species: row[2],
        name: row[3],
        notes: row[4],
        entryDate: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const getExtDatagovukTreeForReferenceQuery = `-- name: GetExtDatagovukTreeForReference :one
SELECT
    uuid, reference, species, name, notes, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_trees
WHERE
    reference = $1`;

export interface GetExtDatagovukTreeForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukTreeForReferenceRow {
    uuid: string;
    reference: string;
    species: string | null;
    name: string | null;
    notes: string | null;
    entryDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukTreeForReference(client: Client, args: GetExtDatagovukTreeForReferenceArgs): Promise<GetExtDatagovukTreeForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukTreeForReferenceQuery,
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
        species: row[2],
        name: row[3],
        notes: row[4],
        entryDate: row[5],
        geometry: row[6],
        geometry_3857: row[7],
        geometry_27700: row[8],
        firstImportedAt: row[9],
        lastImportedAt: row[10]
    };
}

export const getExtDatagovukTreesLatestImportQuery = `-- name: GetExtDatagovukTreesLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_trees`;

export interface GetExtDatagovukTreesLatestImportRow {
    max: string;
}

export async function getExtDatagovukTreesLatestImport(client: Client): Promise<GetExtDatagovukTreesLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukTreesLatestImportQuery,
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

export const newExtDatagovukTreeFromWGS84Query = `-- name: NewExtDatagovukTreeFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_trees (
        geometry,
        reference,
        species,
        name,
        notes,
        entry_date
    )
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        $2,
        $3,
        $4,
        $5,
        $6
    )`;

export interface NewExtDatagovukTreeFromWGS84Args {
    geometry: string;
    reference: string;
    species: string | null;
    name: string | null;
    notes: string | null;
    entryDate: Date | null;
}

export async function newExtDatagovukTreeFromWGS84(client: Client, args: NewExtDatagovukTreeFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukTreeFromWGS84Query,
        values: [args.geometry, args.reference, args.species, args.name, args.notes, args.entryDate],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukTreeForReferenceQuery = `-- name: PartialUpdateExtDatagovukTreeForReference :exec
UPDATE public.ext_datagovuk_trees
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        geometry
    ),
    species = coalesce($2, species),
    name = coalesce($3, name),
    notes = coalesce($4, notes),
    entry_date = coalesce($5, entry_date),
    last_imported_at = NOW()
WHERE
    reference = $6`;

export interface PartialUpdateExtDatagovukTreeForReferenceArgs {
    geometry: string | null;
    species: string | null;
    name: string | null;
    notes: string | null;
    entryDate: Date | null;
    reference: string;
}

export async function partialUpdateExtDatagovukTreeForReference(client: Client, args: PartialUpdateExtDatagovukTreeForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukTreeForReferenceQuery,
        values: [args.geometry, args.species, args.name, args.notes, args.entryDate, args.reference],
        rowMode: "array"
    });
}

export const getExtDatagovukTreesThatIntersectsGeometryQuery = `-- name: GetExtDatagovukTreesThatIntersectsGeometry :many
SELECT
    uuid, reference, species, name, notes, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_trees
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukTreesThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukTreesThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    species: string | null;
    name: string | null;
    notes: string | null;
    entryDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukTreesThatIntersectsGeometry(client: Client, args: GetExtDatagovukTreesThatIntersectsGeometryArgs): Promise<GetExtDatagovukTreesThatIntersectsGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukTreesThatIntersectsGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            species: row[2],
            name: row[3],
            notes: row[4],
            entryDate: row[5],
            geometry: row[6],
            geometry_3857: row[7],
            geometry_27700: row[8],
            firstImportedAt: row[9],
            lastImportedAt: row[10]
        };
    });
}

export const deleteAllExtDatagovukTreesQuery = `-- name: DeleteAllExtDatagovukTrees :exec
DELETE FROM public.ext_datagovuk_trees
WHERE
    TRUE`;

export async function deleteAllExtDatagovukTrees(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukTreesQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukTreesWithin1KmOfGeometryQuery = `-- name: GetExtDatagovukTreesWithin1KmOfGeometry :many
SELECT
    uuid, reference, species, name, notes, entry_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_trees
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON ($1)::geometry,
            3857
        ),
        1000
    )`;

export interface GetExtDatagovukTreesWithin1KmOfGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukTreesWithin1KmOfGeometryRow {
    uuid: string;
    reference: string;
    species: string | null;
    name: string | null;
    notes: string | null;
    entryDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukTreesWithin1KmOfGeometry(client: Client, args: GetExtDatagovukTreesWithin1KmOfGeometryArgs): Promise<GetExtDatagovukTreesWithin1KmOfGeometryRow[]> {
    const result = await client.query({
        text: getExtDatagovukTreesWithin1KmOfGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            species: row[2],
            name: row[3],
            notes: row[4],
            entryDate: row[5],
            geometry: row[6],
            geometry_3857: row[7],
            geometry_27700: row[8],
            firstImportedAt: row[9],
            lastImportedAt: row[10]
        };
    });
}

export const getExtDatagovukTreesInMvtQuery = `-- name: GetExtDatagovukTreesInMvt :one
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
            'TPO: ' || reference as annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_trees ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukTreesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukTreesInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukTreesInMvt(client: Client, args: GetExtDatagovukTreesInMvtArgs): Promise<GetExtDatagovukTreesInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukTreesInMvtQuery,
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

