-- name: GetExtDatagovukSSSIs :many
SELECT
    *
FROM
    public.ext_datagovuk_sssi;

-- name: GetExtDatagovukSSSI :one
SELECT
    *
FROM
    public.ext_datagovuk_sssi
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukSSSIForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_sssi
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukSSSILatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_sssi;

-- name: NewExtDatagovukSSSIFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_sssi (
        geometry,
        reference,
        name,
        entry_date,
        start_date,
        end_date
    )
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (entry_date),
        sqlc.arg (start_date),
        sqlc.arg (end_date)
    );

-- name: PartialUpdateExtDatagovukSSSIForReference :exec
UPDATE public.ext_datagovuk_sssi
SET
    name = coalesce(sqlc.narg ('name'), name),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    start_date = coalesce(sqlc.narg ('start_date'), start_date),
    end_date = coalesce(sqlc.narg ('end_date'), end_date),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukSSSIThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_sssi
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: DeleteAllExtDatagovukSSSIs :exec
DELETE FROM public.ext_datagovuk_sssi
WHERE
    TRUE;

-- name: GetExtDatagovukSSSIsWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_sssi
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukSSSIsInMvt :one
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
            name,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_sssi ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;
