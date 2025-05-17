import { Client } from 'pg'
import { withTransaction } from '../db/singleton-client'
import { BaseFetcher } from './fetcher'

export class IntIndependentOperators extends BaseFetcher {
  name = 'int-independent-operators'

  constructor(dbClient: Client) {
    super(dbClient)
  }

  async shouldGet(): Promise<boolean> {
    // this fetcher is fully idempotent and internal, so we can always get it
    return true
  }

  async fetch(): Promise<void> {
    console.info('Fetching int_independent_operators dataset')

    try {
      await withTransaction(async (client) => {
        await this.doRefresh(client)
        console.info('Refreshed materialized view Independent Operators')
      })

      console.info('Refreshed materialized view')
    } catch (error) {
      throw new Error(`Failed to refresh Independent Operators: ${error}`)
    }
  }

  async truncate(): Promise<void> {
    // No truncation needed for this materialized view refresher
    return
  }

  private async doRefresh(client: Client): Promise<void> {
    try {
      await client.query('REFRESH MATERIALIZED VIEW int_independent_operators')
    } catch (error) {
      throw new Error(`Error refreshing materialized view: ${error}`)
    }
  }
}
