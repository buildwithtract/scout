import {
  deleteAllExtDatagovukTrees,
  getExtDatagovukTreeForReference,
  getExtDatagovukTreesLatestImport,
  newExtDatagovukTreeFromWGS84,
  partialUpdateExtDatagovukTreeForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukTrees extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-trees'

  constructor(dbClient: Client) {
    super(dbClient, 'tree')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukTreesLatestImport(this.dbClient)
    return result?.max ? new Date(result.max) : new Date(0)
  }

  async insertFeature(
    feature: GeoJSON.Feature
  ): Promise<'inserted' | 'updated'> {
    const reference = feature.properties?.reference
    if (!reference) {
      console.warn('Feature missing reference property, skipping')
      return 'updated'
    }
    const name = feature.properties?.name
    const species = feature.properties?.['tree-species'] || null
    const notes = feature.properties?.notes || null
    let entryDate: Date | null = null
    const entryDateStr = feature.properties?.['entry-date']
    if (entryDateStr) {
      entryDate = new Date(entryDateStr)
      if (isNaN(entryDate.getTime())) {
        console.warn(`Invalid entry-date: ${entryDateStr}, skipping`)
        entryDate = null
      }
    }
    const existingFeature = await getExtDatagovukTreeForReference(
      this.dbClient,
      { reference }
    )
    if (!existingFeature) {
      await newExtDatagovukTreeFromWGS84(this.dbClient, {
        geometry: JSON.stringify(feature.geometry),
        reference,
        name,
        species,
        notes,
        entryDate
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukTreeForReference(this.dbClient, {
        reference,
        geometry: JSON.stringify(feature.geometry),
        name,
        species,
        notes,
        entryDate
      })
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    console.info('Truncating trees data')
    try {
      await deleteAllExtDatagovukTrees(this.dbClient)
      console.info('Truncated trees data')
    } catch (error) {
      throw new Error(
        `Error deleting trees: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
