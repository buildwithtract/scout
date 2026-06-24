import { Feature } from 'geojson'
import { Client } from 'pg'
import { BaseFetcher } from './fetcher'

export interface OverpassFeature extends Feature {
  properties: {
    [key: string]: any
  }
}

export abstract class ExtOverpass extends BaseFetcher {
  protected abstract voltage: number
  protected abstract voltageTags: string[]

  constructor(dbClient: Client) {
    super(dbClient)
  }

  protected buildOverpassQuery(boundary: any): string {
    // Calculate bounding box from the MultiPolygon
    console.log(`Boundary type: ${boundary.type}`)

    let minLat = Infinity,
      maxLat = -Infinity,
      minLon = Infinity,
      maxLon = -Infinity

    // Handle MultiPolygon structure
    for (const polygon of boundary.coordinates) {
      for (const ring of polygon) {
        for (const coord of ring) {
          if (!Array.isArray(coord) || coord.length < 2) {
            console.warn(`Invalid coordinate:`, coord)
            continue
          }
          const lat = coord[1]
          const lon = coord[0]
          if (typeof lat !== 'number' || typeof lon !== 'number') {
            console.warn(`Invalid lat/lon:`, lat, lon)
            continue
          }
          minLat = Math.min(minLat, lat)
          maxLat = Math.max(maxLat, lat)
          minLon = Math.min(minLon, lon)
          maxLon = Math.max(maxLon, lon)
        }
      }
    }

    console.log(
      `Building query for bounding box: ${minLat},${minLon},${maxLat},${maxLon}`
    )

    // Build voltage-specific queries
    const voltageQueries = this.voltageTags.map(
      (tag) =>
        `way["power"="line"]["voltage"="${tag}"](${minLat},${minLon},${maxLat},${maxLon})`
    )

    return `[out:json][timeout:300];
(
  ${voltageQueries.join(';\n  ')};
);
out body;
>;
out skel qt;`
  }

  protected parseVoltage(voltageStr: string): number {
    if (!voltageStr) return this.voltage

    // Remove common suffixes and convert to number
    const cleanVoltage = voltageStr
      .replace(/[vV]/g, '')
      .replace(/[kK][vV]/g, '000')

    const voltage = parseInt(cleanVoltage)
    return isNaN(voltage) ? this.voltage : voltage
  }

  protected parseSituation(situationStr: string): string | null {
    if (!situationStr) return null

    // Map common situation values to our enum
    const situationMap: { [key: string]: string } = {
      proposed: 'proposed',
      planned: 'planned',
      construction: 'construction',
      operational: 'operational',
      abandoned: 'abandoned',
      demolished: 'demolished'
    }

    const normalized = situationStr.toLowerCase().trim()
    return situationMap[normalized] || null
  }

  protected async fetchFromOverpass(
    areaName: string,
    boundary: any
  ): Promise<any[]> {
    const overpassQuery = this.buildOverpassQuery(boundary)

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    })

    if (!response.ok) {
      throw new Error(
        `Overpass API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()

    if (!data.elements || data.elements.length === 0) {
      console.info(`No power lines found in ${areaName}`)
      return []
    }

    console.info(
      `Found ${data.elements.length} power line elements in ${areaName}`
    )

    return data.elements
  }

  protected async processOverpassElements(
    elements: any[],
    processFeature: (feature: OverpassFeature) => Promise<string>
  ): Promise<void> {
    // Process each way (power line)
    const ways = elements.filter((el: any) => el.type === 'way')
    const allElements = elements

    for (const way of ways) {
      // Get node coordinates for this way
      const nodeIds = way.nodes
      const nodes = allElements.filter(
        (el) => el.type === 'node' && nodeIds.includes(el.id)
      )

      if (nodes.length < 2) {
        console.warn(`Way ${way.id} has insufficient nodes`)
        continue
      }

      // Create LineString geometry
      const coordinates = nodes.map((node: any) => [node.lon, node.lat])

      const feature: OverpassFeature = {
        type: 'Feature',
        properties: {
          id: way.id,
          voltage: this.parseVoltage(way.tags?.voltage),
          situation: this.parseSituation(way.tags?.situation)
        },
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }

      await processFeature(feature)
    }
  }

  protected validateGeometry(feature: OverpassFeature): boolean {
    if (
      !feature.geometry ||
      (feature.geometry.type !== 'LineString' &&
        feature.geometry.type !== 'MultiLineString')
    ) {
      console.warn('Invalid geometry type for power line')
      return false
    }
    return true
  }

  protected addSridToGeometry(geometry: any): any {
    return {
      ...geometry,
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326'
        }
      }
    }
  }
}
