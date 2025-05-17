import {
  deleteAllExtDatagovukScheduledMonuments,
  getExtDatagovukScheduledMonumentForReference,
  getExtDatagovukScheduledMonumentLatestImport,
  newExtDatagovukScheduledMonumentFromWGS84,
  partialUpdateExtDatagovukScheduledMonumentForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukScheduledMonuments extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-scheduled-monuments'

  constructor(dbClient: Client) {
    super(dbClient, 'scheduled-monument')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukScheduledMonumentLatestImport(
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
    // Optional properties
    let startDate: Date | null = null
    const startDateStr = feature.properties?.['start-date']
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
    let endDate: Date | null = null
    const endDateStr = feature.properties?.['end-date']
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
    const entity = feature.properties?.entity || null
    const documentationUrl = feature.properties?.['documentation-url'] || null
    const existingFeature = await getExtDatagovukScheduledMonumentForReference(
      this.dbClient,
      { reference }
    )
    if (!existingFeature) {
      await newExtDatagovukScheduledMonumentFromWGS84(this.dbClient, {
        geometry: JSON.stringify(feature.geometry),
        reference,
        name,
        entryDate,
        startDate,
        endDate,
        entity,
        documentationUrl
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukScheduledMonumentForReference(
        this.dbClient,
        {
          reference,
          geometry: JSON.stringify(feature.geometry),
          name: name !== existingFeature.name ? name : null,
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
          documentationUrl:
            documentationUrl !== existingFeature.documentationUrl
              ? documentationUrl
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
    console.info('Truncating scheduled monument data')
    try {
      await deleteAllExtDatagovukScheduledMonuments(this.dbClient)
      console.info('Truncated scheduled monument data')
    } catch (error) {
      throw new Error(
        `Error deleting scheduled monuments: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
