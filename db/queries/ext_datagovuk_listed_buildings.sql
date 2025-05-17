-- name: GetExtDatagovukListedBuildings :many
SELECT
    *
FROM
    public.ext_datagovuk_listed_buildings;

-- name: GetExtDatagovukListedBuilding :one
SELECT
    *
FROM
    public.ext_datagovuk_listed_buildings
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetExtDatagovukListedBuildingForReference :one
SELECT
    *
FROM
    public.ext_datagovuk_listed_buildings
WHERE
    reference = sqlc.arg (reference);

-- name: GetExtDatagovukListedBuildingThatIntersectsGeometry :one
SELECT
    *
FROM
    public.ext_datagovuk_listed_buildings
WHERE
    ST_Intersects (
        geometry_3857,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );

-- name: GetExtDatagovukListedBuildingLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    public.ext_datagovuk_listed_buildings;

-- name: NewExtDatagovukListedBuildingFromWGS84 :exec
INSERT INTO
    public.ext_datagovuk_listed_buildings (
        name,
        geometry,
        reference,
        entry_date,
        start_date,
        end_date,
        entity,
        documentation_url,
        listed_building_grade
    )
VALUES
    (
        sqlc.arg (name),
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry,
        sqlc.arg (reference),
        sqlc.arg (entry_date),
        sqlc.arg (start_date),
        sqlc.arg (end_date),
        sqlc.arg (entity),
        sqlc.arg (documentation_url),
        sqlc.arg (listed_building_grade)
    );

-- name: PartialUpdateExtDatagovukListedBuildingForReference :exec
UPDATE public.ext_datagovuk_listed_buildings
SET
    name = coalesce(sqlc.narg ('name'), name),
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    entry_date = coalesce(sqlc.narg ('entry_date'), entry_date),
    start_date = coalesce(sqlc.narg ('start_date'), start_date),
    end_date = coalesce(sqlc.narg ('end_date'), end_date),
    entity = coalesce(sqlc.narg ('entity'), entity),
    documentation_url = coalesce(
        sqlc.narg ('documentation_url'),
        documentation_url
    ),
    listed_building_grade = coalesce(
        sqlc.narg ('listed_building_grade'),
        listed_building_grade
    ),
    last_imported_at = NOW()
WHERE
    reference = sqlc.arg (reference);

-- name: DeleteAllExtDatagovukListedBuildings :exec
DELETE FROM public.ext_datagovuk_listed_buildings
WHERE
    TRUE;

-- name: GetExtDatagovukListedBuildingsInMvt :one
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
            public.ext_datagovuk_listed_buildings ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: GetExtDatagovukListedBuildingIntersectingGeometry :many
SELECT
    *
FROM
    public.ext_datagovuk_listed_buildings
WHERE
    ST_Intersects (
        geometry,
        ST_GeomFromGeoJSON (sqlc.arg (geometry))::geometry
    );
