import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
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
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_naturalengland_nutrient_neutrality_catchments ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
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

