import {
  deleteAllExtDatagovukListedBuildings,
  getExtDatagovukListedBuildingForReference,
  getExtDatagovukListedBuildingLatestImport,
  newExtDatagovukListedBuildingFromWGS84,
  partialUpdateExtDatagovukListedBuildingForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukListedBuilding extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-listed-buildings'

  constructor(dbClient: Client) {
    super(dbClient, 'listed-building')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukListedBuildingLatestImport(
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
    const startDateStr = feature.properties?.['start-date']
    let startDate: Date | null = null
    if (startDateStr) {
      startDate = new Date(startDateStr)
      if (isNaN(startDate.getTime())) {
        startDate = null
      }
    }
    const endDateStr = feature.properties?.['end-date']
    let endDate: Date | null = null
    if (endDateStr) {
      endDate = new Date(endDateStr)
      if (isNaN(endDate.getTime())) {
        endDate = null
      }
    }
    const entity = feature.properties?.entity || null
    const documentationUrl = feature.properties?.['documentation-url'] || null
    const listedBuildingGrade =
      feature.properties?.['listed-building-grade'] || null
    const existingFeature = await getExtDatagovukListedBuildingForReference(
      this.dbClient,
      { reference }
    )
    if (!existingFeature) {
      await newExtDatagovukListedBuildingFromWGS84(this.dbClient, {
        geometry: JSON.stringify(feature.geometry),
        reference,
        name,
        entryDate,
        startDate,
        endDate,
        entity,
        documentationUrl,
        listedBuildingGrade
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukListedBuildingForReference(this.dbClient, {
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
            : null,
        listedBuildingGrade:
          listedBuildingGrade !== existingFeature.listedBuildingGrade
            ? listedBuildingGrade
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
    console.info('Truncating listed building data')
    try {
      await deleteAllExtDatagovukListedBuildings(this.dbClient)
      console.info('Truncated listed building data')
    } catch (error) {
      throw new Error(
        `Error deleting listed buildings: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
