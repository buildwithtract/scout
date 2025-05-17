-- name: GetLatestFetchesForEachDataset :many
SELECT DISTINCT ON (name)
    name,
    error,
    finished_at
FROM fetches
ORDER BY name, finished_at DESC;

-- name: InsertFetch :one
INSERT INTO
    fetches (name, command)
VALUES
    (sqlc.arg (name), sqlc.arg (command))
RETURNING
    uuid;

-- name: UpdateFetch :exec
UPDATE fetches
SET
    error = sqlc.arg (error),
    finished_at = sqlc.arg (finished_at)
WHERE
    uuid = sqlc.arg (uuid);