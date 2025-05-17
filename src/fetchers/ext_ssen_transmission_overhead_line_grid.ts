import {
  deleteAllExtSsenTransmissionOverheadLineGrid,
  upsertExtSsenTransmissionOverheadLineGrid
} from '@/db/generated/ext_ssen_transmission_overhead_line_grid_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtSsenTransmissionOverheadLineGrid extends OpendatasoftFetcher<any> {
  name = 'ext-ssen-transmission-overhead-line-grid'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'ssentransmission.opendatasoft.com',
      process.env.DNOS_SSEN_API_KEY || '',
      'overhead-line-grid'
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
    const voltageRaw = feature.properties?.voltage
    let voltage: number | null = null
    if (typeof voltageRaw === 'string') {
      const parsed = parseInt(voltageRaw, 10)
      if (!isNaN(parsed)) {
        voltage = parsed
      }
    } else if (typeof voltageRaw === 'number') {
      voltage = voltageRaw
    }
    const situation = 'Overhead'
    const geojsonString = JSON.stringify(feature.geometry)
    const result = await upsertExtSsenTransmissionOverheadLineGrid(
      this.dbClient,
      {
        geometry: geojsonString,
        voltage: voltage,
        situation: situation
      }
    )
    if (result?.operation === 'inserted') {
      return 'inserted'
    }
    return 'updated'
  }

  async truncate(): Promise<void> {
    console.info('Truncating SSEN Transmission Overhead Line Supergrid data')
    await deleteAllExtSsenTransmissionOverheadLineGrid(this.dbClient)
  }
}
