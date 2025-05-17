import {
  deleteAllExtDatagovukNationalNatureReserves,
  getExtDatagovukNationalNatureReserveLatestImport,
  upsertExtDatagovukNationalNatureReserveFromWGS84
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukNationalNatureReserves extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-national-nature-reserves'

  constructor(dbClient: Client) {
    super(dbClient, 'national-nature-reserve')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukNationalNatureReserveLatestImport(
      this.dbClient
    )
    return result?.max ? new Date(result.max) : new Date(0)
  }

  async insertFeature(
    feature: GeoJSON.Feature
  ): Promise<'inserted' | 'updated'> {
    const reference = feature.properties?.reference
    if (!reference) {
      console.warn('Feature missing reference property, skipping')
      return 'updated'
    }
    const name = feature.properties?.name
    if (!name) {
      console.warn('Feature missing name property, skipping')
      return 'updated'
    }
    const entryDateStr = feature.properties?.['entry-date']
    if (!entryDateStr) {
      console.warn('Feature missing entry-date property, skipping')
      return 'updated'
    }
    const entryDate = new Date(entryDateStr)
    if (isNaN(entryDate.getTime())) {
      console.warn(`Invalid entry-date: ${entryDateStr}, skipping`)
      return 'updated'
    }
    const status = feature.properties?.['nature-reserve-status']
    if (!status) {
      console.warn('Feature missing nature-reserve-status property, skipping')
      return 'updated'
    }
    const result = await upsertExtDatagovukNationalNatureReserveFromWGS84(
      this.dbClient,
      {
        reference,
        geometry: JSON.stringify(feature.geometry),
        name,
        status,
        entryDate
      }
    )
    return result?.operation === 'inserted' ? 'inserted' : 'updated'
  }

  async truncate(): Promise<void> {
    console.info('Truncating national nature reserve data')
    try {
      await deleteAllExtDatagovukNationalNatureReserves(this.dbClient)
      console.info('Truncated national nature reserve data')
    } catch (error) {
      throw new Error(
        `Error deleting national nature reserves: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
