import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtNaturalenglandNutrientNeutralityCatchmentsQuery = `-- name: GetExtNaturalenglandNutrientNeutralityCatchments :many
SELECT
    uuid, popup_info, n2k_site_name, label, object_id, date_amended, notes, global_id, oid_1, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_naturalengland_nutrient_neutrality_catchments`;

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsRow {
    uuid: string;
    popupInfo: string | null;
    n2kSiteName: string | null;
    label: string | null;
    objectId: number | null;
    dateAmended: Date | null;
    notes: string | null;
    globalId: string | null;
    oid_1: number | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtNaturalenglandNutrientNeutralityCatchments(client: Client): Promise<GetExtNaturalenglandNutrientNeutralityCatchmentsRow[]> {
    const result = await client.query({
        text: getExtNaturalenglandNutrientNeutralityCatchmentsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            popupInfo: row[1],
            n2kSiteName: row[2],
            label: row[3],
            objectId: row[4],
            dateAmended: row[5],
            notes: row[6],
            globalId: row[7],
            oid_1: row[8],
            geometry: row[9],
            geometry_3857: row[10],
            geometry_27700: row[11],
            firstImportedAt: row[12],
            lastImportedAt: row[13]
        };
    });
}

export const getExtNaturalenglandNutrientNeutralityCatchmentsUuidsAndIntersectionsThatIntersectGeometryQuery = `-- name: GetExtNaturalenglandNutrientNeutralityCatchmentsUuidsAndIntersectionsThatIntersectGeometry :many
WITH
    input_geom AS (
        SELECT
            ST_GeomFromWKB ($1, 4326) as geom
    )
SELECT
    uuid,
    ST_Intersection (u.geometry, i.geom)::geometry AS intersection
FROM
    public.ext_naturalengland_nutrient_neutrality_catchments u,
    input_geom i
WHERE
    ST_Intersects (u.geometry, i.geom)`;

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsUuidsAndIntersectionsThatIntersectGeometryArgs {
    geometry: string;
}

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsUuidsAndIntersectionsThatIntersectGeometryRow {
    uuid: string;
    intersection: string;
}

export async function getExtNaturalenglandNutrientNeutralityCatchmentsUuidsAndIntersectionsThatIntersectGeometry(client: Client, args: GetExtNaturalenglandNutrientNeutralityCatchmentsUuidsAndIntersectionsThatIntersectGeometryArgs): Promise<GetExtNaturalenglandNutrientNeutralityCatchmentsUuidsAndIntersectionsThatIntersectGeometryRow[]> {
    const result = await client.query({
        text: getExtNaturalenglandNutrientNeutralityCatchmentsUuidsAndIntersectionsThatIntersectGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            intersection: row[1]
        };
    });
}

export const newExtNaturalenglandNutrientNeutralityCatchmentQuery = `-- name: NewExtNaturalenglandNutrientNeutralityCatchment :one
INSERT INTO
    public.ext_naturalengland_nutrient_neutrality_catchments (
        geometry,
        popup_info,
        n2k_site_name,
        label,
        object_id,
        date_amended,
        notes,
        global_id,
        oid_1
    )
VALUES
    (
        ST_GeomFromWKB ($1, 4326)::geometry,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
    )
RETURNING
    uuid,
    ST_AsBinary (geometry)::geometry AS geometry,
    popup_info,
    n2k_site_name,
    label,
    object_id,
    date_amended,
    notes,
    global_id,
    oid_1`;

export interface NewExtNaturalenglandNutrientNeutralityCatchmentArgs {
    geometry: string;
    popupInfo: string | null;
    n2kSiteName: string | null;
    label: string | null;
    objectId: number | null;
    dateAmended: Date | null;
    notes: string | null;
    globalId: string | null;
    oid_1: number | null;
}

export interface NewExtNaturalenglandNutrientNeutralityCatchmentRow {
    uuid: string;
    geometry: string;
    popupInfo: string | null;
    n2kSiteName: string | null;
    label: string | null;
    objectId: number | null;
    dateAmended: Date | null;
    notes: string | null;
    globalId: string | null;
    oid_1: number | null;
}

export async function newExtNaturalenglandNutrientNeutralityCatchment(client: Client, args: NewExtNaturalenglandNutrientNeutralityCatchmentArgs): Promise<NewExtNaturalenglandNutrientNeutralityCatchmentRow | null> {
    const result = await client.query({
        text: newExtNaturalenglandNutrientNeutralityCatchmentQuery,
        values: [args.geometry, args.popupInfo, args.n2kSiteName, args.label, args.objectId, args.dateAmended, args.notes, args.globalId, args.oid_1],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        geometry: row[1],
        popupInfo: row[2],
        n2kSiteName: row[3],
        label: row[4],
        objectId: row[5],
        dateAmended: row[6],
        notes: row[7],
        globalId: row[8],
        oid_1: row[9]
    };
}

export const newExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSONQuery = `-- name: NewExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSON :one
INSERT INTO
    public.ext_naturalengland_nutrient_neutrality_catchments (
        geometry,
        popup_info,
        n2k_site_name,
        label,
        object_id,
        date_amended,
        notes,
        global_id,
        oid_1
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
    )
RETURNING
    uuid,
    popup_info,
    n2k_site_name,
    label,
    object_id,
    date_amended,
    notes,
    global_id,
    oid_1`;

export interface NewExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSONArgs {
    stGeomfromgeojson: string;
    popupInfo: string | null;
    n2kSiteName: string | null;
    label: string | null;
    objectId: number | null;
    dateAmended: Date | null;
    notes: string | null;
    globalId: string | null;
    oid_1: number | null;
}

export interface NewExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSONRow {
    uuid: string;
    popupInfo: string | null;
    n2kSiteName: string | null;
    label: string | null;
    objectId: number | null;
    dateAmended: Date | null;
    notes: string | null;
    globalId: string | null;
    oid_1: number | null;
}

export async function newExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSON(client: Client, args: NewExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSONArgs): Promise<NewExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSONRow | null> {
    const result = await client.query({
        text: newExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSONQuery,
        values: [args.stGeomfromgeojson, args.popupInfo, args.n2kSiteName, args.label, args.objectId, args.dateAmended, args.notes, args.globalId, args.oid_1],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        popupInfo: row[1],
        n2kSiteName: row[2],
        label: row[3],
        objectId: row[4],
        dateAmended: row[5],
        notes: row[6],
        globalId: row[7],
        oid_1: row[8]
    };
}

export const deleteAllExtNaturalenglandNutrientNeutralityCatchmentsQuery = `-- name: DeleteAllExtNaturalenglandNutrientNeutralityCatchments :exec
DELETE FROM public.ext_naturalengland_nutrient_neutrality_catchments
WHERE
    TRUE`;

export async function deleteAllExtNaturalenglandNutrientNeutralityCatchments(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtNaturalenglandNutrientNeutralityCatchmentsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtNaturalenglandNutrientNeutralityCatchmentsIntersectingGeometryQuery = `-- name: GetExtNaturalenglandNutrientNeutralityCatchmentsIntersectingGeometry :many
SELECT
    uuid, popup_info, n2k_site_name, label, object_id, date_amended, notes, global_id, oid_1, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_naturalengland_nutrient_neutrality_catchments
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromWKB ($1, 4326)::geometry
    )`;

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsIntersectingGeometryArgs {
    geometry: string;
}

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsIntersectingGeometryRow {
    uuid: string;
    popupInfo: string | null;
    n2kSiteName: string | null;
    label: string | null;
    objectId: number | null;
    dateAmended: Date | null;
    notes: string | null;
    globalId: string | null;
    oid_1: number | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtNaturalenglandNutrientNeutralityCatchmentsIntersectingGeometry(client: Client, args: GetExtNaturalenglandNutrientNeutralityCatchmentsIntersectingGeometryArgs): Promise<GetExtNaturalenglandNutrientNeutralityCatchmentsIntersectingGeometryRow[]> {
    const result = await client.query({
        text: getExtNaturalenglandNutrientNeutralityCatchmentsIntersectingGeometryQuery,
        values: [args.geometry],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            popupInfo: row[1],
            n2kSiteName: row[2],
            label: row[3],
            objectId: row[4],
            dateAmended: row[5],
            notes: row[6],
            globalId: row[7],
            oid_1: row[8],
            geometry: row[9],
            geometry_3857: row[10],
            geometry_27700: row[11],
            firstImportedAt: row[12],
            lastImportedAt: row[13]
        };
    });
}

export const getExtNaturalenglandNutrientNeutralityCatchmentsLatestImportQuery = `-- name: GetExtNaturalenglandNutrientNeutralityCatchmentsLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_naturalengland_nutrient_neutrality_catchments`;

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsLatestImportRow {
    max: string;
}

export async function getExtNaturalenglandNutrientNeutralityCatchmentsLatestImport(client: Client): Promise<GetExtNaturalenglandNutrientNeutralityCatchmentsLatestImportRow | null> {
    const result = await client.query({
        text: getExtNaturalenglandNutrientNeutralityCatchmentsLatestImportQuery,
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

export const getExtNaturalenglandNutrientNeutralityCatchmentsForReferenceQuery = `-- name: GetExtNaturalenglandNutrientNeutralityCatchmentsForReference :one
SELECT
    uuid, popup_info, n2k_site_name, label, object_id, date_amended, notes, global_id, oid_1, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_naturalengland_nutrient_neutrality_catchments
WHERE
    object_id = $1`;

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsForReferenceArgs {
    objectId: number | null;
}

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsForReferenceRow {
    uuid: string;
    popupInfo: string | null;
    n2kSiteName: string | null;
    label: string | null;
    objectId: number | null;
    dateAmended: Date | null;
    notes: string | null;
    globalId: string | null;
    oid_1: number | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtNaturalenglandNutrientNeutralityCatchmentsForReference(client: Client, args: GetExtNaturalenglandNutrientNeutralityCatchmentsForReferenceArgs): Promise<GetExtNaturalenglandNutrientNeutralityCatchmentsForReferenceRow | null> {
    const result = await client.query({
        text: getExtNaturalenglandNutrientNeutralityCatchmentsForReferenceQuery,
        values: [args.objectId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0],
        popupInfo: row[1],
        n2kSiteName: row[2],
        label: row[3],
        objectId: row[4],
        dateAmended: row[5],
        notes: row[6],
        globalId: row[7],
        oid_1: row[8],
        geometry: row[9],
        geometry_3857: row[10],
        geometry_27700: row[11],
        firstImportedAt: row[12],
        lastImportedAt: row[13]
    };
}

export const partialUpdateExtNaturalenglandNutrientNeutralityCatchmentsQuery = `-- name: PartialUpdateExtNaturalenglandNutrientNeutralityCatchments :exec
UPDATE public.ext_naturalengland_nutrient_neutrality_catchments
SET
    geometry = coalesce(
        ST_GeomFromWKB ($1, 4326)::geometry,
        geometry
    ),
    popup_info = coalesce($2, popup_info),
    n2k_site_name = coalesce($3, n2k_site_name),
    label = coalesce($4, label),
    object_id = coalesce($5, object_id),
    date_amended = coalesce($6, date_amended),
    notes = coalesce($7, notes),
    global_id = coalesce($8, global_id),
    oid_1 = coalesce($9, oid_1),
    last_imported_at = NOW()
WHERE
    object_id = $5`;

export interface PartialUpdateExtNaturalenglandNutrientNeutralityCatchmentsArgs {
    geometry: string | null;
    popupInfo: string | null;
    n2kSiteName: string | null;
    label: string | null;
    objectId: number | null;
    dateAmended: Date | null;
    notes: string | null;
    globalId: string | null;
    oid_1: number | null;
}

export async function partialUpdateExtNaturalenglandNutrientNeutralityCatchments(client: Client, args: PartialUpdateExtNaturalenglandNutrientNeutralityCatchmentsArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtNaturalenglandNutrientNeutralityCatchmentsQuery,
        values: [args.geometry, args.popupInfo, args.n2kSiteName, args.label, args.objectId, args.dateAmended, args.notes, args.globalId, args.oid_1],
        rowMode: "array"
    });
}

export const partialUpdateExtNaturalenglandNutrientNeutralityCatchmentsFromGeoJSONQuery = `-- name: PartialUpdateExtNaturalenglandNutrientNeutralityCatchmentsFromGeoJSON :exec
UPDATE public.ext_naturalengland_nutrient_neutrality_catchments
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON ($1)::geometry,
        geometry
    ),
    popup_info = coalesce($2, popup_info),
    n2k_site_name = coalesce($3, n2k_site_name),
    label = coalesce($4, label),
    object_id = coalesce($5, object_id),
    date_amended = coalesce($6, date_amended),
    notes = coalesce($7, notes),
    global_id = coalesce($8, global_id),
    oid_1 = coalesce($9, oid_1),
    last_imported_at = NOW()
WHERE
    object_id = $5`;

export interface PartialUpdateExtNaturalenglandNutrientNeutralityCatchmentsFromGeoJSONArgs {
    geometry: string | null;
    popupInfo: string | null;
    n2kSiteName: string | null;
    label: string | null;
    objectId: number | null;
    dateAmended: Date | null;
    notes: string | null;
    globalId: string | null;
    oid_1: number | null;
}

export async function partialUpdateExtNaturalenglandNutrientNeutralityCatchmentsFromGeoJSON(client: Client, args: PartialUpdateExtNaturalenglandNutrientNeutralityCatchmentsFromGeoJSONArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtNaturalenglandNutrientNeutralityCatchmentsFromGeoJSONQuery,
        values: [args.geometry, args.popupInfo, args.n2kSiteName, args.label, args.objectId, args.dateAmended, args.notes, args.globalId, args.oid_1],
        rowMode: "array"
    });
}

export const getExtNaturalenglandNutrientNeutralityCatchmentsInMvtQuery = `-- name: GetExtNaturalenglandNutrientNeutralityCatchmentsInMvt :one
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
            object_id as reference,
            n2k_site_name as name,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_naturalengland_nutrient_neutrality_catchments ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtNaturalenglandNutrientNeutralityCatchmentsInMvtRow {
    mvt: Buffer;
}

export async function getExtNaturalenglandNutrientNeutralityCatchmentsInMvt(client: Client, args: GetExtNaturalenglandNutrientNeutralityCatchmentsInMvtArgs): Promise<GetExtNaturalenglandNutrientNeutralityCatchmentsInMvtRow | null> {
    const result = await client.query({
        text: getExtNaturalenglandNutrientNeutralityCatchmentsInMvtQuery,
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

