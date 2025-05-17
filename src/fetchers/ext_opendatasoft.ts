import { Feature, FeatureCollection } from 'geojson'
import { Client } from 'pg'
import { BaseFetcher } from './fetcher'

const BASE_URL_FORMAT = 'https://%s/api/explore/v2.1'

export abstract class OpendatasoftFetcher<
  P = any,
  F extends Feature = Feature
> extends BaseFetcher {
  abstract name: string
  domain: string
  apiKey: string
  datasetName: string
  logger?: Console

  constructor(
    dbClient: Client,
    domain: string,
    apiKey: string,
    datasetName: string,
    logger?: Console
  ) {
    super(dbClient)
    this.domain = domain
    this.apiKey = apiKey
    this.datasetName = datasetName
    this.logger = logger
  }

  protected getBaseUrl(): string {
    return BASE_URL_FORMAT.replace('%s', this.domain)
  }

  protected getDatasetUrl(): string {
    return `${this.getBaseUrl()}/catalog/datasets/${this.datasetName}/exports/geojson`
  }

  protected async *streamFeatures(): AsyncGenerator<Feature> {
    const url = this.getDatasetUrl()
    this.logger?.info?.(`Opendatasoft Request URL: ${url}`)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `ApiKey ${this.apiKey}`
      }
    })
    if (!response.ok) {
      throw new Error(
        `Opendatasoft API request failed with status code: ${response.status}`
      )
    }
    const data: FeatureCollection = await response.json()
    if (!data || !Array.isArray(data.features)) {
      throw new Error('Invalid GeoJSON data: No features array found')
    }
    for (const feature of data.features) {
      yield feature
    }
  }

  async shouldGet(): Promise<boolean> {
    // For Opendatasoft, default to always fetch unless overridden
    return true
  }

  // Subclasses must implement this to provide the latest import date for shouldGet
  protected abstract getLatestImportDate(): Promise<Date>

  // Subclasses can override this if they want to truncate before fetch
  protected async shouldTruncateBeforeFetch(): Promise<boolean> {
    const latest = await this.getLatestImportDate()
    return latest.getTime() > 0
  }

  // Subclasses must implement this to insert or update a feature
  abstract insertFeature(row: F): Promise<'inserted' | 'updated'>

  async fetch(): Promise<void> {
    if (await this.shouldTruncateBeforeFetch()) {
      await this.truncate()
    }
    console.info(
      `Fetching Opendatasoft dataset ${this.datasetName} from ${this.domain}`
    )
    const features = this.streamFeatures()
    if (!features) {
      throw new Error('error streaming Opendatasoft GeoJSON')
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
