import {
  deleteAllExtNpgExtraHighVoltageLines,
  upsertExtNpgExtraHighVoltageLine
} from '@/db/generated/ext_npg_extra_high_voltage_lines_sql'
import { Feature, MultiLineString } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtNpgExtraHighVoltageLines extends OpendatasoftFetcher<any> {
  name = 'ext-npg-extra-high-voltage-lines'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'northernpowergrid.opendatasoft.com',
      process.env.DNOS_NPG_API_KEY || '',
      'npg-ehv-feeders'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    // Accept both LineString and MultiLineString, convert to MultiLineString
    let multiLineString: MultiLineString
    if (feature.geometry?.type === 'LineString') {
      multiLineString = {
        type: 'MultiLineString',
        coordinates: [feature.geometry.coordinates]
      }
    } else if (feature.geometry?.type === 'MultiLineString') {
      multiLineString = feature.geometry as MultiLineString
    } else {
      throw new Error(`Invalid geometry type: ${feature.geometry?.type}`)
    }

    // Situation extraction
    let situation: string | null = null
    const situationRaw = feature.properties?.situation
    if (situationRaw === 'OVERHEAD') {
      situation = 'Overhead'
    } else if (situationRaw === 'UNDERGROUND') {
      situation = 'Underground'
    }

    // Voltage extraction
    let voltage: number | null = null
    const voltageRaw = feature.properties?.voltage
    if (voltageRaw) {
      const voltageMatch = String(voltageRaw).match(/(\d+)kV/)
      if (voltageMatch && voltageMatch[1]) {
        voltage = parseInt(voltageMatch[1], 10) * 1000
      } else {
        const numericVoltage = parseInt(voltageRaw, 10)
        if (!isNaN(numericVoltage)) {
          voltage = numericVoltage
        }
      }
    }

    const geojsonString = JSON.stringify(multiLineString)
    const result = await upsertExtNpgExtraHighVoltageLine(this.dbClient, {
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
    console.info('Truncating NPG Extra High Voltage Lines data')
    await deleteAllExtNpgExtraHighVoltageLines(this.dbClient)
  }
}
