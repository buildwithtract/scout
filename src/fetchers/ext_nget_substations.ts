import {
  deleteAllExtNgetSubstations,
  deleteMissingExtNgetSubstationsForReference,
  getLatestImportForExtNgetSubstations,
  upsertExtNgetSubstation
} from '@/db/generated/ext_nget_substations_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { NgetFetcher } from './ext_nget'

interface NgetFeature extends Feature {
  properties: {
    [key: string]: any
  }
}

export class ExtNgetSubstations extends NgetFetcher<any, any, NgetFeature> {
  name = 'ext-nget-substations'
  static datasetID = '81216'
  static expectedShapefileName = 'Substations.shp'

  constructor(dbClient: Client, options?: { withDelete?: boolean }) {
    super(dbClient, options)
  }

  async getLatestImport(): Promise<Date> {
    const latestImport = await getLatestImportForExtNgetSubstations(
      this.dbClient
    )
    return latestImport?.max ? new Date(latestImport.max) : new Date(0)
  }

  async insertFeature(feature: NgetFeature): Promise<{
    operation: 'inserted' | 'updated' | 'skipped'
    reference: string
  }> {
    try {
      console.log('Available properties:', Object.keys(feature.properties))

      const reference = this.findPropertyValue(feature, [
        'SUBSTATION',
        'Substation',
        'GDO_GID'
      ])
      // Use the same value for name since SUBSTATION appears to contain the name
      const name = reference
      const voltage =
        this.getNullableGeoJSONPropertyInt(feature, 'OPERATING_') || 0
      const status = this.findPropertyValue(feature, ['STATUS', 'OPERATING_'])

      // Create a GeoJSON with an explicit CRS for the database
      const modifiedGeojson = {
        type: feature.geometry.type,
        coordinates: (feature.geometry as any).coordinates,
        crs: {
          type: 'name',
          properties: {
            name: 'EPSG:27700'
          }
        }
      }

      const geojsonText = JSON.stringify(modifiedGeojson)

      const result = await upsertExtNgetSubstation(this.dbClient, {
        geometry: geojsonText,
        reference,
        name,
        status,
        voltage: voltage ? voltage * 1000 : null // Convert kV to V
      })

      return {
        operation: result?.operation === 'INSERT' ? 'inserted' : 'updated',
        reference
      }
    } catch (error) {
      console.error('Error processing substation feature:', error)
      return { operation: 'skipped', reference: '' }
    }
  }

  async deleteMissingForReferences(references: string[]): Promise<number> {
    const result = await deleteMissingExtNgetSubstationsForReference(
      this.dbClient,
      { references }
    )
    return Number(result?.count || 0)
  }

  async truncate(): Promise<void> {
    console.info('Truncating National Grid substations data')
    await deleteAllExtNgetSubstations(this.dbClient)
    console.info('Truncated National Grid substations data')
  }

  // Helper methods for extracting properties from GeoJSON features
  private getGeoJSONPropertyString(
    feature: NgetFeature,
    propertyName: string
  ): string {
    const value = feature.properties[propertyName]
    if (value === undefined || value === null) {
      throw new Error(`Property ${propertyName} not found in GeoJSON feature`)
    }
    return value.toString()
  }

  private getNullableGeoJSONPropertyString(
    feature: NgetFeature,
    propertyName: string
  ): string | null {
    const value = feature.properties[propertyName]
    if (value === undefined || value === null) {
      return null
    }
    return value.toString()
  }

  private getNullableGeoJSONPropertyInt(
    feature: NgetFeature,
    propertyName: string
  ): number | null {
    const value = feature.properties[propertyName]
    if (value === undefined || value === null) {
      return null
    }
    const intValue = parseInt(value.toString(), 10)
    if (isNaN(intValue)) {
      return null
    }
    return intValue
  }

  // Helper method to find property value from multiple possible names
  private findPropertyValue(
    feature: NgetFeature,
    possibleNames: string[]
  ): string {
    for (const name of possibleNames) {
      const value = feature.properties[name]
      if (value !== undefined && value !== null) {
        return value.toString()
      }
    }
    throw new Error(
      `None of the properties ${possibleNames.join(', ')} found in GeoJSON feature`
    )
  }
}
