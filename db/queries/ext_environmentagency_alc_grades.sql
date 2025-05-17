-- name: GetExtEnvironmentagencyALCGradesLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_environmentagency_alc_grades;

-- name: GetExtEnvironmentagencyALCGradesForReference :one
SELECT
    *
FROM
    public.ext_environmentagency_alc_grades
WHERE
    objectid = sqlc.arg (objectid);

-- name: GetExtEnvironmentagencyAlcGradesInMvt :one
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
            alc_grade,
            area,
            url,
            ST_AsMVTGeom (ST_Transform (ip.geometry, 3857), tile.envelope)::geometry AS geometry
        FROM
            public.ext_environmentagency_alc_grades ip,
            tile
        WHERE
            ST_Intersects (ip.geometry, ST_Transform (tile.envelope, 4326))
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: NewExtEnvironmentagencyAlcGrade :one
INSERT INTO
    public.ext_environmentagency_alc_grades (objectid, alc_grade, area, url, geometry)
VALUES
    (
        sqlc.arg (objectid),
        sqlc.arg (alc_grade),
        sqlc.arg (area),
        sqlc.arg (url),
        ST_Transform (
            ST_SetSRID (ST_GeomFromGeoJSON (sqlc.arg (geometry)), 27700),
            4326
        )::geometry
    )
RETURNING
    uuid,
    objectid,
    alc_grade,
    area,
    url,
    geometry;

-- name: PartialUpdateExtEnvironmentagencyALCGrades :exec
UPDATE public.ext_environmentagency_alc_grades
SET
    geometry = coalesce(
        ST_Transform (
            ST_SetSRID (
                ST_GeomFromGeoJSON (sqlc.narg ('geometry')),
                27700
            ),
            4326
        )::geometry,
        geometry
    ),
    alc_grade = coalesce(sqlc.narg ('alc_grade'), alc_grade),
    area = coalesce(sqlc.narg ('area'), area),
    url = coalesce(sqlc.narg ('url'), url),
    last_imported_at = NOW()
WHERE
    objectid = sqlc.arg (objectid);

-- name: DeleteAllExtEnvironmentagencyAlcGrades :exec
DELETE FROM public.ext_environmentagency_alc_grades
WHERE
    TRUE;
