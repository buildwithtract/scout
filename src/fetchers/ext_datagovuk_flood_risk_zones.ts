import {
  deleteAllExtDatagovukFloodRiskZones,
  getExtDatagovukFloodRiskZoneForReference,
  getExtDatagovukFloodRiskZoneLatestImport,
  newExtDatagovukFloodRiskZoneFromWGS84,
  partialUpdateExtDatagovukFloodRiskZoneForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukFloodRiskZones extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-flood-risk-zones'

  constructor(dbClient: Client) {
    super(dbClient, 'flood-risk-zone')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukFloodRiskZoneLatestImport(this.dbClient)
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
    const riskLevel = feature.properties?.['flood-risk-level']
    if (!riskLevel) {
      console.warn('Feature missing flood-risk-level property, skipping')
      return 'updated'
    }
    const riskType = feature.properties?.['flood-risk-type']
    if (!riskType) {
      console.warn('Feature missing flood-risk-type property, skipping')
      return 'updated'
    }
    const existingFeature = await getExtDatagovukFloodRiskZoneForReference(
      this.dbClient,
      { reference }
    )
    let geometry: string
    try {
      geometry = JSON.stringify(feature.geometry)
    } catch (e) {
      console.error('Failed to stringify geometry:', feature.geometry)
      throw e
    }
    if (!existingFeature) {
      await newExtDatagovukFloodRiskZoneFromWGS84(this.dbClient, {
        geometry,
        reference,
        zone: riskLevel,
        type: riskType
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukFloodRiskZoneForReference(this.dbClient, {
        reference,
        geometry,
        zone: riskLevel !== existingFeature.zone ? riskLevel : null,
        type: riskType !== existingFeature.type ? riskType : null
      })
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    console.info('Truncating flood risk data')
    try {
      await deleteAllExtDatagovukFloodRiskZones(this.dbClient)
      console.info('Truncated flood risk data')
    } catch (error) {
      throw new Error(
        `Error deleting flood risk zones: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
