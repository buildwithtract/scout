import {
  deleteAllExtDatagovukLocalAuthorities,
  getExtDatagovukLocalAuthorityForReference,
  getExtDatagovukLocalAuthorityLatestImport,
  newExtDatagovukLocalAuthorityFromWGS84,
  partialUpdateExtDatagovukLocalAuthorityForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukLocalAuthorities extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-local-authorities'

  constructor(dbClient: Client) {
    super(dbClient, 'local-authority-district')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukLocalAuthorityLatestImport(
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
    const existingFeature = await getExtDatagovukLocalAuthorityForReference(
      this.dbClient,
      { reference }
    )
    if (!existingFeature) {
      await newExtDatagovukLocalAuthorityFromWGS84(this.dbClient, {
        geometry: JSON.stringify(feature.geometry),
        reference,
        name,
        entryDate
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukLocalAuthorityForReference(this.dbClient, {
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
    console.info('Truncating local authority data')
    try {
      await deleteAllExtDatagovukLocalAuthorities(this.dbClient)
      console.info('Truncated local authority data')
    } catch (error) {
      throw new Error(
        `Error deleting local authorities: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
