import {
  deleteAllExtUkpnHighVoltageOverheadLines,
  upsertExtUkpnHighVoltageOverheadLine
} from '@/db/generated/ext_ukpn_high_voltage_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtUkpnHighVoltageOverheadLines extends OpendatasoftFetcher<any> {
  name = 'ext-ukpn-high-voltage-overhead-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'ukpowernetworks.opendatasoft.com',
      process.env.DNOS_UKPN_API_KEY || '',
      'ukpn-hv-overhead-lines-shapefile'
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
    if (obClass === 'HV Overhead Line') {
      situation = 'Overhead'
    }
    // Voltage extraction from betrSpann (e.g. "11kV" -> 11000)
    let voltage: number | null = null
    const betrSpann = feature.properties?.betr_spann
    if (betrSpann) {
      const valStr = String(betrSpann).replace('kV', '')
      const floatVoltage = parseFloat(valStr)
      if (!isNaN(floatVoltage)) {
        voltage = Math.round(floatVoltage) * 1000
      }
    }
    const geojsonString = JSON.stringify(feature.geometry)
    const result = await upsertExtUkpnHighVoltageOverheadLine(this.dbClient, {
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
    console.info('Truncating UKPN High Voltage Overhead Lines data')
    await deleteAllExtUkpnHighVoltageOverheadLines(this.dbClient)
  }
}
