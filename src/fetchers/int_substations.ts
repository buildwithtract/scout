import { Client } from 'pg'
import { withTransaction } from '../db/singleton-client'
import { BaseFetcher } from './fetcher'

export class IntSubstations extends BaseFetcher {
  name = 'int-substations'

  constructor(dbClient: Client) {
    super(dbClient)
  }

  async shouldGet(): Promise<boolean> {
    // this fetcher is fully idempotent and internal, so we can always get it
    return true
  }

  async fetch(): Promise<void> {
    console.info('Fetching int_substations dataset')

    try {
      await withTransaction(async (client) => {
        await this.doRefresh(client)
        console.info('Refreshed materialized view Substations')
      })

      console.info('Refreshed materialized view')
    } catch (error) {
      throw new Error(`Failed to refresh Substations: ${error}`)
    }
  }

  async truncate(): Promise<void> {
    // No truncation needed for this materialized view refresher
    return
  }

  private async doRefresh(client: Client): Promise<void> {
    try {
      await client.query('REFRESH MATERIALIZED VIEW int_substations')
    } catch (error) {
      throw new Error(`Error refreshing materialized view: ${error}`)
    }
  }
}
