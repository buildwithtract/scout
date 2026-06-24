-- name: UpsertExtNged132kvOverheadLine :one
INSERT INTO
    public.ext_nged_132kv_overhead_lines (voltage, situation, geometry)
VALUES
    ($1, $2, $3)
ON CONFLICT (uuid) DO UPDATE
SET
    voltage = EXCLUDED.voltage,
    situation = EXCLUDED.situation,
    geometry = EXCLUDED.geometry,
    last_imported_at = now()
RETURNING
    *;

-- name: DeleteExtNged132kvOverheadLine :exec
DELETE FROM public.ext_nged_132kv_overhead_lines
WHERE
    uuid = $1;

-- name: GetExtNged132kvOverheadLine :one
SELECT
    *
FROM
    public.ext_nged_132kv_overhead_lines
WHERE
    uuid = $1;

-- name: ListExtNged132kvOverheadLines :many
SELECT
    *
FROM
    public.ext_nged_132kv_overhead_lines
ORDER BY
    first_imported_at DESC;

-- name: TruncateExtNged132kvOverheadLines :exec
TRUNCATE TABLE public.ext_nged_132kv_overhead_lines;