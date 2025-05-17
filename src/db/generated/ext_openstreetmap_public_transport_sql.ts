import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getExtOpenstreetmapPublicTransportLatestImportQuery = `-- name: GetExtOpenstreetmapPublicTransportLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_openstreetmap_public_transport`;

export interface GetExtOpenstreetmapPublicTransportLatestImportRow {
    max: string;
}

export async function getExtOpenstreetmapPublicTransportLatestImport(client: Client): Promise<GetExtOpenstreetmapPublicTransportLatestImportRow | null> {
    const result = await client.query({
        text: getExtOpenstreetmapPublicTransportLatestImportQuery,
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

export const getNearestExtOpenstreetmapPublicTransportByTypeQuery = `-- name: GetNearestExtOpenstreetmapPublicTransportByType :many
SELECT
    uuid, name, reference, node_type, geometry, geometry_3857, geometry_27700, first_imported_at, last_imported_at,
    ST_Distance (
        geometry::geography,
        ST_GeomFromWKB ($1, 4326)::geography
    )::float AS distance
FROM
    public.ext_openstreetmap_public_transport
WHERE
    node_type = $2
ORDER BY
    distance ASC
LIMIT
    $3`;

export interface GetNearestExtOpenstreetmapPublicTransportByTypeArgs {
    stGeomfromwkb: string;
    nodeType: string;
    limit: string;
}

export interface GetNearestExtOpenstreetmapPublicTransportByTypeRow {
    uuid: string;
    name: string;
    reference: string;
    nodeType: string;
    geometry: string;
    geometry_3857: string;
    geometry_27700: string;
    firstImportedAt: Date;
    lastImportedAt: Date;
    distance: number;
}

export async function getNearestExtOpenstreetmapPublicTransportByType(client: Client, args: GetNearestExtOpenstreetmapPublicTransportByTypeArgs): Promise<GetNearestExtOpenstreetmapPublicTransportByTypeRow[]> {
    const result = await client.query({
        text: getNearestExtOpenstreetmapPublicTransportByTypeQuery,
        values: [args.stGeomfromwkb, args.nodeType, args.limit],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            name: row[1],
            reference: row[2],
            nodeType: row[3],
            geometry: row[4],
            geometry_3857: row[5],
            geometry_27700: row[6],
            firstImportedAt: row[7],
            lastImportedAt: row[8],
            distance: row[9]
        };
    });
}

export const getNearestExtOpenstreetmapPublicTransportInMvtByTypeQuery = `-- name: GetNearestExtOpenstreetmapPublicTransportInMvtByType :one
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
            COALESCE(
                NULLIF(
                    CASE
                        WHEN node_type = 'bus_stop' THEN 'Bus Stop: ' || name
                        WHEN node_type = 'train_station' THEN 'Train Station: ' || name
                    END,
                    CASE
                        WHEN node_type = 'bus_stop' THEN 'Bus Stop: '
                        WHEN node_type = 'train_station' THEN 'Train Station: '
                    END
                ),
                CASE
                    WHEN node_type = 'bus_stop' THEN 'Bus Stop'
                    WHEN node_type = 'train_station' THEN 'Train Station'
                END
            ) AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_openstreetmap_public_transport ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
            AND node_type = $4
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetNearestExtOpenstreetmapPublicTransportInMvtByTypeArgs {
    z: number;
    x: number;
    y: number;
    nodeType: string;
}

export interface GetNearestExtOpenstreetmapPublicTransportInMvtByTypeRow {
    mvt: Buffer;
}

export async function getNearestExtOpenstreetmapPublicTransportInMvtByType(client: Client, args: GetNearestExtOpenstreetmapPublicTransportInMvtByTypeArgs): Promise<GetNearestExtOpenstreetmapPublicTransportInMvtByTypeRow | null> {
    const result = await client.query({
        text: getNearestExtOpenstreetmapPublicTransportInMvtByTypeQuery,
        values: [args.z, args.x, args.y, args.nodeType],
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

export const newOpenstreetmapPublicTransportQuery = `-- name: NewOpenstreetmapPublicTransport :exec
INSERT INTO
    public.ext_openstreetmap_public_transport (name, reference, node_type, geometry)
VALUES
    (
        $1,
        $2,
        $3,
        ST_GeomFromWKB ($4, 4326)::geometry
    )`;

export interface NewOpenstreetmapPublicTransportArgs {
    name: string;
    reference: string;
    nodeType: string;
    geometry: string;
}

export async function newOpenstreetmapPublicTransport(client: Client, args: NewOpenstreetmapPublicTransportArgs): Promise<void> {
    await client.query({
        text: newOpenstreetmapPublicTransportQuery,
        values: [args.name, args.reference, args.nodeType, args.geometry],
        rowMode: "array"
    });
}

export const partialUpdateExtOpenstreetmapPublicTransportQuery = `-- name: PartialUpdateExtOpenstreetmapPublicTransport :exec
UPDATE public.ext_openstreetmap_public_transport
SET
    name = coalesce($1, name),
    node_type = coalesce($2, node_type),
    geometry = coalesce(
        ST_GeomFromWKB ($3, 4326)::geometry,
        geometry
    ),
    last_imported_at = NOW()
WHERE
    reference = $4`;

export interface PartialUpdateExtOpenstreetmapPublicTransportArgs {
    name: string | null;
    nodeType: string | null;
    geometry: string | null;
    reference: string;
}

export async function partialUpdateExtOpenstreetmapPublicTransport(client: Client, args: PartialUpdateExtOpenstreetmapPublicTransportArgs): Promise<void> {
    await client.query({
        text: partialUpdateExtOpenstreetmapPublicTransportQuery,
        values: [args.name, args.nodeType, args.geometry, args.reference],
        rowMode: "array"
    });
}

export const deleteAllExtOpenstreetmapPublicTransportQuery = `-- name: DeleteAllExtOpenstreetmapPublicTransport :exec
DELETE FROM public.ext_openstreetmap_public_transport
WHERE
    TRUE`;

export async function deleteAllExtOpenstreetmapPublicTransport(client: Client): Promise<void> {
    await client.query({
        text: deleteAllExtOpenstreetmapPublicTransportQuery,
        values: [],
        rowMode: "array"
    });
}

