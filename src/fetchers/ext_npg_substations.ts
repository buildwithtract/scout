import {
  deleteAllExtNpgSubstations,
  upsertExtNpgSubstation
} from '@/db/generated/ext_npg_substations_sql'
import { Feature, Point } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtNpgSubstations extends OpendatasoftFetcher<any> {
  name = 'ext-npg-substations'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'northernpowergrid.opendatasoft.com',
      process.env.DNOS_NPG_API_KEY || '',
      'substation_sites_list'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  private processKvaRating(kvaRating: string): string | null {
    // Extract the numerical value from strings like "50 kVA"
    const match = kvaRating.match(/(\d+)\s*kVA/)
    if (match) {
      return match[1] // Return the number as a string
    }
    return null // Return null if we can't parse the value
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    // Accept only Point geometry
    if (feature.geometry?.type !== 'Point') {
      throw new Error(`Invalid geometry type: ${feature.geometry?.type}`)
    }
    const coordinates = (feature.geometry as Point).coordinates
    const siteName = feature.properties?.site_name
    const assetID = feature.properties?.asset_id
    const kvaRating = feature.properties?.kva_rating
    if (!siteName || !assetID) {
      throw new Error('Missing site_name or asset_id property in feature')
    }
    const geojsonPoint = {
      type: 'Point',
      coordinates: coordinates
    }
    const geojsonString = JSON.stringify(geojsonPoint)
    const kva = kvaRating ? this.processKvaRating(String(kvaRating)) : null
    const result = await upsertExtNpgSubstation(this.dbClient, {
      geometry: geojsonString,
      name: siteName,
      number: assetID,
      voltage: kva ? Number(kva) : null
    })
    if (result?.operation === 'inserted') {
      return 'inserted'
    }
    return 'updated'
  }

  async truncate(): Promise<void> {
    console.info('Truncating NPG Substations data')
    await deleteAllExtNpgSubstations(this.dbClient)
  }
}
