import { Client } from 'pg'

/**
 * Singleton class to manage database connections.
 */
class DatabaseConnection {
  private static instance: DatabaseConnection
  private client: Client | null = null
  private connecting: Promise<Client> | null = null

  private constructor() {}

  /**
   * Gets the singleton instance of DatabaseConnection
   * @returns {DatabaseConnection} The singleton instance
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  /**
   * Gets a connected database client. Reuses existing connection if available.
   * @returns {Promise<Client>} The database client
   */
  public async getClient(): Promise<Client> {
    // If we already have a connected client, return it
    if (this.client) {
      return this.client
    }

    // If we're in the process of connecting, wait for that to complete
    if (this.connecting) {
      return this.connecting
    }

    // Start new connection
    this.connecting = this.initializeClient()

    try {
      this.client = await this.connecting
      return this.client
    } finally {
      this.connecting = null
    }
  }

  /**
   * Initializes a new database client connection
   * @returns {Promise<Client>} The initialized database client
   */
  private async initializeClient(): Promise<Client> {
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })

    await client.connect()

    // Handle connection errors and cleanup
    client.on('error', (err) => {
      console.error('Unexpected database error:', err)
      this.client = null
    })

    return client
  }

  /**
   * Executes operations within a transaction
   * @param callback Function that performs database operations
   * @returns Result of the callback function
   */
  public async withTransaction<T>(
    callback: (client: Client) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient()

    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  }

  /**
   * Closes the database connection if open
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end()
      this.client = null
    }
  }
}

/**
 * Gets a connected database client using the singleton pattern
 * @returns {Promise<Client>} The database client
 */
export async function getDbClient(): Promise<Client> {
  return DatabaseConnection.getInstance().getClient()
}

/**
 * Executes operations within a transaction
 * @param callback Function that performs database operations
 * @returns Result of the callback function
 */
export async function withTransaction<T>(
  callback: (client: Client) => Promise<T>
): Promise<T> {
  return DatabaseConnection.getInstance().withTransaction(callback)
}
