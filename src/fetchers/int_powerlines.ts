import { Client } from 'pg'
import { withTransaction } from '../db/singleton-client'
import { BaseFetcher } from './fetcher'

export class IntPowerlines extends BaseFetcher {
  name = 'int-powerlines'

  constructor(dbClient: Client) {
    super(dbClient)
  }

  async shouldGet(): Promise<boolean> {
    // this fetcher is fully idempotent and internal, so we can always get it
    return true
  }

  async fetch(): Promise<void> {
    console.info('Fetching int_powerlines dataset')

    try {
      await withTransaction(async (client) => {
        await this.doRefresh(client)
        console.info('Refreshed materialized view Powerlines')
      })

      console.info('Refreshed materialized view')
    } catch (error) {
      throw new Error(`Failed to refresh Powerlines: ${error}`)
    }
  }

  async fetchIfRequired(): Promise<void> {
    return this.fetch()
  }

  async truncate(): Promise<void> {
    // No truncation needed for this materialized view refresher
    return
  }

  private async doRefresh(client: Client): Promise<void> {
    try {
      await client.query('REFRESH MATERIALIZED VIEW int_powerlines')
    } catch (error) {
      throw new Error(`Error refreshing materialized view: ${error}`)
    }
  }
}
