import {
  deleteAllExtEnw6Point6kvOverheadLines,
  getLatestImportForExtEnw6Point6kvOverheadLines,
  upsertExtEnw6Point6kvOverheadLine
} from '@/db/generated/ext_enw_6_6kv_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtEnw6Point6kvOverheadLines extends OpendatasoftFetcher<any> {
  name = 'ext-enw-6-6kv-overhead-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'electricitynorthwest.opendatasoft.com',
      process.env.DNOS_ENW_API_KEY || '',
      'enwl-6-6kv-overhead-conductors'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    const row = await getLatestImportForExtEnw6Point6kvOverheadLines(
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
    if (cableClass === 'HV Overhead') {
      situation = 'Overhead'
    }
    let voltage: number | null = null
    const voltageRaw = feature.properties?.voltage
    if (voltageRaw) {
      const valStr = String(voltageRaw).replace('kV', '')
      const floatVoltage = parseFloat(valStr)
      if (!isNaN(floatVoltage)) {
        voltage = Math.round(floatVoltage * 1000)
      }
    }
    const geojsonString = JSON.stringify(feature.geometry)
    const result = await upsertExtEnw6Point6kvOverheadLine(this.dbClient, {
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
    console.info('Truncating ENW 6.6kV overhead lines data')
    await deleteAllExtEnw6Point6kvOverheadLines(this.dbClient)
  }
}
