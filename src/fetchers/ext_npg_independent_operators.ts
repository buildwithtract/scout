import {
  deleteAllExtNpgIndependentOperators,
  insertExtNpgIndependentOperator
} from '@/db/generated/ext_npg_independent_operators_sql'
import { Feature, Polygon } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtNpgIndependentOperators extends OpendatasoftFetcher<any> {
  name = 'ext-npg-independent-operators'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'northernpowergrid.opendatasoft.com',
      process.env.DNOS_NPG_API_KEY || '',
      'idno_regions'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    // Accept Polygon or MultiPolygon, convert MultiPolygon to Polygon if needed
    let geometry: Polygon
    if (feature.geometry?.type === 'Polygon') {
      geometry = feature.geometry as Polygon
    } else if (feature.geometry?.type === 'MultiPolygon') {
      const multiPoly = feature.geometry.coordinates
      if (multiPoly.length > 0) {
        geometry = {
          type: 'Polygon',
          coordinates: multiPoly[0]
        }
      } else {
        throw new Error('MultiPolygon geometry has no coordinates')
      }
    } else {
      throw new Error(`Invalid geometry type: ${feature.geometry?.type}`)
    }
    const companyName = feature.properties?.companyname
    if (!companyName) {
      throw new Error('Missing companyname property in feature')
    }
    const geojsonString = JSON.stringify(geometry)
    await insertExtNpgIndependentOperator(this.dbClient, {
      geometry: geojsonString,
      name: companyName
    })
    // Since we're using insert (not upsert), all records are considered insertions
    return 'inserted'
  }

  async truncate(): Promise<void> {
    console.info('Truncating NPG Independent Operators data')
    await deleteAllExtNpgIndependentOperators(this.dbClient)
  }
}
