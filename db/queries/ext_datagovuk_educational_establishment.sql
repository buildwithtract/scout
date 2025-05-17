-- name: GetExtDatagovukEducationalEstablishments :many
SELECT
    *
FROM
    public.ext_datagovuk_educational_establishment;

-- name: GetExtDatagovukEducationalEstablishment :one
SELECT
    *
FROM
    public.ext_datagovuk_educational_establishment
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukEducationalEstablishmentForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_educational_establishment
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukEducationalEstablishmentThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_educational_establishment
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukEducationalEstablishmentLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_educational_establishment;

-- name: NewExtDatagovukEducationalEstablishmentFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_educational_establishment (
        reference,
        uprn,
        geometry,
        name,
        status,
        capacity,
        establishment_type,
        open_date,
        entry_date,
        start_date,
        end_date
    )
VALUES
    (
        sqlc.arg (reference),
        sqlc.arg (uprn),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (name),
        sqlc.arg (status),
        sqlc.arg (capacity),
        sqlc.arg (establishment_type),
        sqlc.arg (open_date),
        sqlc.arg (entry_date),
        sqlc.arg (start_date),
        sqlc.arg (end_date)
    );

-- name: PartialUpdateExtDatagovukEducationalEstablishmentForReference :exec
UPDATE public.ext_datagovuk_educational_establishment
SET
    uprn = coalesce(sqlc.narg ('uprn'), uprn),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    name = coalesce(sqlc.narg ('name'), name),
    status = coalesce(sqlc.narg ('status'), status),
    capacity = coalesce(sqlc.narg ('capacity'), capacity),
    establishment_type = coalesce(
        sqlc.narg ('establishment_type'),
        establishment_type
    ),
    open_date = coalesce(sqlc.narg ('open_date'), open_date),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    start_date = coalesce(sqlc.narg ('start_date'), start_date),
    end_date = coalesce(sqlc.narg ('end_date'), end_date),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukEducationalEstablishments :exec
DELETE FROM public.ext_datagovuk_educational_establishment
WHERE
    TRUE;

-- name: GetExtDatagovukEducationalEstablishmentsInMvt :one
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
            name || ' (Capacity: ' || capacity || ')' AS annotation,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_datagovuk_educational_establishment ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: GetNearestExtDatagovukEducationalEstablishments :many
SELECT
    *,
    ST_Distance (
        geometry::geography,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geography
    )::float AS distance
FROM
    public.ext_datagovuk_educational_establishment
WHERE
    status = '1'
ORDER BY
    distance ASC
LIMIT
    sqlc.arg (num_results);