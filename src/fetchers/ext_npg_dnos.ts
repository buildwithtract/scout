import {
  deleteAllExtNpgDnos,
  upsertExtNpgDno
} from '@/db/generated/ext_npg_dnos_sql'
import { Feature, MultiPolygon } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtNpgDnos extends OpendatasoftFetcher<any> {
  name = 'ext-npg-dnos'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'northernpowergrid.opendatasoft.com',
      process.env.DNOS_NPG_API_KEY || '',
      'all_dno_boundaries'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    // Check for MultiPolygon geometry
    if (feature.geometry?.type !== 'MultiPolygon') {
      throw new Error(`Invalid geometry type: ${feature.geometry?.type}`)
    }
    const longName = feature.properties?.longname
    if (!longName) {
      throw new Error('Missing longname property in feature')
    }
    const geojsonString = JSON.stringify(feature.geometry as MultiPolygon)
    const result = await upsertExtNpgDno(this.dbClient, {
      geometry: geojsonString,
      name: longName
    })
    if (result?.operation === 'inserted') {
      return 'inserted'
    }
    return 'updated'
  }

  async truncate(): Promise<void> {
    console.info('Truncating NPG DNOs data')
    await deleteAllExtNpgDnos(this.dbClient)
  }
}
