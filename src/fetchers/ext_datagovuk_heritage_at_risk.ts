import {
  deleteAllExtDatagovukHeritageAtRisks,
  getExtDatagovukHeritageAtRiskForReference,
  getExtDatagovukHeritageAtRiskLatestImport,
  newExtDatagovukHeritageAtRiskFromWGS84,
  partialUpdateExtDatagovukHeritageAtRiskForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukHeritageAtRisk extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-heritage-at-risk'

  constructor(dbClient: Client) {
    super(dbClient, 'heritage-at-risk')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukHeritageAtRiskLatestImport(
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
    // Optional documentation URL
    const documentationUrl = feature.properties?.['documentation-url'] || null
    const existingFeature = await getExtDatagovukHeritageAtRiskForReference(
      this.dbClient,
      { reference }
    )
    const geometry = JSON.stringify(feature.geometry)
    if (!existingFeature) {
      await newExtDatagovukHeritageAtRiskFromWGS84(this.dbClient, {
        geometry,
        reference,
        name,
        documentationUrl
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukHeritageAtRiskForReference(this.dbClient, {
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
    console.info('Truncating heritage at risk data')
    try {
      await deleteAllExtDatagovukHeritageAtRisks(this.dbClient)
      console.info('Truncated heritage at risk data')
    } catch (error) {
      throw new Error(
        `Error deleting heritage at risk: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
