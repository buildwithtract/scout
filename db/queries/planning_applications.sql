-- name: GetPlanningApplicationByUuid :one
SELECT
    *
FROM
    planning_applications
WHERE
    uuid = sqlc.arg (uuid);

-- name: GetNearestPlanningApplications :many
SELECT
    pa.*,
    ST_Distance (
        CASE
            WHEN ST_GeometryType (pag.geometry) = 'ST_Point' THEN ST_Transform (ST_SetSRID (pag.geometry, 4326), 3857)
            ELSE ST_Transform (
                ST_SetSRID (ST_Centroid (pag.geometry), 4326),
                3857
            )
        END,
        ST_Transform (
            ST_SetSRID (ST_GeomFromWKB (sqlc.arg (point)), 4326),
            3857
        )
    )::float AS distance,
    pag.geometry::geometry AS geometry
FROM
    planning_applications pa
    JOIN planning_application_geometries pag ON pa.uuid = pag.planning_application_uuid
WHERE
    ST_DWithin (
        CASE
            WHEN ST_GeometryType (pag.geometry) = 'ST_Point' THEN ST_Transform (ST_SetSRID (pag.geometry, 4326), 3857)
            ELSE ST_Transform (
                ST_SetSRID (ST_Centroid (pag.geometry), 4326),
                3857
            )
        END,
        ST_Transform (
            ST_SetSRID (ST_GeomFromWKB (sqlc.arg (point)), 4326),
            3857
        ),
        sqlc.arg (distance_metres)
    )
ORDER BY
    distance ASC;

-- name: GetPlanningApplicationsInMvt :one
WITH
    tile AS (
        SELECT
            ST_TileEnvelope (
                sqlc.arg (z)::int,
                sqlc.arg (x)::int,
                sqlc.arg (y)::int
            ) as envelope
    ),
    geometry_points AS (
        SELECT
            pa.uuid,
            pa.reference,
            pa.url,
            pa.submitted_date,
            pa.address,
            pa.description,
            pa.application_status,
            pa.application_decision,
            CASE
                WHEN ST_GeometryType (ST_SetSRID (pag.geometry, 4326)) = 'ST_Point' THEN ST_SetSRID (pag.geometry, 4326)
                ELSE ST_Centroid (ST_SetSRID (pag.geometry, 4326))
            END as geometry_point
        FROM
            public.planning_applications pa
            JOIN public.planning_application_geometries pag ON pa.uuid = pag.planning_application_uuid
    ),
    mvtgeom AS (
        SELECT
            uuid,
            reference,
            url,
            submitted_date,
            address,
            description,
            application_status,
            application_decision,
            COALESCE('Planning Application: ' || reference) AS annotation,
            ST_AsMVTGeom (
                ST_Transform (geometry_point, 3857),
                tile.envelope
            )::geometry AS geometry
        FROM
            geometry_points gp,
            tile
        WHERE
            ST_Intersects (
                ST_Transform (gp.geometry_point, 3857),
                tile.envelope
            )
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;