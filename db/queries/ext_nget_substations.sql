-- name: GetLatestImportForExtNgetSubstations :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_nget_substations;

-- name: GetExtNgetSubstationsInMvt :one
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
            name || ' (Voltage: ' || voltage || 'kV)' AS annotation,
            ST_AsMVTGeom (ip.geometry_3857, tile.envelope)::geometry AS geometry
        FROM
            public.ext_nget_substations ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: NewExtNgetSubstationFrom27700 :one
INSERT INTO
    public.ext_nget_substations (
        geometry,
        reference,
        name,
        status,
        voltage,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_Transform (ST_GeomFromWKB (sqlc.arg (geometry), 27700), 4326)::geometry,
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (status),
        sqlc.arg (voltage),
        NOW(),
        NOW()
    )
RETURNING
    uuid,
    ST_AsBinary (geometry)::geometry AS geometry,
    reference,
    name,
    status,
    voltage,
    first_imported_at,
    last_imported_at;

-- name: UpsertExtNgetSubstation :one
INSERT INTO
    public.ext_nget_substations (
        geometry,
        reference,
        name,
        status,
        voltage,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        ST_Force2D (
            ST_Transform (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 4326)
        ),
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (status),
        sqlc.arg (voltage),
        NOW(),
        NOW()
    )
ON CONFLICT (reference) DO UPDATE
SET
    geometry = coalesce(
        ST_Force2D (
            ST_Transform (ST_GeomFromGeoJSON (sqlc.narg ('geometry')), 4326)
        ),
        public.ext_nget_substations.geometry
    ),
    name = coalesce(
        sqlc.narg ('name'),
        public.ext_nget_substations.name
    ),
    status = coalesce(
        sqlc.narg ('status'),
        public.ext_nget_substations.status
    ),
    voltage = coalesce(
        sqlc.narg ('voltage'),
        public.ext_nget_substations.voltage
    ),
    last_imported_at = NOW()
RETURNING
    *,
    CASE
        WHEN xmax::text::int > 0 THEN 'updated'
        ELSE 'inserted'
    END AS operation;

-- name: DeleteAllExtNgetSubstations :exec
DELETE FROM public.ext_nget_substations;

-- name: DeleteMissingExtNgetSubstationsForReference :one
-- Given a list of reference, delete any existing substations that are not in the list
WITH
    deleted_rows AS (
        DELETE FROM public.ext_nget_substations AS s
        WHERE
            s.reference NOT IN (
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
