import {
  deleteAllExtUkpn33kvOverheadLines,
  upsertExtUkpn33kvOverheadLine
} from '@/db/generated/ext_ukpn_33kv_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtUkpn33kvOverheadLines extends OpendatasoftFetcher<any> {
  name = 'ext-ukpn-33kv-overhead-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'ukpowernetworks.opendatasoft.com',
      process.env.DNOS_UKPN_API_KEY || '',
      'ukpn-33kv-overhead-lines'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    // Accept any geometry, but skip if missing
    if (!feature.geometry) {
      return 'updated'
    }
    // Situation extraction
    let situation: string | null = null
    const obClass = feature.properties?.ob_class
    if (obClass?.includes('Overhead Line')) {
      situation = 'Overhead'
    }
    // Voltage extraction from obClass (e.g. "EHV 33kV Overhead Line" -> 33000)
    let voltage: number | null = null
    if (obClass) {
      const voltageMatch = obClass.match(/(\d+)kV/)
      if (voltageMatch && voltageMatch[1]) {
        voltage = parseInt(voltageMatch[1], 10) * 1000
      }
    }
    const geojsonString = JSON.stringify(feature.geometry)
    const result = await upsertExtUkpn33kvOverheadLine(this.dbClient, {
      geometry: geojsonString,
      voltage: voltage,
      situation: situation
    })
    if (result?.operation === 'inserted') {
      return 'inserted'
    }
    return 'updated'
  }

  async truncate(): Promise<void> {
    console.info('Truncating UKPN 33kV Overhead Lines data')
    await deleteAllExtUkpn33kvOverheadLines(this.dbClient)
  }
}
