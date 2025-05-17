import {
  deleteAllExtDatagovukHeritageCoasts,
  getExtDatagovukHeritageCoastForReference,
  getExtDatagovukHeritageCoastLatestImport,
  newExtDatagovukHeritageCoastFromWGS84,
  partialUpdateExtDatagovukHeritageCoastForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukHeritageCoast extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-heritage-coast'

  constructor(dbClient: Client) {
    super(dbClient, 'heritage-coast')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukHeritageCoastLatestImport(this.dbClient)
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
    // Optional documentation URL
    const documentationUrl = feature.properties?.['documentation-url'] || null
    const existingFeature = await getExtDatagovukHeritageCoastForReference(
      this.dbClient,
      { reference }
    )
    const geometry = JSON.stringify(feature.geometry)
    if (!existingFeature) {
      await newExtDatagovukHeritageCoastFromWGS84(this.dbClient, {
        geometry,
        reference,
        name,
        documentationUrl
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukHeritageCoastForReference(this.dbClient, {
        reference,
        geometry,
        name: name !== existingFeature.name ? name : null,
        documentationUrl:
          documentationUrl !== existingFeature.documentationUrl
            ? documentationUrl
            : null
      })
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    console.info('Truncating heritage coast data')
    try {
      await deleteAllExtDatagovukHeritageCoasts(this.dbClient)
      console.info('Truncated heritage coast data')
    } catch (error) {
      throw new Error(
        `Error deleting heritage coast: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
