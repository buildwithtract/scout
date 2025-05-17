import {
  deleteAllExtDatagovukAonb,
  getExtDatagovukAonbLatestImport,
  insertExtDatagovukAonbFromWGS84
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukAonb extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-aonb'

  constructor(dbClient: Client) {
    super(dbClient, 'area-of-outstanding-natural-beauty')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukAonbLatestImport(this.dbClient)
    return result?.max ? new Date(result.max) : new Date(0)
  }

  protected shouldTruncateBeforeFetch(): boolean {
    return true
  }

  async insertFeature(
    feature: GeoJSON.Feature
  ): Promise<'inserted' | 'updated'> {
    const properties = feature.properties || {}
    const reference = properties.reference
    if (!reference) {
      throw new Error('Missing reference in feature')
    }
    const name = properties.name
    if (!name) {
      throw new Error('Missing name in feature')
    }
    const entryDate = properties['entry-date'] || properties.entryDate
    if (!entryDate) {
      throw new Error('Missing entry-date in feature')
    }
    const parsedEntryDate = new Date(entryDate)
    const result = await insertExtDatagovukAonbFromWGS84(this.dbClient, {
      reference,
      name,
      entryDate: parsedEntryDate,
      geometry: JSON.stringify(feature.geometry)
    })
    if (result?.operation === 'inserted') {
      return 'inserted'
    }
    return 'updated'
  }

  async truncate(): Promise<void> {
    console.info('Truncating AONB data')
    try {
      await deleteAllExtDatagovukAonb(this.dbClient)
      console.info('Truncated AONB data')
    } catch (error) {
      console.error('Error truncating AONB data:', error)
      throw new Error(
        `Error truncating AONB data: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
