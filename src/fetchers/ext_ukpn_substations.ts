import {
  deleteAllExtUkpnSubstations,
  upsertExtUkpnSubstation
} from '@/db/generated/ext_ukpn_substations_sql'
import { Feature, Point } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtUkpnSubstations extends OpendatasoftFetcher<any> {
  name = 'ext-ukpn-substations'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'ukpowernetworks.opendatasoft.com',
      process.env.DNOS_UKPN_API_KEY || '',
      'ukpn-secondary-sites'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    // Accept only Point geometry
    if (feature.geometry?.type !== 'Point') {
      console.warn(
        `Skipping feature with unsupported geometry type: ${feature.geometry?.type}`
      )
      return 'updated'
    }
    const coordinates = (feature.geometry as Point).coordinates
    const name = feature.properties?.functionallocation
    const number = feature.properties?.substationalias
    const rawVoltage = feature.properties?.substationvoltage
    let voltage: number | null = null
    if (typeof rawVoltage === 'number') {
      voltage = Math.round(rawVoltage * 1000)
    } else if (typeof rawVoltage === 'string') {
      const floatVal = parseFloat(rawVoltage)
      if (!isNaN(floatVal)) {
        voltage = Math.round(floatVal * 1000)
      } else {
        voltage = null
      }
    } else {
      voltage = null
    }
    if (!name) {
      console.warn('Skipping feature missing functionallocation property')
      return 'updated'
    }
    const geojsonPoint = {
      type: 'Point',
      coordinates: coordinates
    }
    const geojsonString = JSON.stringify(geojsonPoint)
    const result = await upsertExtUkpnSubstation(this.dbClient, {
      geometry: geojsonString,
      name: name,
      number: number ?? null,
      voltage: voltage
    })
    if (result?.operation === 'inserted') {
      return 'inserted'
    }
    return 'updated'
  }

  async truncate(): Promise<void> {
    console.info('Truncating UKPN Substations data')
    await deleteAllExtUkpnSubstations(this.dbClient)
  }
}
