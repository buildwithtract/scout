import {
  deleteAllExtDatagovukGreenBelt,
  getExtDatagovukGreenBeltForReference,
  getExtDatagovukGreenBeltLatestImport,
  newExtDatagovukGreenBeltFromWGS84,
  partialUpdateExtDatagovukGreenBeltForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukGreenBelt extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-green-belt'

  constructor(dbClient: Client) {
    super(dbClient, 'green-belt')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukGreenBeltLatestImport(this.dbClient)
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
    // Optional dates with proper handling
    const startDateStr = feature.properties?.['start-date']
    let startDate: Date | null = null
    if (startDateStr) {
      try {
        startDate = new Date(startDateStr)
        if (isNaN(startDate.getTime())) {
          startDate = null
        }
      } catch {
        console.warn(`Invalid start-date: ${startDateStr}, ignoring`)
      }
    }
    const endDateStr = feature.properties?.['end-date']
    let endDate: Date | null = null
    if (endDateStr) {
      try {
        endDate = new Date(endDateStr)
        if (isNaN(endDate.getTime())) {
          endDate = null
        }
      } catch {
        console.warn(`Invalid end-date: ${endDateStr}, ignoring`)
      }
    }
    const entity = feature.properties?.entity
    if (!entity) {
      console.warn('Feature missing entity property, skipping')
      return 'updated'
    }
    const greenBeltCore = feature.properties?.['green-belt-core']
    if (!greenBeltCore) {
      console.warn('Feature missing green-belt-core property, skipping')
      return 'updated'
    }
    const existingFeature = await getExtDatagovukGreenBeltForReference(
      this.dbClient,
      { reference }
    )
    const geometry = JSON.stringify(feature.geometry)
    if (!existingFeature) {
      await newExtDatagovukGreenBeltFromWGS84(this.dbClient, {
        reference,
        name,
        geometry,
        entryDate,
        startDate,
        endDate,
        entity,
        greenBeltCore
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukGreenBeltForReference(this.dbClient, {
        reference,
        name: name !== existingFeature.name ? name : null,
        geometry,
        entryDate: !this.datesEqual(entryDate, existingFeature.entryDate)
          ? entryDate
          : null,
        startDate: !this.datesEqual(startDate, existingFeature.startDate)
          ? startDate
          : null,
        endDate: !this.datesEqual(endDate, existingFeature.endDate)
          ? endDate
          : null,
        entity: entity !== existingFeature.entity ? entity : null,
        greenBeltCore:
          greenBeltCore !== existingFeature.greenBeltCore ? greenBeltCore : null
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
    console.info('Truncating green belt data')
    try {
      await deleteAllExtDatagovukGreenBelt(this.dbClient)
      console.info('Truncated green belt data')
    } catch (error) {
      throw new Error(
        `Error deleting green belt: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
