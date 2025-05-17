import { Client } from 'pg'

export interface Fetcher {
  shouldGet(): Promise<boolean>
  fetch(): Promise<void>
  fetchIfRequired(): Promise<void>
  truncate(): Promise<void>
}

export abstract class BaseFetcher implements Fetcher {
  name: string
  dbClient: Client

  constructor(dbClient: Client) {
    this.dbClient = dbClient
  }

  abstract shouldGet(): Promise<boolean>
  abstract fetch(): Promise<void>
  abstract truncate(): Promise<void>

  async fetchIfRequired(): Promise<void> {
    const shouldGet = await this.shouldGet()
    if (shouldGet) {
      console.info(`Fetching ${this.constructor.name}`)
      return this.fetch()
    }
    console.info(`Skipping ${this.constructor.name} as it is up to date`)
  }
}
