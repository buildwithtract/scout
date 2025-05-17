import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const refreshIntPowerlinesMaterializedViewQuery = `-- name: RefreshIntPowerlinesMaterializedView :execresult
REFRESH MATERIALIZED VIEW int_powerlines`;

export const getIntPowerlinesInMvtQuery = `-- name: GetIntPowerlinesInMvt :one
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
            voltage,
            situation,
            dno,
            CASE
                WHEN voltage >= 1000 THEN (voltage / 1000)::int || 'kV' || ' ' || situation
                ELSE voltage::text || 'V' || ' ' || situation
            END AS annotation,
            ST_AsMVTGeom (
                CASE
                    WHEN ST_GeometryType (geometry_3857) = 'ST_MultiLineString' THEN ST_LineMerge (ST_Force2D (geometry_3857))
                    ELSE ST_Force2D (geometry_3857)
                END,
                tile.envelope
            )::geometry AS geometry
        FROM
            public.int_powerlines ip,
            tile
        WHERE
            ST_Intersects (ST_Force2D (ip.geometry_3857), tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetIntPowerlinesInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetIntPowerlinesInMvtRow {
    mvt: Buffer;
}

export async function getIntPowerlinesInMvt(client: Client, args: GetIntPowerlinesInMvtArgs): Promise<GetIntPowerlinesInMvtRow | null> {
    const result = await client.query({
        text: getIntPowerlinesInMvtQuery,
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

