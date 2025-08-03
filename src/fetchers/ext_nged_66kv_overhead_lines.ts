import {
  truncateExtNged66kvOverheadLines,
  upsertExtNged66kvOverheadLine
} from '@/db/generated/ext_nged_66kv_overhead_lines_sql'
import { Client } from 'pg'
import { ExtOverpass, OverpassFeature } from './ext_overpass'

export class ExtNged66kvOverheadLines extends ExtOverpass {
  name = 'ext-nged-66kv-overhead-lines'
  protected voltage = 66000
  protected voltageTags = ['66000', '66', '66kV', '66000V']

  constructor(dbClient: Client) {
    super(dbClient)
  }

  async shouldGet(): Promise<boolean> {
    // Always fetch for now - could add date checking later
    return true
  }

  async fetch(): Promise<void> {
    console.info('Fetching NGED 66kV overhead lines from OpenStreetMap')

    // Get all NGED (formerly WPD) boundaries from the database
    const boundaryQuery = `
      SELECT name, ST_AsGeoJSON(geometry) as geojson 
      FROM ext_npg_dnos 
      WHERE name LIKE '%WPD%'
    `
    const boundaryResult = await this.dbClient.query(boundaryQuery)

    if (boundaryResult.rows.length === 0) {
      console.warn('No NGED boundaries found in database')
      return
    }

    console.info(`Found ${boundaryResult.rows.length} NGED areas to process`)

    // Process each boundary area
    for (const row of boundaryResult.rows) {
      const areaName = row.name
      const boundary = JSON.parse(row.geojson)

      console.info(`Processing area: ${areaName}`)

      try {
        const elements = await this.fetchFromOverpass(areaName, boundary)

        if (elements.length > 0) {
          await this.processOverpassElements(
            elements,
            this.processFeature.bind(this)
          )
        }

        console.info(`Finished processing ${areaName}`)
      } catch (error) {
        console.error(
          `Error fetching from OpenStreetMap for ${areaName}:`,
          error
        )
        // Continue with other areas even if one fails
      }
    }
  }

  private async processFeature(feature: OverpassFeature): Promise<string> {
    try {
      // Validate geometry
      if (!this.validateGeometry(feature)) {
        return 'updated'
      }

      const voltage = feature.properties.voltage || this.voltage
      const situation = feature.properties.situation || null

      // Add SRID to the geometry
      const geometryWithSrid = this.addSridToGeometry(feature.geometry)
      const geojsonString = JSON.stringify(geometryWithSrid)

      const result = await upsertExtNged66kvOverheadLine(this.dbClient, {
        voltage: voltage,
        situation: situation,
        geometry: geojsonString
      })

      // Since upsert always returns a row, we can't determine if it was inserted or updated
      // For now, assume it was updated
      return 'updated'
    } catch (error) {
      console.error('Error processing feature:', error)
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    await truncateExtNged66kvOverheadLines(this.dbClient)
  }
}
