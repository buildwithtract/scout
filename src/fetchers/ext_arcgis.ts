import { Feature, FeatureCollection } from 'geojson'
import { Client } from 'pg'
import { BaseFetcher } from './fetcher'

export abstract class ArcGisFetcher<
  P = any,
  F extends Feature = Feature
> extends BaseFetcher {
  sourceUrl: string
  perPage: number = 10000
  logger?: Console

  constructor(dbClient: Client, sourceUrl: string, logger?: Console) {
    super(dbClient)
    this.sourceUrl = sourceUrl
    this.logger = logger
  }

  // Subclasses must implement this to provide the latest import date for shouldGet
  protected abstract getLatestImportDate(): Promise<Date>

  // Subclasses can override this if they want to truncate before fetch
  protected shouldTruncateBeforeFetch(): boolean {
    return false
  }

  // Subclasses must implement this to insert or update a feature
  abstract insertFeature(row: F): Promise<'inserted' | 'updated'>

  async *streamFeatures(): AsyncGenerator<Feature> {
    let offset = 0
    const perPage = this.perPage
    while (true) {
      const url = `${this.sourceUrl}/query?where=1%3D1&outSR=4326&outFields=*&f=geojson&resultOffset=${offset}&resultRecordCount=${perPage}`
      this.logger?.info?.(`ArcGIS Request URL: ${url}`)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          `Error fetching ArcGIS data: ${response.status} ${response.statusText}`
        )
      }
      const data: FeatureCollection = await response.json()
      if (!data || !Array.isArray(data.features)) {
        throw new Error('Invalid GeoJSON data: No features array found')
      }
      if (data.features.length === 0) {
        break
      }
      for (const feature of data.features) {
        yield feature
      }
      offset += data.features.length
      // ArcGIS may signal more data with exceededTransferLimit
      const exceededTransferLimit =
        (data as any).exceededTransferLimit ||
        (data as any).properties?.exceededTransferLimit
      if (!exceededTransferLimit) {
        break
      }
    }
  }

  async shouldGet(): Promise<boolean> {
    // For ArcGIS, default to always fetch unless overridden
    return true
  }

  async fetch(): Promise<void> {
    if (this.shouldTruncateBeforeFetch()) {
      await this.truncate()
    }
    console.info(`Fetching ArcGIS dataset from ${this.sourceUrl}`)
    const features = this.streamFeatures()
    if (!features) {
      throw new Error('error streaming ArcGIS GeoJSON')
    }
    let total = 0
    let totalInserted = 0
    let totalUpdated = 0
    for await (const feature of features) {
      if (total % 1000 === 0) {
        console.info(
          'Saving features',
          'total',
          total,
          'inserted',
          totalInserted,
          'updated',
          totalUpdated
        )
      }
      const res = await this.insertFeature(feature as F)
      if (res === 'inserted') {
        totalInserted++
      } else if (res === 'updated') {
        totalUpdated++
      }
      total++
    }
    console.info(
      'Saved all features',
      'total',
      total,
      'inserted',
      totalInserted,
      'updated',
      totalUpdated
    )
  }
}
