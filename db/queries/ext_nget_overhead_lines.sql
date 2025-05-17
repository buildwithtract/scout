-- name: GetLatestImportForExtNgetOverheadLines :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_nget_overhead_lines;

-- name: GetExtNgetOverheadLinesInMvt :one
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
            circuit_one || ' (Voltage: ' || voltage || 'kV)' AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_nget_overhead_lines ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: UpsertExtNgetOverheadLine :one
INSERT INTO
    public.ext_nget_overhead_lines (
        reference,
        status,
        circuit_one,
        circuit_two,
        voltage,
        situation,
        geometry,
        geometry_3857,
        geometry_27700,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (status),
        sqlc.arg (circuit_one),
        sqlc.arg (circuit_two),
        sqlc.arg (voltage),
        sqlc.arg (situation),
        ST_SetSRID (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 4326),
        ST_Transform (
            ST_SetSRID (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 4326),
            3857
        ),
        ST_Transform (
            ST_SetSRID (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 4326),
            27700
        ),
        COALESCE(sqlc.arg (first_imported_at), NOW()),
        NOW()
    )
ON CONFLICT (reference) DO UPDATE
SET
    status = EXCLUDED.status,
    circuit_one = EXCLUDED.circuit_one,
    circuit_two = EXCLUDED.circuit_two,
    voltage = EXCLUDED.voltage,
    situation = EXCLUDED.situation,
    geometry = EXCLUDED.geometry,
    geometry_3857 = EXCLUDED.geometry_3857,
    geometry_27700 = EXCLUDED.geometry_27700,
    last_imported_at = EXCLUDED.last_imported_at
RETURNING
    reference;

-- name: DeleteAllExtNgetOverheadLines :exec
DELETE FROM public.ext_nget_overhead_lines;

-- name: DeleteMissingExtNgetOverheadLinesForReference :one
-- Given a list of reference, delete any existing overhead lines that are not in the list
WITH
    deleted_rows AS (
        DELETE FROM public.ext_nget_overhead_lines AS o
        WHERE
            o.reference NOT IN (
                SELECT
                    UNNEST(sqlc.arg ('references')::text[])
            )
        RETURNING
            *
    )
SELECT
    COUNT(*)
FROM
    deleted_rows;
