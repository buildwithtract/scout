import {
  deleteAllExtDatagovukParishes,
  getExtDatagovukParishForReference,
  getExtDatagovukParishLatestImport,
  newExtDatagovukParishFromWGS84,
  partialUpdateExtDatagovukParishForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukParishes extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-parishes'

  constructor(dbClient: Client) {
    super(dbClient, 'parish')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukParishLatestImport(this.dbClient)
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
    const existingFeature = await getExtDatagovukParishForReference(
      this.dbClient,
      { reference }
    )
    if (!existingFeature) {
      await newExtDatagovukParishFromWGS84(this.dbClient, {
        geometry: JSON.stringify(feature.geometry),
        reference,
        name,
        entryDate
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukParishForReference(this.dbClient, {
        reference,
        geometry: JSON.stringify(feature.geometry),
        name: name !== existingFeature.name ? name : null,
        entryDate: !this.datesEqual(entryDate, existingFeature.entryDate)
          ? entryDate
          : null
      })
      return 'updated'
    }
  }

  private datesEqual(date1: Date | null, date2: Date | null): boolean {
    if (date1 === null && date2 === null) return true
    if (date1 === null || date2 === null) return false
    return date1.getTime() === date2.getTime()
  }

  async truncate(): Promise<void> {
    console.info('Truncating parish data')
    try {
      await deleteAllExtDatagovukParishes(this.dbClient)
      console.info('Truncated parish data')
    } catch (error) {
      throw new Error(
        `Error deleting parishes: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
