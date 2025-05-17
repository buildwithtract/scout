import {
  deleteAllExtNpgHighVoltageOverheadLines,
  upsertExtNpgHighVoltageOverheadLine
} from '@/db/generated/ext_npg_high_voltage_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtNpgHighVoltageOverheadLines extends OpendatasoftFetcher<any> {
  name = 'ext-npg-high-voltage-overhead-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'northernpowergrid.opendatasoft.com',
      process.env.DNOS_NPG_API_KEY || '',
      'npg_hv_oh_feeders'
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
    const situationRaw = feature.properties?.line_situation_actual
    if (situationRaw === 'OVERHEAD') {
      situation = 'Overhead'
    } else if (situationRaw === 'UNDERGROUND') {
      situation = 'Underground'
    }

    // Voltage extraction (already a number in the record, but may be string)
    let voltage: number | null = null
    const voltageRaw = feature.properties?.operating_voltage
    if (typeof voltageRaw === 'number') {
      voltage = voltageRaw
    } else if (typeof voltageRaw === 'string') {
      const parsed = parseInt(voltageRaw, 10)
      if (!isNaN(parsed)) {
        voltage = parsed
      }
    }

    const geojsonString = JSON.stringify(feature.geometry)
    const result = await upsertExtNpgHighVoltageOverheadLine(this.dbClient, {
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
    console.info('Truncating NPG High Voltage Overhead Lines data')
    await deleteAllExtNpgHighVoltageOverheadLines(this.dbClient)
  }
}
