import {
  deleteAllExtDatagovukWorldHeritageSites,
  getExtDatagovukWorldHeritageSiteBufferZoneForReference,
  getExtDatagovukWorldHeritageSiteForReference,
  getExtDatagovukWorldHeritageSiteLatestImport,
  newExtDatagovukWorldHeritageSiteBufferZoneFromWGS84,
  newExtDatagovukWorldHeritageSiteFromWGS84,
  partialUpdateExtDatagovukWorldHeritageSiteBufferZoneForReference,
  partialUpdateExtDatagovukWorldHeritageSiteForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukWorldHeritageSites extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-world-heritage-sites'

  constructor(dbClient: Client) {
    super(dbClient, 'world-heritage-site')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukWorldHeritageSiteLatestImport(
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
    const entryDateStr = feature.properties?.['entry-date']
    if (!entryDateStr) {
      console.warn('Feature missing entry-date property, skipping')
      return 'updated'
    }
    const entryDate = new Date(entryDateStr)
    if (isNaN(entryDate.getTime())) {
      console.warn(`Invalid entry-date: ${entryDateStr}, skipping`)
      return 'updated'
    }
    const startDateStr = feature.properties?.['start-date']
    let startDate: Date | null = null
    if (startDateStr) {
      startDate = new Date(startDateStr)
      if (isNaN(startDate.getTime())) {
        startDate = null
      }
    }
    const endDateStr = feature.properties?.['end-date']
    let endDate: Date | null = null
    if (endDateStr) {
      endDate = new Date(endDateStr)
      if (isNaN(endDate.getTime())) {
        endDate = null
      }
    }
    const entity = feature.properties?.entity || ''
    const documentationUrl = feature.properties?.['documentation-url'] || ''
    const notes = feature.properties?.notes || null
    const existingFeature = await getExtDatagovukWorldHeritageSiteForReference(
      this.dbClient,
      { reference }
    )
    if (!existingFeature) {
      await newExtDatagovukWorldHeritageSiteFromWGS84(this.dbClient, {
        geometry: JSON.stringify(feature.geometry),
        reference,
        name,
        entryDate,
        startDate,
        endDate,
        entity,
        notes,
        documentationUrl
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukWorldHeritageSiteForReference(
        this.dbClient,
        {
          reference,
          geometry: JSON.stringify(feature.geometry),
          name: name !== existingFeature.name ? name : null,
          entryDate,
          startDate,
          endDate,
          entity,
          notes,
          documentationUrl
        }
      )
      return 'updated'
    }
  }

  async insertBufferZoneFeature(
    feature: GeoJSON.Feature
  ): Promise<'inserted' | 'updated'> {
    const reference = feature.properties?.reference
    if (!reference) {
      console.warn('Buffer zone feature missing reference property, skipping')
      return 'updated'
    }
    const name = feature.properties?.name
    if (!name) {
      console.warn('Buffer zone feature missing name property, skipping')
      return 'updated'
    }
    const entryDateStr = feature.properties?.['entry-date']
    if (!entryDateStr) {
      console.warn('Buffer zone feature missing entry-date property, skipping')
      return 'updated'
    }
    const entryDate = new Date(entryDateStr)
    if (isNaN(entryDate.getTime())) {
      console.warn(`Invalid buffer zone entry-date: ${entryDateStr}, skipping`)
      return 'updated'
    }
    const startDateStr = feature.properties?.['start-date']
    let startDate: Date | null = null
    if (startDateStr) {
      startDate = new Date(startDateStr)
      if (isNaN(startDate.getTime())) {
        startDate = null
      }
    }
    const endDateStr = feature.properties?.['end-date']
    let endDate: Date | null = null
    if (endDateStr) {
      endDate = new Date(endDateStr)
      if (isNaN(endDate.getTime())) {
        endDate = null
      }
    }
    const worldHeritageSiteReference =
      feature.properties?.['world-heritage-site']
    if (!worldHeritageSiteReference) {
      console.warn(
        'Buffer zone feature missing world-heritage-site reference, skipping'
      )
      return 'updated'
    }
    const worldHeritageSite =
      await getExtDatagovukWorldHeritageSiteForReference(this.dbClient, {
        reference: worldHeritageSiteReference
      })
    if (!worldHeritageSite) {
      console.warn(
        `Could not find world heritage site with reference ${worldHeritageSiteReference}, skipping buffer zone`
      )
      return 'updated'
    }
    const existingBufferZone =
      await getExtDatagovukWorldHeritageSiteBufferZoneForReference(
        this.dbClient,
        { reference }
      )
    if (!existingBufferZone) {
      await newExtDatagovukWorldHeritageSiteBufferZoneFromWGS84(this.dbClient, {
        geometry: JSON.stringify(feature.geometry),
        worldHeritageSiteUuid: worldHeritageSite.uuid,
        reference,
        name,
        entryDate,
        startDate,
        endDate
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukWorldHeritageSiteBufferZoneForReference(
        this.dbClient,
        {
          reference,
          geometry: JSON.stringify(feature.geometry),
          name: name !== existingBufferZone.name ? name : null,
          entryDate,
          startDate,
          endDate,
          worldHeritageSiteUuid: worldHeritageSite.uuid
        }
      )
      return 'updated'
    }
  }

  async fetchBufferZones(): Promise<void> {
    // This method can be called after the main fetch to process buffer zones
    const { streamGeoJSONFromURL } = await import('../lib/streamGeojson')
    const bufferZoneUrl =
      'https://files.planning.data.gov.uk/dataset/world-heritage-site-buffer-zone.geojson'
    const generator = await streamGeoJSONFromURL(bufferZoneUrl)
    for await (const feature of generator) {
      await this.insertBufferZoneFeature(feature)
    }
  }

  async truncate(): Promise<void> {
    console.info('Truncating world heritage site data')
    try {
      await deleteAllExtDatagovukWorldHeritageSites(this.dbClient)
      console.info('Truncated world heritage site data')
    } catch (error) {
      throw new Error(
        `Error deleting world heritage sites: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async fetchIfRequired(): Promise<void> {
    await super.fetchIfRequired()
    await this.fetchBufferZones()
  }
}
