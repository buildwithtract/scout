import {
  deleteAllExtDatagovukEducationalEstablishments,
  getExtDatagovukEducationalEstablishmentForReference,
  getExtDatagovukEducationalEstablishmentLatestImport,
  newExtDatagovukEducationalEstablishmentFromWGS84,
  partialUpdateExtDatagovukEducationalEstablishmentForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukEducationalEstablishment extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-educational-establishment'

  constructor(dbClient: Client) {
    super(dbClient, 'educational-establishment')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukEducationalEstablishmentLatestImport(
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
    // Optional dates with proper handling
    const openDateStr = feature.properties?.['open-date']
    let openDate: Date | null = null
    if (openDateStr) {
      try {
        openDate = new Date(openDateStr)
        if (isNaN(openDate.getTime())) {
          openDate = null
        }
      } catch {
        console.warn(`Invalid open-date: ${openDateStr}, ignoring`)
      }
    }
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
    // Capacity - convert to number
    const capacityStr = feature.properties?.['school-capacity']
    let capacity: number | null = null
    if (capacityStr) {
      try {
        capacity = parseInt(capacityStr, 10)
        if (isNaN(capacity)) {
          capacity = null
        }
      } catch {
        console.warn(`Invalid school-capacity: ${capacityStr}, ignoring`)
      }
    }
    // Establishment type and status
    const establishmentType =
      feature.properties?.['educational-establishment-type']
    if (!establishmentType) {
      console.warn(
        'Feature missing educational-establishment-type property, skipping'
      )
      return 'updated'
    }
    const status = feature.properties?.['educational-establishment-status']
    if (!status) {
      console.warn(
        'Feature missing educational-establishment-status property, skipping'
      )
      return 'updated'
    }
    // Check if feature already exists
    const existingFeature =
      await getExtDatagovukEducationalEstablishmentForReference(this.dbClient, {
        reference
      })
    // Prepare geometry
    const geometry = JSON.stringify(feature.geometry)
    // Get UPRN - if available
    const uprn = feature.properties?.uprn || ''
    if (!existingFeature) {
      await newExtDatagovukEducationalEstablishmentFromWGS84(this.dbClient, {
        reference,
        uprn,
        geometry,
        name,
        status,
        capacity,
        establishmentType,
        openDate,
        entryDate,
        startDate,
        endDate
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukEducationalEstablishmentForReference(
        this.dbClient,
        {
          reference,
          uprn: uprn !== existingFeature.uprn ? uprn : null,
          geometry,
          name: name !== existingFeature.name ? name : null,
          status: status !== existingFeature.status ? status : null,
          capacity: capacity !== existingFeature.capacity ? capacity : null,
          establishmentType:
            establishmentType !== existingFeature.establishmentType
              ? establishmentType
              : null,
          openDate: !this.datesEqual(openDate, existingFeature.openDate)
            ? openDate
            : null,
          entryDate: !this.datesEqual(entryDate, existingFeature.entryDate)
            ? entryDate
            : null,
          startDate: !this.datesEqual(startDate, existingFeature.startDate)
            ? startDate
            : null,
          endDate: !this.datesEqual(endDate, existingFeature.endDate)
            ? endDate
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
    console.info('Truncating educational establishment data')
    try {
      await deleteAllExtDatagovukEducationalEstablishments(this.dbClient)
      console.info('Truncated educational establishment data')
    } catch (error) {
      throw new Error(
        `Error deleting educational establishments: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
