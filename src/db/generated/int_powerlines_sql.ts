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
            public.int_powerlines ip,
            tile
        WHERE
            ST_Intersects (ST_Force2D (ip.geometry_3857), tile.envelope)
            AND (
                (ip.voltage >= 131000) -- Always show 132kV and above, with a buffer
                OR (
                    $1 >= 10
                    AND $1 < 12
                    AND ip.voltage >= 33000
                    AND ip.voltage < 131000
                )
                OR (
                    $1 >= 12
                    AND $1 < 14
                    AND ip.voltage >= 11000
                    AND ip.voltage < 131000
                )
                OR (
                    $1 >= 14
                    AND ip.voltage < 131000
                )
            )
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

