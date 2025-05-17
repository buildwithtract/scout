import {
  deleteAllExtNpgLowVoltageOverheadLines,
  upsertExtNpgLowVoltageOverheadLine
} from '@/db/generated/ext_npg_low_voltage_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtNpgLowVoltageOverheadLines extends OpendatasoftFetcher<any> {
  name = 'ext-npg-low-voltage-overhead-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'northernpowergrid.opendatasoft.com',
      process.env.DNOS_NPG_API_KEY || '',
      'lv_oh_feeders'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    // Accept any geometry, but skip if missing
    if (!feature.geometry) {
      throw new Error('Feature missing geometry')
    }

    // Situation extraction
    let situation: string | null = null
    const situationRaw = feature.properties?.line_situation
    if (situationRaw === 'OVERHEAD') {
      situation = 'Overhead'
    } else if (situationRaw === 'UNDERGROUND') {
      situation = 'Underground'
    }

    // Voltage extraction (string in the record)
    let voltage: number | null = null
    const voltageRaw = feature.properties?.voltage
    if (typeof voltageRaw === 'string') {
      const parsed = parseInt(voltageRaw, 10)
      if (!isNaN(parsed)) {
        voltage = parsed
      }
    }

    const geojsonString = JSON.stringify(feature.geometry)
    const result = await upsertExtNpgLowVoltageOverheadLine(this.dbClient, {
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
    console.info('Truncating NPG Low Voltage Overhead Lines data')
    await deleteAllExtNpgLowVoltageOverheadLines(this.dbClient)
  }
}
