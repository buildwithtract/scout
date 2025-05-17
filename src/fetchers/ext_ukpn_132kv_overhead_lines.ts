import {
  deleteAllExtUkpn132kvOverheadLines,
  upsertExtUkpn132kvOverheadLine
} from '@/db/generated/ext_ukpn_132kv_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtUkpn132kvOverheadLines extends OpendatasoftFetcher<any> {
  name = 'ext-ukpn-132kv-overhead-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'ukpowernetworks.opendatasoft.com',
      process.env.DNOS_UKPN_API_KEY || '',
      'ukpn-132kv-overhead-lines'
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
    // Voltage extraction from string (e.g. "132kV" -> 132000)
    let voltage: number | null = null
    const voltageRaw = feature.properties?.voltage
    if (voltageRaw) {
      const voltageMatch = String(voltageRaw).match(/(\d+)kV/)
      if (voltageMatch && voltageMatch[1]) {
        voltage = parseInt(voltageMatch[1], 10) * 1000
      }
    }
    const geojsonString = JSON.stringify(feature.geometry)
    const result = await upsertExtUkpn132kvOverheadLine(this.dbClient, {
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
    console.info('Truncating UKPN 132kV Overhead Lines data')
    await deleteAllExtUkpn132kvOverheadLines(this.dbClient)
  }
}
