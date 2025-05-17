import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtEnvironmentagencyProvisionalALCGradesForReferenceQuery = `-- name: GetExtEnvironmentagencyProvisionalALCGradesForReference :one
SELECT
    uuid, objectid, alc_grade, area, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_environmentagency_provisional_alc_grades
WHERE
    objectid = $1`;

export interface GetExtEnvironmentagencyProvisionalALCGradesForReferenceArgs {
    objectid: number | null;
}

export interface GetExtEnvironmentagencyProvisionalALCGradesForReferenceRow {
    uuid: string;
    objectid: number | null;
    alcGrade: string | null;
    area: string | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtEnvironmentagencyProvisionalALCGradesForReference(client: Client, args: GetExtEnvironmentagencyProvisionalALCGradesForReferenceArgs): Promise<GetExtEnvironmentagencyProvisionalALCGradesForReferenceRow | null> {
    const result = await client.query({
        text: getExtEnvironmentagencyProvisionalALCGradesForReferenceQuery,
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
        geometry: row[4],
        geometry_3857: row[5],
        geometry_27700: row[6],
        firstImportedAt: row[7],
        lastImportedAt: row[8]
    };
}

export const getExtEnvironmentagencyProvisionalALCGradesLatestImportQuery = `-- name: GetExtEnvironmentagencyProvisionalALCGradesLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_environmentagency_provisional_alc_grades`;

export interface GetExtEnvironmentagencyProvisionalALCGradesLatestImportRow {
    max: string;
}

export async function getExtEnvironmentagencyProvisionalALCGradesLatestImport(client: Client): Promise<GetExtEnvironmentagencyProvisionalALCGradesLatestImportRow | null> {
    const result = await client.query({
        text: getExtEnvironmentagencyProvisionalALCGradesLatestImportQuery,
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

export const getExtEnvironmentagencyProvisionalAlcGradesInMvtQuery = `-- name: GetExtEnvironmentagencyProvisionalAlcGradesInMvt :one
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
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_environmentagency_provisional_alc_grades ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtEnvironmentagencyProvisionalAlcGradesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtEnvironmentagencyProvisionalAlcGradesInMvtRow {
    mvt: Buffer;
}

export async function getExtEnvironmentagencyProvisionalAlcGradesInMvt(client: Client, args: GetExtEnvironmentagencyProvisionalAlcGradesInMvtArgs): Promise<GetExtEnvironmentagencyProvisionalAlcGradesInMvtRow | null> {
    const result = await client.query({
        text: getExtEnvironmentagencyProvisionalAlcGradesInMvtQuery,
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

export const newExtEnvironmentagencyProvisionalAlcGradeQuery = `-- name: NewExtEnvironmentagencyProvisionalAlcGrade :one
INSERT INTO
    public.ext_environmentagency_provisional_alc_grades (objectid, alc_grade, area, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        ST_Transform (
            ST_SetSRID (ST_GeomFromGeoJSON ($4), 27700),
            4326
        )::geometry
    )
RETURNING
    uuid,
    objectid,
    alc_grade,
    area,
    geometry`;

export interface NewExtEnvironmentagencyProvisionalAlcGradeArgs {
    objectid: number | null;
    alcGrade: string | null;
    area: string | null;
    geometry: string;
}

export interface NewExtEnvironmentagencyProvisionalAlcGradeRow {
    uuid: string;
    objectid: number | null;
    alcGrade: string | null;
    area: string | null;
    geometry: string;
}

export async function newExtEnvironmentagencyProvisionalAlcGrade(client: Client, args: NewExtEnvironmentagencyProvisionalAlcGradeArgs): Promise<NewExtEnvironmentagencyProvisionalAlcGradeRow | null> {
    const result = await client.query({
        text: newExtEnvironmentagencyProvisionalAlcGradeQuery,
        values: [args.objectid, args.alcGrade, args.area, args.geometry],
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
        geometry: row[4]
    };
}

export const partialUpdateExtEnvironmentagencyProvisionalALCGradesQuery = `-- name: PartialUpdateExtEnvironmentagencyProvisionalALCGrades :exec
UPDATE public.ext_environmentagency_provisional_alc_grades
SET
    geometry = coalesce(
        ST_Transform (
            ST_SetSRID (
                ST_GeomFromWKB ($1, 27700),
                4326
            )::geometry,
            4326
        ),
        geometry
    ),
    alc_grade = coalesce($2, alc_grade),
    area = coalesce($3, area),
    last_imported_at = NOW()
WHERE
    objectid = $4`;

export interface PartialUpdateExtEnvironmentagencyProvisionalALCGradesArgs {
    geometry: string | null;
    alcGrade: string | null;
    area: string | null;
    objectid: number | null;
}

export async function partialUpdateExtEnvironmentagencyProvisionalALCGrades(client: Client, args: PartialUpdateExtEnvironmentagencyProvisionalALCGradesArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtEnvironmentagencyProvisionalALCGradesQuery,
        values: [args.geometry, args.alcGrade, args.area, args.objectid],
        rowMode: "array"
    });
}

export const deleteAllExtEnvironmentagencyProvisionalAlcGradesQuery = `-- name: DeleteAllExtEnvironmentagencyProvisionalAlcGrades :exec
DELETE FROM public.ext_environmentagency_provisional_alc_grades
WHERE
    TRUE`;

export async function deleteAllExtEnvironmentagencyProvisionalAlcGrades(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtEnvironmentagencyProvisionalAlcGradesQuery,
        values: [],
        rowMode: "array"
    });
}

