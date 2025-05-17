import {
  deleteAllExtSsenSubstationsSupergrid,
  upsertExtSsenSubstationSupergrid
} from '@/db/generated/ext_ssen_transmission_substations_supergrid_sql'
import centroid from '@turf/centroid'
import { Feature, Point, Polygon } from 'geojson'
import { Client } from 'pg'
import { OpendatasoftFetcher } from './ext_opendatasoft'

export class ExtSsenTransmissionSubstationsSupergrid extends OpendatasoftFetcher<any> {
  name = 'ext-ssen-transmission-substations-supergrid'

  constructor(dbClient: Client) {
    super(
      dbClient,
      'ssentransmission.opendatasoft.com',
      process.env.DNOS_SSEN_API_KEY || '',
      'ssen-transmission-substation-site-supergrid'
    )
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    let coordinates: number[] | null = null
    if (feature.geometry?.type === 'Point') {
      coordinates = (feature.geometry as Point).coordinates
    } else if (feature.geometry?.type === 'Polygon') {
      // Use turf.centroid to get the centroid of the polygon
      const centroidFeature = centroid(feature as Feature<Polygon>)
      coordinates = centroidFeature.geometry.coordinates
    } else {
      console.warn(
        `Skipping feature with unsupported geometry type: ${feature.geometry?.type}`
      )
      return 'updated'
    }
    const name = feature.properties?.name
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
    const geojsonPoint = {
      type: 'Point',
      coordinates: coordinates
    }
    const geojsonString = JSON.stringify(geojsonPoint)
    const result = await upsertExtSsenSubstationSupergrid(this.dbClient, {
      name: name,
      number: null,
      voltage: voltage,
      geometry: geojsonString
    })
    if (result?.operation === 'inserted') {
      return 'inserted'
    }
    return 'updated'
  }

  async truncate(): Promise<void> {
    console.info('Truncating SSEN Transmission Substations Supergrid data')
    await deleteAllExtSsenSubstationsSupergrid(this.dbClient)
  }
}
