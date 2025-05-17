import {
  deleteAllExtEnw132kvOverheadLines,
  getLatestImportForExtEnw132kvOverheadLines,
  upsertExtEnw132kvOverheadLine
} from '@/db/generated/ext_enw_132kv_overhead_lines_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtEnw132kvOverheadLines extends OpendatasoftFetcher<any> {
  name = 'ext-enw-132kv-overhead-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'electricitynorthwest.opendatasoft.com',
      process.env.DNOS_ENW_API_KEY || '',
      'enwl-132kv-overhead-conductors'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    const row = await getLatestImportForExtEnw132kvOverheadLines(this.dbClient)
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
    const result = await upsertExtEnw132kvOverheadLine(this.dbClient, {
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
    console.info('Truncating ENW 132kV overhead lines data')
    await deleteAllExtEnw132kvOverheadLines(this.dbClient)
  }
}
