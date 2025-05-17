-- name: GetExtDatagovukBattlefieldForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_battlefields
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukBattlefieldLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_datagovuk_battlefields;

-- name: GetExtDatagovukBattlefieldsInMvt :one
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
            public.ext_datagovuk_battlefields ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: NewExtDatagovukBattlefieldFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_battlefields (
        reference,
        name,
        geometry,
        entry_date,
        start_date,
        end_date,
        entity,
        document_url,
        documentation_url,
        first_imported_at,
        last_imported_at
    )
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (name),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (entry_date),
        sqlc.arg (start_date),
        sqlc.arg (end_date),
        sqlc.arg (entity),
        sqlc.arg (document_url),
        sqlc.arg (documentation_url),
        NOW(),
        NOW()
    );

-- name: PartialUpdateExtDatagovukBattlefieldForReference :exec
UPDATE public.ext_datagovuk_battlefields
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    name = coalesce(sqlc.narg ('name'), name),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    start_date = coalesce(sqlc.narg ('start_date'), start_date),
    end_date = coalesce(sqlc.narg ('end_date'), end_date),
    entity = coalesce(sqlc.narg ('entity'), entity),
    document_url = coalesce(sqlc.narg ('document_url'), document_url),
    documentation_url = coalesce(
        sqlc.narg ('documentation_url'),
        documentation_url
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukBattlefields :exec
DELETE FROM public.ext_datagovuk_battlefields
WHERE
    TRUE;
