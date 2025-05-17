import {
  deleteAllExtDatagovukSpecialProtectionAreas,
  getExtDatagovukSpecialProtectionAreaForReference,
  getExtDatagovukSpecialProtectionAreasLatestImport,
  newExtDatagovukSpecialProtectionAreaFromWGS84,
  partialUpdateExtDatagovukSpecialProtectionAreaForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukSpecialProtectionArea extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-special-protection-area'

  constructor(dbClient: Client) {
    super(dbClient, 'special-protection-area')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukSpecialProtectionAreasLatestImport(
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
      await getExtDatagovukSpecialProtectionAreaForReference(this.dbClient, {
        reference
      })
    if (!existingFeature) {
      await newExtDatagovukSpecialProtectionAreaFromWGS84(this.dbClient, {
        geometry: JSON.stringify(feature.geometry),
        reference,
        name
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukSpecialProtectionAreaForReference(
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
    console.info('Truncating special protection area data')
    try {
      await deleteAllExtDatagovukSpecialProtectionAreas(this.dbClient)
      console.info('Truncated special protection area data')
    } catch (error) {
      throw new Error(
        `Error deleting special protection areas: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
