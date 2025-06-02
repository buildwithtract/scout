import { Pool, PoolClient } from 'pg'

// Create a global pool instance
// In serverless environments, this will be reused across invocations when the container is warm
const globalPool = global as typeof globalThis & {
  _pgPool?: Pool
}

/**
 * Gets or creates a connection pool.
 * This approach is safer for Next.js server components and API routes.
 */
export function getPool(): Pool {
  if (!globalPool._pgPool) {
    globalPool._pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Serverless-friendly pool configuration
      max: 5, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30s
      connectionTimeoutMillis: 10000 // Timeout after 10s when connecting
    })

    // Handle pool errors
    globalPool._pgPool.on('error', (err) => {
      console.error('Unexpected pool error:', err)
    })
  }

  return globalPool._pgPool
}

/**
 * Gets a client from the pool for a single operation.
 * Remember to release the client when done!
 *
 * @example
 * const client = await getPoolClient()
 * try {
 *   const result = await client.query('SELECT ...')
 *   return result
 * } finally {
 *   client.release()
 * }
 */
export async function getPoolClient(): Promise<PoolClient> {
  const pool = getPool()
  return pool.connect()
}

/**
 * Executes a query using a pooled connection.
 * Automatically handles client acquisition and release.
 *
 * @example
 * const result = await withPoolClient(client =>
 *   client.query('SELECT * FROM users WHERE id = $1', [userId])
 * )
 */
export async function withPoolClient<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPoolClient()
  try {
    return await callback(client)
  } finally {
    client.release()
  }
}

/**
 * Gets a client compatible with the existing query functions.
 * This wraps a PoolClient to match the Client interface.
 *
 * ⚠️ IMPORTANT: You must call client.release() when done!
 *
 * @example
 * const client = await getCompatibleClient()
 * try {
 *   const result = await someQueryFunction(client, args)
 *   return result
 * } finally {
 *   (client as any).release()
 * }
 */
export async function getCompatibleClient(): Promise<any> {
  const poolClient = await getPoolClient()

  // Create a wrapper that matches the Client interface
  const clientWrapper = {
    query: poolClient.query.bind(poolClient),
    release: poolClient.release.bind(poolClient),
    // Add any other methods your queries use
    connect: () => Promise.resolve(),
    end: () => poolClient.release(),
    on: poolClient.on.bind(poolClient),
    // Add dummy properties to match Client interface
    port: null as any,
    host: null as any,
    ssl: null as any
  }

  return clientWrapper as any
}

/**
 * Gracefully shuts down the connection pool.
 * Call this when your application is shutting down.
 */
export async function closePool(): Promise<void> {
  if (globalPool._pgPool) {
    await globalPool._pgPool.end()
    delete globalPool._pgPool
  }
}
