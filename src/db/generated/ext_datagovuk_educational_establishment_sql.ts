import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtDatagovukEducationalEstablishmentsQuery = `-- name: GetExtDatagovukEducationalEstablishments :many
SELECT
    uuid, reference, uprn, name, status, capacity, establishment_type, open_date, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_educational_establishment`;

export interface GetExtDatagovukEducationalEstablishmentsRow {
    uuid: string;
    reference: string;
    uprn: string;
    name: string;
    status: string;
    capacity: number | null;
    establishmentType: string;
    openDate: Date | null;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukEducationalEstablishments(client: Client): Promise<GetExtDatagovukEducationalEstablishmentsRow[]> {
    const result = await client.query({
        text: getExtDatagovukEducationalEstablishmentsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            uprn: row[2],
            name: row[3],
            status: row[4],
            capacity: row[5],
            establishmentType: row[6],
            openDate: row[7],
            entryDate: row[8],
            startDate: row[9],
            endDate: row[10],
            geometry: row[11],
            geometry_3857: row[12],
            geometry_27700: row[13],
            firstImportedAt: row[14],
            lastImportedAt: row[15]
        };
    });
}

export const getExtDatagovukEducationalEstablishmentQuery = `-- name: GetExtDatagovukEducationalEstablishment :one
SELECT
    uuid, reference, uprn, name, status, capacity, establishment_type, open_date, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_educational_establishment
WHERE
    uuid = $1`;

export interface GetExtDatagovukEducationalEstablishmentArgs {
    uuid: string;
}

export interface GetExtDatagovukEducationalEstablishmentRow {
    uuid: string;
    reference: string;
    uprn: string;
    name: string;
    status: string;
    capacity: number | null;
    establishmentType: string;
    openDate: Date | null;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukEducationalEstablishment(client: Client, args: GetExtDatagovukEducationalEstablishmentArgs): Promise<GetExtDatagovukEducationalEstablishmentRow | null> {
    const result = await client.query({
        text: getExtDatagovukEducationalEstablishmentQuery,
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
        uprn: row[2],
        name: row[3],
        status: row[4],
        capacity: row[5],
        establishmentType: row[6],
        openDate: row[7],
        entryDate: row[8],
        startDate: row[9],
        endDate: row[10],
        geometry: row[11],
        geometry_3857: row[12],
        geometry_27700: row[13],
        firstImportedAt: row[14],
        lastImportedAt: row[15]
    };
}

export const getExtDatagovukEducationalEstablishmentForReferenceQuery = `-- name: GetExtDatagovukEducationalEstablishmentForReference :one
SELECT
    uuid, reference, uprn, name, status, capacity, establishment_type, open_date, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_educational_establishment
WHERE
    reference = $1`;

export interface GetExtDatagovukEducationalEstablishmentForReferenceArgs {
    reference: string;
}

export interface GetExtDatagovukEducationalEstablishmentForReferenceRow {
    uuid: string;
    reference: string;
    uprn: string;
    name: string;
    status: string;
    capacity: number | null;
    establishmentType: string;
    openDate: Date | null;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukEducationalEstablishmentForReference(client: Client, args: GetExtDatagovukEducationalEstablishmentForReferenceArgs): Promise<GetExtDatagovukEducationalEstablishmentForReferenceRow | null> {
    const result = await client.query({
        text: getExtDatagovukEducationalEstablishmentForReferenceQuery,
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
        uprn: row[2],
        name: row[3],
        status: row[4],
        capacity: row[5],
        establishmentType: row[6],
        openDate: row[7],
        entryDate: row[8],
        startDate: row[9],
        endDate: row[10],
        geometry: row[11],
        geometry_3857: row[12],
        geometry_27700: row[13],
        firstImportedAt: row[14],
        lastImportedAt: row[15]
    };
}

export const getExtDatagovukEducationalEstablishmentThatIntersectsGeometryQuery = `-- name: GetExtDatagovukEducationalEstablishmentThatIntersectsGeometry :one
SELECT
    uuid, reference, uprn, name, status, capacity, establishment_type, open_date, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at
FROM
    public.ext_datagovuk_educational_establishment
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON ($1)::geometry
    )`;

export interface GetExtDatagovukEducationalEstablishmentThatIntersectsGeometryArgs {
    geometry: string;
}

export interface GetExtDatagovukEducationalEstablishmentThatIntersectsGeometryRow {
    uuid: string;
    reference: string;
    uprn: string;
    name: string;
    status: string;
    capacity: number | null;
    establishmentType: string;
    openDate: Date | null;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
}

export async function getExtDatagovukEducationalEstablishmentThatIntersectsGeometry(client: Client, args: GetExtDatagovukEducationalEstablishmentThatIntersectsGeometryArgs): Promise<GetExtDatagovukEducationalEstablishmentThatIntersectsGeometryRow | null> {
    const result = await client.query({
        text: getExtDatagovukEducationalEstablishmentThatIntersectsGeometryQuery,
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
        uprn: row[2],
        name: row[3],
        status: row[4],
        capacity: row[5],
        establishmentType: row[6],
        openDate: row[7],
        entryDate: row[8],
        startDate: row[9],
        endDate: row[10],
        geometry: row[11],
        geometry_3857: row[12],
        geometry_27700: row[13],
        firstImportedAt: row[14],
        lastImportedAt: row[15]
    };
}

export const getExtDatagovukEducationalEstablishmentLatestImportQuery = `-- name: GetExtDatagovukEducationalEstablishmentLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_educational_establishment`;

export interface GetExtDatagovukEducationalEstablishmentLatestImportRow {
    max: string;
}

export async function getExtDatagovukEducationalEstablishmentLatestImport(client: Client): Promise<GetExtDatagovukEducationalEstablishmentLatestImportRow | null> {
    const result = await client.query({
        text: getExtDatagovukEducationalEstablishmentLatestImportQuery,
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

export const newExtDatagovukEducationalEstablishmentFromWGS84Query = `-- name: NewExtDatagovukEducationalEstablishmentFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_educational_establishment (
        reference,
        uprn,
        geometry,
        name,
        status,
        capacity,
        establishment_type,
        open_date,
        entry_date,
        start_date,
        end_date
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
        $10,
        $11
    )`;

export interface NewExtDatagovukEducationalEstablishmentFromWGS84Args {
    reference: string;
    uprn: string;
    geometry: string;
    name: string;
    status: string;
    capacity: number | null;
    establishmentType: string;
    openDate: Date | null;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
}

export async function newExtDatagovukEducationalEstablishmentFromWGS84(client: Client, args: NewExtDatagovukEducationalEstablishmentFromWGS84Args): Promise<void> {
    await client.query({
        text: newExtDatagovukEducationalEstablishmentFromWGS84Query,
        values: [args.reference, args.uprn, args.geometry, args.name, args.status, args.capacity, args.establishmentType, args.openDate, args.entryDate, args.startDate, args.endDate],
        rowMode: "array"
    });
}

export const partialUpdateExtDatagovukEducationalEstablishmentForReferenceQuery = `-- name: PartialUpdateExtDatagovukEducationalEstablishmentForReference :exec
UPDATE public.ext_datagovuk_educational_establishment
SET
    uprn = coalesce($1, uprn),
    geometry = coalesce(
        ST_GeomFromGeoJSON ($2)::geometry,
        geometry
    ),
    name = coalesce($3, name),
    status = coalesce($4, status),
    capacity = coalesce($5, capacity),
    establishment_type = coalesce(
        $6,
        establishment_type
    ),
    open_date = coalesce($7, open_date),
    entry_date = coalesce($8, entry_date),
    start_date = coalesce($9, start_date),
    end_date = coalesce($10, end_date),
    last_imported_at = NOW()
WHERE
    reference = $11`;

export interface PartialUpdateExtDatagovukEducationalEstablishmentForReferenceArgs {
    uprn: string | null;
    geometry: string | null;
    name: string | null;
    status: string | null;
    capacity: number | null;
    establishmentType: string | null;
    openDate: Date | null;
    entryDate: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    reference: string;
}

export async function partialUpdateExtDatagovukEducationalEstablishmentForReference(client: Client, args: PartialUpdateExtDatagovukEducationalEstablishmentForReferenceArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtDatagovukEducationalEstablishmentForReferenceQuery,
        values: [args.uprn, args.geometry, args.name, args.status, args.capacity, args.establishmentType, args.openDate, args.entryDate, args.startDate, args.endDate, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtDatagovukEducationalEstablishmentsQuery = `-- name: DeleteAllExtDatagovukEducationalEstablishments :exec
DELETE FROM public.ext_datagovuk_educational_establishment
WHERE
    TRUE`;

export async function deleteAllExtDatagovukEducationalEstablishments(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtDatagovukEducationalEstablishmentsQuery,
        values: [],
        rowMode: "array"
    });
}

export const getExtDatagovukEducationalEstablishmentsInMvtQuery = `-- name: GetExtDatagovukEducationalEstablishmentsInMvt :one
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
            name || ' (Capacity: ' || capacity || ')' AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_educational_establishment ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetExtDatagovukEducationalEstablishmentsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetExtDatagovukEducationalEstablishmentsInMvtRow {
    mvt: Buffer;
}

export async function getExtDatagovukEducationalEstablishmentsInMvt(client: Client, args: GetExtDatagovukEducationalEstablishmentsInMvtArgs): Promise<GetExtDatagovukEducationalEstablishmentsInMvtRow | null> {
    const result = await client.query({
        text: getExtDatagovukEducationalEstablishmentsInMvtQuery,
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

export const getNearestExtDatagovukEducationalEstablishmentsQuery = `-- name: GetNearestExtDatagovukEducationalEstablishments :many
SELECT
    uuid, reference, uprn, name, status, capacity, establishment_type, open_date, entry_date, start_date, end_date, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    ST_Distance (
        geometry::geography,
        ST_GeomFromGeoJSON ($1)::geography
    )::float AS distance
FROM
    public.ext_datagovuk_educational_establishment
WHERE
    status = '1'
ORDER BY
    distance ASC
LIMIT
    $2`;

export interface GetNearestExtDatagovukEducationalEstablishmentsArgs {
    geometry: string;
    numResults: string;
}

export interface GetNearestExtDatagovukEducationalEstablishmentsRow {
    uuid: string;
    reference: string;
    uprn: string;
    name: string;
    status: string;
    capacity: number | null;
    establishmentType: string;
    openDate: Date | null;
    entryDate: Date;
    startDate: Date | null;
    endDate: Date | null;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    distance: number;
}

export async function getNearestExtDatagovukEducationalEstablishments(client: Client, args: GetNearestExtDatagovukEducationalEstablishmentsArgs): Promise<GetNearestExtDatagovukEducationalEstablishmentsRow[]> {
    const result = await client.query({
        text: getNearestExtDatagovukEducationalEstablishmentsQuery,
        values: [args.geometry, args.numResults],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            reference: row[1],
            uprn: row[2],
            name: row[3],
            status: row[4],
            capacity: row[5],
            establishmentType: row[6],
            openDate: row[7],
            entryDate: row[8],
            startDate: row[9],
            endDate: row[10],
            geometry: row[11],
            geometry_3857: row[12],
            geometry_27700: row[13],
            firstImportedAt: row[14],
            lastImportedAt: row[15],
            distance: row[16]
        };
    });
}

