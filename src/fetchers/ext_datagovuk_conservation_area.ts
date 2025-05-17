import {
  deleteAllExtDatagovukConservationAreas,
  getExtDatagovukConservationAreaForReference,
  getExtDatagovukConservationAreaLatestImport,
  newExtDatagovukConservationAreaFromWGS84,
  partialUpdateExtDatagovukConservationAreaForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukConservationArea extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-conservation-area'

  constructor(dbClient: Client) {
    super(dbClient, 'conservation-area')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukConservationAreaLatestImport(
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
    const existingFeature = await getExtDatagovukConservationAreaForReference(
      this.dbClient,
      { reference }
    )
    const geometry = JSON.stringify(feature.geometry)
    if (!existingFeature) {
      await newExtDatagovukConservationAreaFromWGS84(this.dbClient, {
        geometry,
        reference,
        name,
        entryDate
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukConservationAreaForReference(
        this.dbClient,
        {
          reference,
          geometry,
          name: name !== existingFeature.name ? name : null,
          entryDate: !this.datesEqual(entryDate, existingFeature.entryDate)
            ? entryDate
            : null
        }
      )
      return 'updated'
    }
  }

  private datesEqual(date1: Date | null, date2: Date | null): boolean {
    if (date1 === null && date2 === null) return true
    if (date1 === null || date2 === null) return false
    return date1.getTime() === date2.getTime()
  }

  async truncate(): Promise<void> {
    console.info('Truncating conservation area data')
    try {
      await deleteAllExtDatagovukConservationAreas(this.dbClient)
      console.info('Truncated conservation area data')
    } catch (error) {
      throw new Error(
        `Error deleting conservation areas: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
