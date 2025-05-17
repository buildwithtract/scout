import {
  deleteAllExtDatagovukAncientWoodlands,
  getExtDatagovukAncientWoodlandForReference,
  getExtDatagovukAncientWoodlandLatestImport,
  insertExtDatagovukAncientWoodlandFromWGS84,
  partialUpdateExtDatagovukAncientWoodlandForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukAncientWoodland extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-ancient-woodland'

  constructor(dbClient: Client) {
    super(dbClient, 'ancient-woodland')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukAncientWoodlandLatestImport(
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
    const existingFeature = await getExtDatagovukAncientWoodlandForReference(
      this.dbClient,
      { reference }
    )
    if (!existingFeature) {
      await insertExtDatagovukAncientWoodlandFromWGS84(this.dbClient, {
        stGeomfromgeojson: JSON.stringify(feature.geometry),
        reference,
        name: feature.properties?.name
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukAncientWoodlandForReference(
        this.dbClient,
        {
          reference,
          geometry: JSON.stringify(feature.geometry),
          name:
            feature.properties?.name !== existingFeature.name
              ? feature.properties?.name
              : undefined
        }
      )
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    console.info('Truncating ancient woodland data')
    try {
      await deleteAllExtDatagovukAncientWoodlands(this.dbClient)
      console.info('Truncated ancient woodland data')
    } catch (error) {
      throw new Error(
        `Error deleting ancient woodlands: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
