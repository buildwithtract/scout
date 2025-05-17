import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const refreshIntIndependentOperatorsMaterializedViewQuery = `-- name: RefreshIntIndependentOperatorsMaterializedView :execresult
REFRESH MATERIALIZED VIEW int_independent_operators`;

export const getIntIndependentOperatorsInMvtQuery = `-- name: GetIntIndependentOperatorsInMvt :one
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
            name || ' (Name: ' || name || ')' AS annotation,
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
            public.int_independent_operators ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom`;

export interface GetIntIndependentOperatorsInMvtArgs {
    z: number;
    x: number;
    y: number;
}

export interface GetIntIndependentOperatorsInMvtRow {
    mvt: Buffer;
}

export async function getIntIndependentOperatorsInMvt(client: Client, args: GetIntIndependentOperatorsInMvtArgs): Promise<GetIntIndependentOperatorsInMvtRow | null> {
    const result = await client.query({
        text: getIntIndependentOperatorsInMvtQuery,
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

