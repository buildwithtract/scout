import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtEnvironmentagencyALCGradesLatestImportQuery = `-- name: GetExtEnvironmentagencyALCGradesLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_environmentagency_alc_grades`;

export interface GetExtEnvironmentagencyALCGradesLatestImportRow {
    max: string;
}

export async function getExtEnvironmentagencyALCGradesLatestImport(client: Client): Promise<GetExtEnvironmentagencyALCGradesLatestImportRow | null> {
    const result = await client.query({
        text: getExtEnvironmentagencyALCGradesLatestImportQuery,
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

export const getExtEnvironmentagencyALCGradesForReferenceQuery = `-- name: GetExtEnvironmentagencyALCGradesForReference :one
SELECT
    uuid, objectid, alc_grade, area, url, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_environmentagency_alc_grades
WHERE
    objectid = $1`;

export interface GetExtEnvironmentagencyALCGradesForReferenceArgs {
    objectid: number | null;
}

export interface GetExtEnvironmentagencyALCGradesForReferenceRow {
    uuid: string;
    objectid: number | null;
    alcGrade: string | null;
    area: string | null;
    url: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtEnvironmentagencyALCGradesForReference(client: Client, args: GetExtEnvironmentagencyALCGradesForReferenceArgs): Promise<GetExtEnvironmentagencyALCGradesForReferenceRow | null> {
    const result = await client.query({
        text: getExtEnvironmentagencyALCGradesForReferenceQuery,
        values: [args.objectid],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        objectid: row[1],
        alcGrade: row[2],
        area: row[3],
        url: row[4],
        geometry: row[5],
        geometry_3857: row[6],
        geometry_27700: row[7],
        firstImportedAt: row[8],
        lastImportedAt: row[9]
    };
}

export const getExtEnvironmentagencyAlcGradesInMvtQuery = `-- name: GetExtEnvironmentagencyAlcGradesInMvt :one
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
            alc_grade,
            area,
            url,
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
            public.ext_environmentagency_alc_grades ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtEnvironmentagencyAlcGradesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtEnvironmentagencyAlcGradesInMvtRow {
    mvt: Buffer;
}

export async function getExtEnvironmentagencyAlcGradesInMvt(client: Client, args: GetExtEnvironmentagencyAlcGradesInMvtArgs): Promise<GetExtEnvironmentagencyAlcGradesInMvtRow | null> {
    const result = await client.query({
        text: getExtEnvironmentagencyAlcGradesInMvtQuery,
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

export const newExtEnvironmentagencyAlcGradeQuery = `-- name: NewExtEnvironmentagencyAlcGrade :one
INSERT INTO
    public.ext_environmentagency_alc_grades (objectid, alc_grade, area, url, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        $4,
        ST_Transform (
            ST_SetSRID (ST_GeomFromGeoJSON ($5), 27700),
            4326
        )::geometry
    )
RETURNING
    uuid,
    objectid,
    alc_grade,
    area,
    url,
    geometry`;

export interface NewExtEnvironmentagencyAlcGradeArgs {
    objectid: number | null;
    alcGrade: string | null;
    area: string | null;
    url: string | null;
    geometry: string;
}

export interface NewExtEnvironmentagencyAlcGradeRow {
    uuid: string;
    objectid: number | null;
    alcGrade: string | null;
    area: string | null;
    url: string | null;
    geometry: string;
}

export async function newExtEnvironmentagencyAlcGrade(client: Client, args: NewExtEnvironmentagencyAlcGradeArgs): Promise<NewExtEnvironmentagencyAlcGradeRow | null> {
    const result = await client.query({
        text: newExtEnvironmentagencyAlcGradeQuery,
        values: [args.objectid, args.alcGrade, args.area, args.url, args.geometry],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        objectid: row[1],
        alcGrade: row[2],
        area: row[3],
        url: row[4],
        geometry: row[5]
    };
}

export const partialUpdateExtEnvironmentagencyALCGradesQuery = `-- name: PartialUpdateExtEnvironmentagencyALCGrades :exec
UPDATE public.ext_environmentagency_alc_grades
SET
    geometry = coalesce(
        ST_Transform (
            ST_SetSRID (
                ST_GeomFromGeoJSON ($1),
                27700
            ),
            4326
        )::geometry,
        geometry
    ),
    alc_grade = coalesce($2, alc_grade),
    area = coalesce($3, area),
    url = coalesce($4, url),
    last_imported_at = NOW()
WHERE
    objectid = $5`;

export interface PartialUpdateExtEnvironmentagencyALCGradesArgs {
    geometry: string | null;
    alcGrade: string | null;
    area: string | null;
    url: string | null;
    objectid: number | null;
}

export async function partialUpdateExtEnvironmentagencyALCGrades(client: Client, args: PartialUpdateExtEnvironmentagencyALCGradesArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtEnvironmentagencyALCGradesQuery,
        values: [args.geometry, args.alcGrade, args.area, args.url, args.objectid],
        rowMode: "array"
    });
}

export const deleteAllExtEnvironmentagencyAlcGradesQuery = `-- name: DeleteAllExtEnvironmentagencyAlcGrades :exec
DELETE FROM public.ext_environmentagency_alc_grades
WHERE
    TRUE`;

export async function deleteAllExtEnvironmentagencyAlcGrades(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtEnvironmentagencyAlcGradesQuery,
        values: [],
        rowMode: "array"
    });
}

