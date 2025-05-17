--
-- GETS
--
-- name: GetExtDatagovukAncientWoodlandForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_ancient_woodland
WHERE
    reference = $1;

-- name: GetExtDatagovukAncientWoodlandLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_ancient_woodland;

-- name: GetExtDatagovukAncientWoodlandInMvt :one
WITH
    tile AS (
        SELECT
            ST_TileEnvelope (
                sqlc.arg ('z')::int,
                sqlc.arg ('x')::int,
                sqlc.arg ('y')::int
            ) as envelope
    ),
    mvtgeom AS (
        SELECT
            uuid,
            name,
            ST_AsMVTGeom (
                ST_Simplify (
                    ip.geometry_3857,
                    CASE
                        WHEN sqlc.arg (z) >= 12 THEN 0
                        ELSE GREATEST(0.5, POWER(2, 20 - sqlc.arg (z)) / 4)
                    END
                ),
                tile.envelope
            )::geometry AS geometry
        FROM
            public.ext_datagovuk_ancient_woodland ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

--
-- INSERTS
--
-- name: InsertExtDatagovukAncientWoodlandFromWGS84 :one
INSERT INTO
    public.ext_datagovuk_ancient_woodland (geometry, reference, name)
VALUES
    (ST_GeomFromGeoJSON ($1)::geometry, $2, $3)
RETURNING
    *;

--
-- UPDATES
--
-- name: PartialUpdateExtDatagovukAncientWoodlandForReference :exec
UPDATE public.ext_datagovuk_ancient_woodland
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    name = coalesce(sqlc.narg ('name'), name),
    last_imported_at = NOW()
WHERE
    reference = $1;

--
-- DELETES
--
-- name: DeleteAllExtDatagovukAncientWoodlands :exec
DELETE FROM public.ext_datagovuk_ancient_woodland
WHERE
    TRUE;