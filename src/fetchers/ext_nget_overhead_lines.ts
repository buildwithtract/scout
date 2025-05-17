import {
  deleteAllExtNgetOverheadLines,
  deleteMissingExtNgetOverheadLinesForReference,
  getLatestImportForExtNgetOverheadLines,
  upsertExtNgetOverheadLine
} from '@/db/generated/ext_nget_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { NgetFetcher } from './ext_nget'

interface NgetFeature extends Feature {
  properties: {
    [key: string]: any
  }
}

export class ExtNgetOverheadLines extends NgetFetcher<any, any, NgetFeature> {
  name = 'ext-nget-overhead-lines'
  static datasetID = '81201'
  static expectedShapefileName = 'OHL.shp'

  constructor(dbClient: Client, options?: { withDelete?: boolean }) {
    super(dbClient, options)
  }

  async getLatestImport(): Promise<Date> {
    const latestImport = await getLatestImportForExtNgetOverheadLines(
      this.dbClient
    )
    return latestImport?.max ? new Date(latestImport.max) : new Date(0)
  }

  async insertFeature(feature: NgetFeature): Promise<{
    operation: 'inserted' | 'updated' | 'skipped'
    reference: string
  }> {
    try {
      const reference = this.findPropertyValue(feature, [
        'GDO_GID',
        'gdo_gid',
        'gdogid',
        'gid'
      ])
      if (!reference) {
        console.warn('Could not find reference property, skipping feature')
        return { operation: 'skipped', reference: '' }
      }

      // Validate geometry type
      if (!feature.geometry) {
        console.warn('Missing geometry')
        return { operation: 'skipped', reference: reference.toString() }
      }

      let coordinates: number[][] = []

      if (feature.geometry.type === 'LineString') {
        coordinates = this.force2DCoordinates(feature.geometry.coordinates)
      } else if (feature.geometry.type === 'MultiLineString') {
        // For MultiLineString, concatenate all line segments
        coordinates = feature.geometry.coordinates
          .flatMap((line) => this.force2DCoordinates(line))
          .filter((coord) => coord.length === 2)
      } else if (
        feature.geometry.type === 'GeometryCollection' &&
        feature.geometry.geometries
      ) {
        // For GeometryCollection, extract and concatenate all LineString and MultiLineString coordinates
        coordinates = feature.geometry.geometries
          .filter(
            (geom) =>
              geom.type === 'LineString' || geom.type === 'MultiLineString'
          )
          .flatMap((geom) => {
            if (geom.type === 'LineString') {
              return this.force2DCoordinates(geom.coordinates)
            } else if (geom.type === 'MultiLineString') {
              return geom.coordinates.flatMap((line) =>
                this.force2DCoordinates(line)
              )
            }
            return []
          })
          .filter((coord) => coord.length === 2)
      } else {
        console.warn(`Unsupported geometry type: ${feature.geometry.type}`)
        return { operation: 'skipped', reference: reference.toString() }
      }

      if (coordinates.length < 2) {
        console.warn('Invalid coordinates after processing')
        return { operation: 'skipped', reference: reference.toString() }
      }

      const status = this.findPropertyValue(feature, [
        'STATUS',
        'status',
        'Status'
      ])
      const circuitOne = this.findPropertyValue(feature, [
        'CIRCUIT1',
        'circuit1',
        'Circuit1'
      ])
      const circuitTwo = this.findPropertyValue(feature, [
        'CIRCUIT2',
        'circuit2',
        'Circuit2'
      ])
      const voltage = this.findPropertyValue(feature, [
        'OPERATING_',
        'operating_',
        'voltage',
        'VOLTAGE'
      ])

      if (!status || !voltage) {
        console.warn(
          'Missing required properties status or voltage, skipping feature'
        )
        return { operation: 'skipped', reference: reference.toString() }
      }

      // Create a PostGIS-compatible geometry object
      const postgisGeometry = {
        type: 'LineString',
        coordinates: coordinates,
        crs: {
          type: 'name',
          properties: {
            name: 'EPSG:4326'
          }
        }
      }

      const result = await upsertExtNgetOverheadLine(this.dbClient, {
        geometry: JSON.stringify(postgisGeometry),
        reference: reference.toString(),
        status: status.toString(),
        voltage: parseInt(voltage.toString(), 10) * 1000,
        situation: 'Overhead',
        circuitOne: circuitOne?.toString() || null,
        circuitTwo: circuitTwo?.toString() || null,
        firstImportedAt: new Date().toISOString()
      })

      return {
        operation: result ? 'updated' : 'inserted',
        reference: reference.toString()
      }
    } catch (err) {
      console.error('Error processing feature:', err)
      return { operation: 'skipped', reference: '' }
    }
  }

  async deleteMissingForReferences(references: string[]): Promise<number> {
    const result = await deleteMissingExtNgetOverheadLinesForReference(
      this.dbClient,
      { references }
    )
    return parseInt(result?.count || '0', 10)
  }

  async truncate(): Promise<void> {
    console.info('Truncating National Grid overhead lines data')
    await deleteAllExtNgetOverheadLines(this.dbClient)
    console.info('Truncated National Grid overhead lines data')
  }

  // Helper method to find a property value using multiple possible names
  private findPropertyValue(
    feature: NgetFeature,
    possibleNames: string[]
  ): string | number | null {
    for (const name of possibleNames) {
      const value = feature.properties[name]
      if (value !== undefined && value !== null) {
        return value
      }
    }
    return null
  }

  // Helper method to force coordinates to 2D
  private force2DCoordinates(coordinates: any[]): any[] {
    if (!Array.isArray(coordinates)) {
      console.warn('Invalid coordinates: not an array')
      return []
    }

    // If it's a single coordinate pair
    if (typeof coordinates[0] === 'number') {
      if (coordinates.length < 2) {
        console.warn('Invalid coordinates: not enough dimensions')
        return []
      }
      // Ensure both values are numbers and finite
      if (!isFinite(coordinates[0]) || !isFinite(coordinates[1])) {
        console.warn('Invalid coordinates: non-finite numbers')
        return []
      }
      return coordinates.slice(0, 2)
    }

    // For LineString, we expect an array of coordinate pairs
    const processed = coordinates
      .map((coord) => {
        if (!Array.isArray(coord) || coord.length < 2) {
          console.warn('Invalid coordinate pair in LineString:', coord)
          return null
        }
        return this.force2DCoordinates(coord)
      })
      .filter((coord) => coord !== null && coord.length === 2)

    if (processed.length < 2) {
      console.warn('Invalid LineString: needs at least 2 valid coordinates')
      return []
    }

    return processed
  }
}
