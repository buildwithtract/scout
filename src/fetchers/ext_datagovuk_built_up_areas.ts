import {
  deleteAllExtDatagovukBuiltUpAreas,
  getExtDatagovukBuiltUpAreaForReference,
  getExtDatagovukBuiltUpAreaLatestImport,
  newExtDatagovukBuiltUpAreaFromWGS84,
  partialUpdateExtDatagovukBuiltUpAreaForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukBuiltUpAreas extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-built-up-areas'

  constructor(dbClient: Client) {
    super(dbClient, 'built-up-area')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukBuiltUpAreaLatestImport(this.dbClient)
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
    const existingFeature = await getExtDatagovukBuiltUpAreaForReference(
      this.dbClient,
      { reference }
    )
    const geometry = JSON.stringify(feature.geometry)
    if (!existingFeature) {
      await newExtDatagovukBuiltUpAreaFromWGS84(this.dbClient, {
        geometry,
        reference,
        name
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukBuiltUpAreaForReference(this.dbClient, {
        reference,
        geometry,
        name: name !== existingFeature.name ? name : null
      })
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    console.info('Truncating built up area data')
    try {
      await deleteAllExtDatagovukBuiltUpAreas(this.dbClient)
      console.info('Truncated built up area data')
    } catch (error) {
      throw new Error(
        `Error deleting built up areas: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
