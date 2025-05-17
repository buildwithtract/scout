import {
  deleteAllExtUkpnIndependentOperators,
  insertExtUkpnIndependentOperator
} from '@/db/generated/ext_ukpn_independent_operators_sql'
import { Feature, MultiPolygon, Polygon } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtUkpnIndependentOperators extends OpendatasoftFetcher<any> {
  name = 'ext-ukpn-independent-operators'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'ukpowernetworks.opendatasoft.com',
      process.env.DNOS_UKPN_API_KEY || '',
      'ukpn-idno-areas'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    // Accept Polygon or MultiPolygon, skip others
    if (!feature.geometry) {
      return 'updated'
    }
    let geometry: Polygon | MultiPolygon
    if (feature.geometry.type === 'Polygon') {
      geometry = feature.geometry as Polygon
    } else if (feature.geometry.type === 'MultiPolygon') {
      geometry = feature.geometry as MultiPolygon
    } else {
      return 'updated'
    }
    const geojsonString = JSON.stringify(geometry)
    await insertExtUkpnIndependentOperator(this.dbClient, {
      geometry: geojsonString
    })
    // Since we're using insert (not upsert), all records are considered insertions
    return 'inserted'
  }

  async truncate(): Promise<void> {
    console.info('Truncating UKPN Independent Operators data')
    await deleteAllExtUkpnIndependentOperators(this.dbClient)
  }
}
