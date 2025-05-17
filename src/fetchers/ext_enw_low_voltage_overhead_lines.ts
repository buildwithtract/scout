import {
  deleteAllExtEnwLowVoltageOverheadLines,
  getLatestImportForExtEnwLowVoltageOverheadLines,
  upsertExtEnwLowVoltageOverheadLine
} from '@/db/generated/ext_enw_low_voltage_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtEnwLowVoltageOverheadLines extends OpendatasoftFetcher<any> {
  name = 'ext-enw-low-voltage-overhead-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'electricitynorthwest.opendatasoft.com',
      process.env.DNOS_ENW_API_KEY || '',
      'enwl-lv-overhead-conductors'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    const row = await getLatestImportForExtEnwLowVoltageOverheadLines(
      this.dbClient
    )
    if (row?.max) {
      return new Date(row.max)
    }
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    if (!feature.geometry) {
      return 'updated'
    }
    let situation: string | null = null
    const cableClass = feature.properties?.cable_class
    if (cableClass && cableClass.includes('Overhead')) {
      situation = 'Overhead'
    }
    let voltage: number | null = null
    const voltageRaw = feature.properties?.voltage
    if (voltageRaw) {
      const voltageMatch = String(voltageRaw).match(/(\d+)V/)
      if (voltageMatch && voltageMatch[1]) {
        voltage = parseInt(voltageMatch[1], 10)
      }
    }
    const geojsonString = JSON.stringify(feature.geometry)
    const result = await upsertExtEnwLowVoltageOverheadLine(this.dbClient, {
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
    console.info('Truncating ENW low voltage overhead lines data')
    await deleteAllExtEnwLowVoltageOverheadLines(this.dbClient)
  }
}
