import {
  deleteAllExtEnw11kvOverheadLines,
  getLatestImportForExtEnw11kvOverheadLines,
  upsertExtEnw11kvOverheadLine
} from '@/db/generated/ext_enw_11kv_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtEnw11kvOverheadLines extends OpendatasoftFetcher<any> {
  name = 'ext-enw-11kv-overhead-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'electricitynorthwest.opendatasoft.com',
      process.env.DNOS_ENW_API_KEY || '',
      'enwl-11kv-overhead-conductors'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    const row = await getLatestImportForExtEnw11kvOverheadLines(this.dbClient)
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
      const voltageMatch = String(voltageRaw).match(/(\d+)kV/)
      if (voltageMatch && voltageMatch[1]) {
        voltage = parseInt(voltageMatch[1], 10) * 1000
      }
    }
    const geojsonString = JSON.stringify(feature.geometry)
    const result = await upsertExtEnw11kvOverheadLine(this.dbClient, {
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
    console.info('Truncating ENW 11kV overhead lines data')
    await deleteAllExtEnw11kvOverheadLines(this.dbClient)
  }
}
