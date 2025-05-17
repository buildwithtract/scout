import { JSDOM } from 'jsdom'
import { Client } from 'pg'
import { streamGeoJSONFromURL } from '../lib/streamGeojson'
import { BaseFetcher } from './fetcher'

export interface Logger {
  debugContext?: (ctx: any, message: string, ...args: any[]) => void
}

const DATAGOVUK_CLIENT_DATA_FILE_BASE =
  'https://files.planning.data.gov.uk/dataset'
const DATAGOVUK_CLIENT_DATA_FILE_EXT = 'geojson'
const DATAGOVUK_CLIENT_META_BASE = 'https://www.planning.data.gov.uk/dataset'
const DATAGOVUK_CLIENT_META_EXT = 'html'

export abstract class DatagovukFetcher<
  P,
  G extends GeoJSON.Geometry = GeoJSON.Polygon | GeoJSON.MultiPolygon,
  F extends GeoJSON.Feature = GeoJSON.Feature<G, P>
> extends BaseFetcher {
  abstract name: string
  abstract insertFeature(row: F): Promise<'inserted' | 'updated'>

  // Subclasses must implement this to provide the latest import date for shouldGet
  protected abstract getLatestImportDate(): Promise<Date>

  // Subclasses can override this if they want to truncate before fetch
  protected shouldTruncateBeforeFetch(): boolean {
    return false
  }

  datasetName: string
  logger?: Logger

  constructor(dbClient: Client, datasetName: string, logger?: Logger) {
    super(dbClient)
    this.datasetName = datasetName
    this.logger = logger
  }

  getDataUrl(): string {
    return `${DATAGOVUK_CLIENT_DATA_FILE_BASE}/${this.datasetName}.${DATAGOVUK_CLIENT_DATA_FILE_EXT}`
  }

  getMetaUrl(): string {
    return `${DATAGOVUK_CLIENT_META_BASE}/${this.datasetName}.${DATAGOVUK_CLIENT_META_EXT}`
  }

  async *streamFeatures(): AsyncGenerator<GeoJSON.Feature> {
    const generator = await streamGeoJSONFromURL(this.getDataUrl())
    for await (const feature of generator) {
      yield feature
    }
  }

  async shouldGet(): Promise<boolean> {
    // Check if --force flag was passed
    const isForce = process.argv.includes('--force')
    if (isForce) {
      return true
    }
    // Check if table is empty
    const tableName = `public.${this.name.replace(/-/g, '_')}`
    const result = await this.dbClient.query({
      text: `SELECT COUNT(*)::int AS count FROM ${tableName}`,
      values: []
    })
    const count = result.rows[0]?.count ?? 0
    return count === 0
  }

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

  // Restore getLatestDataFoundDate and getLatestDataFoundDateFromHtml as protected methods
  protected async getLatestDataFoundDate(
    ctx: any,
    url: string
  ): Promise<Date | null> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          `Error getting URL: ${response.status} ${response.statusText}`
        )
      }
      const html = await response.text()
      return this.getLatestDataFoundDateFromHtml(ctx, html)
    } catch (error) {
      throw new Error(
        `Error getting URL: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  protected async getLatestDataFoundDateFromHtml(
    ctx: any,
    rawHtml: string
  ): Promise<Date | null> {
    const dom = new JSDOM(rawHtml)
    const document = dom.window.document
    // Find the cell with text "New data last found on"
    const cells = document.querySelectorAll('.govuk-table__cell')
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]
      if (
        cell.textContent?.trim() === 'New data last found on' &&
        cells[i + 1]
      ) {
        const dateText = cells[i + 1].textContent?.trim()
        if (dateText) {
          return new Date(dateText)
        }
      }
    }
    return null
  }
}
