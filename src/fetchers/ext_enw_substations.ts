import {
  deleteAllExtEnwSubstations,
  getLatestImportForExtEnwSubstations,
  upsertExtEnwSubstation
} from '@/db/generated/ext_enw_substations_sql'
import { Feature, Point } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtEnwSubstations extends OpendatasoftFetcher<any> {
  name = 'ext-enw-substations'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'electricitynorthwest.opendatasoft.com',
      process.env.DNOS_ENW_API_KEY || '',
      'enwl-substation'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    const row = await getLatestImportForExtEnwSubstations(this.dbClient)
    if (row?.max) {
      return new Date(row.max)
    }
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    // Accept only Point geometry
    if (!feature.geometry || feature.geometry.type !== 'Point') {
      return 'updated'
    }
    const properties = feature.properties || {}
    const geometry = feature.geometry as Point
    const geojsonString = JSON.stringify(geometry)
    const result = await upsertExtEnwSubstation(this.dbClient, {
      geometry: geojsonString,
      name: properties.spn,
      number: properties.number,
      infeedVoltage: parseVoltage(properties.infeed_voltage),
      outfeedVoltage: parseVoltage(properties.outfeed_voltage)
    })
    if (result?.operation === 'inserted') {
      return 'inserted'
    }
    return 'updated'
  }

  async truncate(): Promise<void> {
    console.info('Truncating ENW substations data')
    await deleteAllExtEnwSubstations(this.dbClient)
  }
}

function parseVoltage(voltageStr: string): number | null {
  if (!voltageStr) {
    return null
  }
  voltageStr = voltageStr.trim().toUpperCase()
  const numericPart = voltageStr.replace(/KV$/, '')
  const voltage = parseFloat(numericPart)
  return isNaN(voltage) ? null : Math.round(voltage * 1000)
}
