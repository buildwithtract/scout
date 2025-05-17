-- name: GetExtDatagovukTrees :many
SELECT
    *
FROM
    public.ext_datagovuk_trees;

-- name: GetExtDatagovukTree :one
SELECT
    *
FROM
    public.ext_datagovuk_trees
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukTreeForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_trees
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukTreesLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_trees;

-- name: NewExtDatagovukTreeFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_trees (
        geometry,
        reference,
        species,
        name,
        notes,
        entry_date
    )
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (species),
        sqlc.arg (name),
        sqlc.arg (notes),
        sqlc.arg (entry_date)
    );

-- name: PartialUpdateExtDatagovukTreeForReference :exec
UPDATE public.ext_datagovuk_trees
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    species = coalesce(sqlc.narg ('species'), species),
    name = coalesce(sqlc.narg ('name'), name),
    notes = coalesce(sqlc.narg ('notes'), notes),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukTreesThatIntersectsGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_trees
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: DeleteAllExtDatagovukTrees :exec
DELETE FROM public.ext_datagovuk_trees
WHERE
    TRUE;

-- name: GetExtDatagovukTreesWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_trees
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukTreesInMvt :one
WITH
    tile AS (
        SELECT
            ST_TileEnvelope (
                sqlc.arg (z)::int,
                sqlc.arg (x)::int,
                sqlc.arg (y)::int
            ) as envelope
    ),
    mvtgeom AS (
        SELECT
            uuid,
            'TPO: ' || reference as annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_trees ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;
