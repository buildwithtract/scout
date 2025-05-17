import {
  deleteAllExtNgetTowers,
  deleteMissingExtNgetTowersForReference,
  getLatestImportForExtNgetTowers,
  upsertExtNgetTower
} from '@/db/generated/ext_nget_towers_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { NgetFetcher } from './ext_nget'

interface NgetFeature extends Feature {
  properties: {
    [key: string]: any
  }
}

export class ExtNgetTowers extends NgetFetcher<any, any, NgetFeature> {
  name = 'ext-nget-towers'
  static datasetID = '81211'
  static expectedShapefileName = 'Towers.shp'

  constructor(dbClient: Client, options?: { withDelete?: boolean }) {
    super(dbClient, options)
  }

  async getLatestImport(): Promise<Date> {
    const latestImport = await getLatestImportForExtNgetTowers(this.dbClient)
    return latestImport?.max ? new Date(latestImport.max) : new Date(0)
  }

  async insertFeature(feature: NgetFeature): Promise<{
    operation: 'inserted' | 'updated' | 'skipped'
    reference: string
  }> {
    try {
      const reference = this.getGeoJSONPropertyString(feature, 'TOWER_ASSE')
      const status = this.getGeoJSONPropertyString(feature, 'STATUS')
      const yearOfInstallation = this.getNullableGeoJSONPropertyInt(
        feature,
        'YEAR_OF_IN'
      )
      const height = this.getNullableGeoJSONPropertyFloat(feature, 'TOWER_HEIG')

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

      const result = await upsertExtNgetTower(this.dbClient, {
        geometry: geojsonText,
        reference,
        status,
        towerHeight: height?.toString(),
        yearInstalled: yearOfInstallation
      })

      return {
        operation: result?.operation === 'INSERT' ? 'inserted' : 'updated',
        reference
      }
    } catch (error) {
      console.error('Error processing tower feature:', error)
      return { operation: 'skipped', reference: '' }
    }
  }

  async deleteMissingForReferences(references: string[]): Promise<number> {
    const result = await deleteMissingExtNgetTowersForReference(this.dbClient, {
      reference: references
    })
    return Number(result?.count || 0)
  }

  async truncate(): Promise<void> {
    console.info('Truncating National Grid towers data')
    await deleteAllExtNgetTowers(this.dbClient)
    console.info('Truncated National Grid towers data')
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

  private getNullableGeoJSONPropertyFloat(
    feature: NgetFeature,
    propertyName: string
  ): number | null {
    const value = feature.properties[propertyName]
    if (value === undefined || value === null) {
      return null
    }
    const floatValue = parseFloat(value.toString())
    if (isNaN(floatValue)) {
      return null
    }
    return floatValue
  }
}
