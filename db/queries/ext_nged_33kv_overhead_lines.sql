-- name: UpsertExtNged33kvOverheadLine :one
INSERT INTO
    public.ext_nged_33kv_overhead_lines (
        uuid,
        voltage,
        situation,
        geometry,
        geometry_3857,
        geometry_27700,
        first_imported_at,
        last_imported_at
    )
VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (uuid) DO UPDATE
SET
    voltage = EXCLUDED.voltage,
    situation = EXCLUDED.situation,
    geometry = EXCLUDED.geometry,
    geometry_3857 = EXCLUDED.geometry_3857,
    geometry_27700 = EXCLUDED.geometry_27700,
    last_imported_at = EXCLUDED.last_imported_at
RETURNING
    *;

-- name: DeleteAllExtNged33kvOverheadLines :exec
DELETE FROM public.ext_nged_33kv_overhead_lines;

-- name: GetExtNged33kvOverheadLines :many
SELECT
    ext_nged_33kv_overhead_lines.uuid,
    ext_nged_33kv_overhead_lines.voltage,
    ext_nged_33kv_overhead_lines.situation,
    ext_nged_33kv_overhead_lines.geometry,
    ext_nged_33kv_overhead_lines.geometry_3857,
    ext_nged_33kv_overhead_lines.geometry_27700,
    ext_nged_33kv_overhead_lines.first_imported_at,
    ext_nged_33kv_overhead_lines.last_imported_at
FROM
    public.ext_nged_33kv_overhead_lines
ORDER BY
    ext_nged_33kv_overhead_lines.last_imported_at DESC;