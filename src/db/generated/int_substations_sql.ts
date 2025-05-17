import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const refreshIntSubstationsMaterializedViewQuery = `-- name: RefreshIntSubstationsMaterializedView :execresult
REFRESH MATERIALIZED VIEW int_substations`;

export const getNearestIntSubstationsQuery = `-- name: GetNearestIntSubstations :many
WITH
    voltage_appropriate AS (
        -- Skip all substations that have empty voltage, or voltage: 6.6kV, 11kV, Less than 1KV (415V, 240V for example), or "LV"
        SELECT
            uuid, geometry, geometry_3857, name, number, voltage, first_imported_at, last_imported_at, dno
        FROM
            public.int_substations
        WHERE
            voltage != ''
            AND voltage !~ '^((6.6|11)kV|([0-9]+)V|LV)$'
    )
SELECT
    uuid, geometry, geometry_3857, name, number, voltage, first_imported_at, last_imported_at, dno,
    ST_Distance (
        geometry_3857,
        ST_Transform (ST_GeomFromWKB ($2, 4326), 3857)
    )::float AS distance
FROM
    voltage_appropriate
ORDER BY
    distance ASC
LIMIT
    $1`;

export interface GetNearestIntSubstationsArgs {
    limit: string;
    point: string;
}

export interface GetNearestIntSubstationsRow {
    uuid: string;
    geometry: string;
    geometry_3857: string;
    name: string;
    number: string | null;
    voltage: number | null;
    firstImportedAt: Date;
    lastImportedAt: Date;
    dno: string;
    distance: number;
}

export async function getNearestIntSubstations(client: Client, args: GetNearestIntSubstationsArgs): Promise<GetNearestIntSubstationsRow[]> {
    const result = await client.query({
        text: getNearestIntSubstationsQuery,
        values: [args.limit, args.point],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            uuid: row[0],
            geometry: row[1],
            geometry_3857: row[2],
            name: row[3],
            number: row[4],
            voltage: row[5],
            firstImportedAt: row[6],
            lastImportedAt: row[7],
            dno: row[8],
            distance: row[9]
        };
    });
}

export const getIntSubstationsInMvtQuery = `-- name: GetIntSubstationsInMvt :one
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
            name || ' (Voltage: ' || voltage || ')' AS annotation,
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
            public.int_substations ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetIntSubstationsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetIntSubstationsInMvtRow {
    mvt: Buffer;
}

export async function getIntSubstationsInMvt(client: Client, args: GetIntSubstationsInMvtArgs): Promise<GetIntSubstationsInMvtRow | null> {
    const result = await client.query({
        text: getIntSubstationsInMvtQuery,
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

