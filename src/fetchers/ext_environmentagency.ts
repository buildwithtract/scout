import { Client } from 'pg'
import { streamGeoJSONFromURL } from '../lib/streamGeojson'
import { BaseFetcher } from './fetcher'

export abstract class EnvironmentAgencyFetcher<
  P = any,
  G extends GeoJSON.Geometry = GeoJSON.Polygon | GeoJSON.MultiPolygon,
  F extends GeoJSON.Feature = GeoJSON.Feature<G, P>
> extends BaseFetcher {
  abstract name: string
  datasetName: string
  sourceUrl: string
  logger?: Console

  constructor(
    dbClient: Client,
    datasetName: string,
    sourceUrl: string,
    logger?: Console
  ) {
    super(dbClient)
    this.datasetName = datasetName
    this.sourceUrl = sourceUrl
    this.logger = logger
  }

  async *streamFeatures(): AsyncGenerator<GeoJSON.Feature> {
    const generator = await streamGeoJSONFromURL(this.sourceUrl)
    for await (const feature of generator) {
      yield feature
    }
  }

  async shouldGet(): Promise<boolean> {
    // Check if --force flag was passed
    if (process.argv.includes('--force')) {
      return true
    }
    try {
      const knownDate = await this.getLatestImportDate()
      if (!knownDate) {
        this.logger?.debug?.('No date found, should fetch')
        return true
      }
      this.logger?.debug?.('Latest date known by system', knownDate)
      // Make a HEAD request to check Last-Modified header
      const response = await fetch(this.sourceUrl, { method: 'HEAD' })
      const lastModifiedStr = response.headers.get('Last-Modified')
      if (!lastModifiedStr) {
        return true // If no Last-Modified header, assume we should fetch
      }
      const lastModified = new Date(lastModifiedStr)
      return lastModified > knownDate
    } catch (error) {
      throw new Error(
        `Error checking if should get: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Subclasses must implement this to provide the latest import date for shouldGet
  protected abstract getLatestImportDate(): Promise<Date>

  // Subclasses can override this if they want to truncate before fetch
  protected shouldTruncateBeforeFetch(): boolean {
    return false
  }

  // Subclasses must implement this to insert or update a feature
  abstract insertFeature(row: F): Promise<'inserted' | 'updated'>

  async fetch(): Promise<void> {
    if (this.shouldTruncateBeforeFetch()) {
      await this.truncate()
    }
    console.info(`Fetching ${this.datasetName} dataset`)
    const features = this.streamFeatures()
    if (!features) {
      throw new Error('error streaming GeoJSON')
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
