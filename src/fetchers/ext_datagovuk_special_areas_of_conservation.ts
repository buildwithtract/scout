import {
  deleteAllExtDatagovukSpecialAreasOfConservation,
  getExtDatagovukSpecialAreaOfConservationForReference,
  getExtDatagovukSpecialAreaOfConservationLatestImport,
  newExtDatagovukSpecialAreaOfConservationFromWGS84,
  partialUpdateExtDatagovukSpecialAreaOfConservationForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukSpecialAreasOfConservation extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-special-areas-of-conservation'

  constructor(dbClient: Client) {
    super(dbClient, 'special-area-of-conservation')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukSpecialAreaOfConservationLatestImport(
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
    const existingFeature =
      await getExtDatagovukSpecialAreaOfConservationForReference(
        this.dbClient,
        { reference }
      )
    if (!existingFeature) {
      await newExtDatagovukSpecialAreaOfConservationFromWGS84(this.dbClient, {
        geometry: JSON.stringify(feature.geometry),
        reference,
        name
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukSpecialAreaOfConservationForReference(
        this.dbClient,
        {
          reference,
          geometry: JSON.stringify(feature.geometry),
          name: name !== existingFeature.name ? name : null
        }
      )
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    console.info('Truncating special area of conservation data')
    try {
      await deleteAllExtDatagovukSpecialAreasOfConservation(this.dbClient)
      console.info('Truncated special area of conservation data')
    } catch (error) {
      throw new Error(
        `Error deleting special areas of conservation: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
