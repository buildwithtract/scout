import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getLatestFetchesForEachDatasetQuery = `-- name: GetLatestFetchesForEachDataset :many
SELECT DISTINCT ON (name)
    name,
    error,
    finished_at
FROM fetches
ORDER BY name, finished_at DESC`;

export interface GetLatestFetchesForEachDatasetRow {
    name: string;
    error: string | null;
    finishedAt: Date | null;
}

export async function getLatestFetchesForEachDataset(client: Client): Promise<GetLatestFetchesForEachDatasetRow[]> {
    const result = await client.query({
        text: getLatestFetchesForEachDatasetQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            name: row[0],
            error: row[1],
            finishedAt: row[2]
        };
    });
}

export const insertFetchQuery = `-- name: InsertFetch :one
INSERT INTO
    fetches (name, command)
VALUES
    ($1, $2)
RETURNING
    uuid`;

export interface InsertFetchArgs {
    name: string;
    command: string;
}

export interface InsertFetchRow {
    uuid: string;
}

export async function insertFetch(client: Client, args: InsertFetchArgs): Promise<InsertFetchRow | null> {
    const result = await client.query({
        text: insertFetchQuery,
        values: [args.name, args.command],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        uuid: row[0]
    };
}

export const updateFetchQuery = `-- name: UpdateFetch :exec
UPDATE fetches
SET
    error = $1,
    finished_at = $2
WHERE
    uuid = $3`;

export interface UpdateFetchArgs {
    error: string | null;
    finishedAt: Date | null;
    uuid: string;
}

export async function updateFetch(client: Client, args: UpdateFetchArgs): Promise<void> {
    await client.query({
        text: updateFetchQuery,
        values: [args.error, args.finishedAt, args.uuid],
        rowMode: "array"
    });
}

