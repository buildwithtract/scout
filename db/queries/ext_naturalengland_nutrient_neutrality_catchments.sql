-- name: GetExtNaturalenglandNutrientNeutralityCatchmentsLatestImport :one
SELECT
    MAX(last_imported_at)
FROM
    ext_naturalengland_nutrient_neutrality_catchments;

-- name: GetExtNaturalenglandNutrientNeutralityCatchmentsForReference :one
SELECT
    *
FROM
    public.ext_naturalengland_nutrient_neutrality_catchments
WHERE
    object_id = sqlc.arg (object_id);

-- name: GetExtNaturalenglandNutrientNeutralityCatchmentsInMvt :one
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
            object_id as reference,
            n2k_site_name as name,
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
            public.ext_naturalengland_nutrient_neutrality_catchments ip,
            tile
        WHERE
            ST_Intersects (ip.geometry_3857, tile.envelope)
    )
SELECT
    ST_AsMVT (mvtgeom.*)::bytea AS mvt
FROM
    mvtgeom;

-- name: NewExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSON :one
INSERT INTO
    public.ext_naturalengland_nutrient_neutrality_catchments (
        geometry,
        popup_info,
        n2k_site_name,
        label,
        object_id,
        date_amended,
        notes,
        global_id,
        oid_1
    )
VALUES
    (
        ST_GeomFromGeoJSON ($1)::geometry,
        sqlc.arg (popup_info),
        sqlc.arg (n2k_site_name),
        sqlc.arg (label),
        sqlc.arg (object_id),
        sqlc.arg (date_amended),
        sqlc.arg (notes),
        sqlc.arg (global_id),
        sqlc.arg (oid_1)
    )
RETURNING
    uuid,
    popup_info,
    n2k_site_name,
    label,
    object_id,
    date_amended,
    notes,
    global_id,
    oid_1;

-- name: PartialUpdateExtNaturalenglandNutrientNeutralityCatchmentsFromGeoJSON :exec
UPDATE public.ext_naturalengland_nutrient_neutrality_catchments
SET
    geometry = coalesce(
        ST_GeomFromGeoJSON (sqlc.narg ('geometry'))::geometry,
        geometry
    ),
    popup_info = coalesce(sqlc.narg ('popup_info'), popup_info),
    n2k_site_name = coalesce(sqlc.narg ('n2k_site_name'), n2k_site_name),
    label = coalesce(sqlc.narg ('label'), label),
    object_id = coalesce(sqlc.narg ('object_id'), object_id),
    date_amended = coalesce(sqlc.narg ('date_amended'), date_amended),
    notes = coalesce(sqlc.narg ('notes'), notes),
    global_id = coalesce(sqlc.narg ('global_id'), global_id),
    oid_1 = coalesce(sqlc.narg ('oid_1'), oid_1),
    last_imported_at = NOW()
WHERE
    object_id = sqlc.arg (object_id);

-- name: DeleteAllExtNaturalenglandNutrientNeutralityCatchments :exec
DELETE FROM public.ext_naturalengland_nutrient_neutrality_catchments
WHERE
    TRUE;
