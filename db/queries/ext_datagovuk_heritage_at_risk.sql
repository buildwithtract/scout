-- name: GetExtDatagovukHeritageAtRisks :many
SELECT
    *
FROM
    public.ext_datagovuk_heritage_at_risk;

-- name: GetExtDatagovukHeritageAtRisk :one
SELECT
    *
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukHeritageAtRiskForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukHeritageAtRiskLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_heritage_at_risk;

-- name: NewExtDatagovukHeritageAtRiskFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_heritage_at_risk (geometry, reference, name, documentation_url)
VALUES
    (
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (name),
        sqlc.arg (documentation_url)
    );

-- name: PartialUpdateExtDatagovukHeritageAtRiskForReference :exec
UPDATE public.ext_datagovuk_heritage_at_risk
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    name = coalesce(sqlc.narg ('name'), name),
    documentation_url = coalesce(
        sqlc.narg ('documentation_url'),
        documentation_url
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukHeritageAtRiskThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: DeleteAllExtDatagovukHeritageAtRisks :exec
DELETE FROM public.ext_datagovuk_heritage_at_risk
WHERE
    TRUE;

-- name: GetExtDatagovukHeritageAtRisksWithin1KmOfGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    ST_DWithin (
        ST_Transform (geometry, 3857),
        ST_Transform (
            ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
            3857
        ),
        1000
    );

-- name: GetExtDatagovukHeritageAtRiskIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_heritage_at_risk
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukHeritageAtRiskInMvt :one
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
            public.ext_datagovuk_heritage_at_risk ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;