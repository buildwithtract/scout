import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukListedBuildingForReferenceQuery = `-- name: GetExtDatagovukListedBuildingForReference :one
SELECT
    uuid, name, reference, entry_date, start_date, end_date, entity, documentation_url, listed_building_grade, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_listed_buildings
WHERE
    reference = $1`;

export interface GetExtDatagovukListedBuildingForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukListedBuildingForReferenceRow {
    uuid: string;
    name: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentationUrl: string | null;
    listedBuildingGrade: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukListedBuildingForReference(client: Client, args: GetExtDatagovukListedBuildingForReferenceArgs): Promise<GetExtDatagovukListedBuildingForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukListedBuildingForReferenceQuery,
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
        listedBuildingGrade: row[8],
        geometry: row[9],
        geometry_3857: row[10],
        geometry_27700: row[11],
        firstImportedAt: row[12],
        lastImportedAt: row[13]
    };
}

export const getExtDatagovukListedBuildingLatestImportQuery = `-- name: GetExtDatagovukListedBuildingLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_listed_buildings`;

export interface GetExtDatagovukListedBuildingLatestImportRow {
    max: string;
}

export async function getExtDatagovukListedBuildingLatestImport(client: Client): Promise<GetExtDatagovukListedBuildingLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukListedBuildingLatestImportQuery,
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

export const getExtDatagovukListedBuildingsInMvtQuery = `-- name: GetExtDatagovukListedBuildingsInMvt :one
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
            public.ext_datagovuk_listed_buildings ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukListedBuildingsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukListedBuildingsInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukListedBuildingsInMvt(client: Client, args: GetExtDatagovukListedBuildingsInMvtArgs): Promise<GetExtDatagovukListedBuildingsInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukListedBuildingsInMvtQuery,
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

export const newExtDatagovukListedBuildingFromWGS84Query = `-- name: NewExtDatagovukListedBuildingFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_listed_buildings (
        name,
        geometry,
        reference,
        entry_date,
        start_date,
        end_date,
        entity,
        documentation_url,
        listed_building_grade
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
        $8,
        $9
    )`;

export interface NewExtDatagovukListedBuildingFromWGS84Args {
    name: string;
    geometry: string;
    reference: string;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentationUrl: string | null;
    listedBuildingGrade: string | null;
}

export async function newExtDatagovukListedBuildingFromWGS84(client: Client, args: NewExtDatagovukListedBuildingFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukListedBuildingFromWGS84Query,
        values: [args.name, args.geometry, args.reference, args.entryDate, args.startDate, args.endDate, args.entity, args.documentationUrl, args.listedBuildingGrade],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukListedBuildingForReferenceQuery = `-- name: PartialUpdateExtDatagovukListedBuildingForReference :exec
UPDATE public.ext_datagovuk_listed_buildings
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
    listed_building_grade = coalesce(
        $8,
        listed_building_grade
    ),
    last_imported_at = NOW()
WHERE
    reference = $9`;

export interface PartialUpdateExtDatagovukListedBuildingForReferenceArgs {
    name: string | null;
    geometry: string | null;
    entryDate: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    entity: string | null;
    documentationUrl: string | null;
    listedBuildingGrade: string | null;
    reference: string;
}

export async function partialUpdateExtDatagovukListedBuildingForReference(client: Client, args: PartialUpdateExtDatagovukListedBuildingForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukListedBuildingForReferenceQuery,
        values: [args.name, args.geometry, args.entryDate, args.startDate, args.endDate, args.entity, args.documentationUrl, args.listedBuildingGrade, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukListedBuildingsQuery = `-- name: DeleteAllExtDatagovukListedBuildings :exec
DELETE FROM public.ext_datagovuk_listed_buildings
WHERE
    TRUE`;

export async function deleteAllExtDatagovukListedBuildings(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukListedBuildingsQuery,
        values: [],
        rowMode: "array"
    });
}

