import {
  deleteAllExtDatagovukFloodRiskZones,
  getExtDatagovukFloodRiskZoneForReference,
  getExtDatagovukFloodRiskZoneLatestImport,
  newExtDatagovukFloodRiskZoneFromWGS84,
  partialUpdateExtDatagovukFloodRiskZoneForReference
} from '@/db'
import { stringifyGeometry } from '@/lib/memoryOptimization'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

// Interface for batched operations
interface BatchedFeature {
  reference: string
  geometry: string
  riskLevel: string
  riskType: string
  isUpdate: boolean
  existingZone?: string
  existingType?: string
}

export class ExtDatagovukFloodRiskZones extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-flood-risk-zones'
  private batch: BatchedFeature[] = []
  private readonly BATCH_SIZE = 1000
  private processedCount = 0
  private existingReferencesCache = new Map<
    string,
    { zone: string; type: string }
  >()
  private cachePopulated = false
  private usingCache = false

  constructor(dbClient: Client) {
    super(dbClient, 'flood-risk-zone')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukFloodRiskZoneLatestImport(this.dbClient)
    return result?.max ? new Date(result.max) : new Date(0)
  }

  // Pre-populate cache of existing references, but only if dataset is small enough
  private async populateExistingReferencesCache(): Promise<void> {
    if (this.cachePopulated) return

    console.info('Checking existing records for caching...')
    try {
      // First check how many records exist
      const countResult = await this.dbClient.query(
        'SELECT COUNT(*)::int as count FROM ext_datagovuk_flood_risk_zones'
      )
      const existingCount = countResult.rows[0]?.count || 0

      // Only cache if reasonable number of records (< 30k to be safe)
      if (existingCount > 30000) {
        console.warn(
          `Too many existing records (${existingCount}) - using individual queries instead of cache`
        )
        this.cachePopulated = true
        return
      }

      console.info(`Loading ${existingCount} existing references into cache...`)
      const result = await this.dbClient.query(
        'SELECT reference, zone, type FROM ext_datagovuk_flood_risk_zones'
      )

      for (const row of result.rows) {
        this.existingReferencesCache.set(row.reference, {
          zone: row.zone,
          type: row.type
        })
      }

      console.info(
        `Successfully cached ${this.existingReferencesCache.size} existing references`
      )
      this.usingCache = true
      this.cachePopulated = true
    } catch (error) {
      console.error('Failed to populate cache:', error)
      this.cachePopulated = true
    }
  }

  async insertFeature(
    feature: GeoJSON.Feature
  ): Promise<'inserted' | 'updated'> {
    this.processedCount++

    // Populate cache on first run
    if (!this.cachePopulated) {
      await this.populateExistingReferencesCache()
    }

    // Simple progress logging
    if (this.processedCount % 10000 === 0) {
      const used = process.memoryUsage()
      const heapMB = Math.round(used.heapUsed / 1024 / 1024)
      console.info(
        `[${this.processedCount}] Memory: ${heapMB}MB, Cache size: ${this.existingReferencesCache.size}, Batch queue: ${this.batch.length}`
      )
    }

    const reference = feature.properties?.reference
    if (!reference) {
      console.warn('Feature missing reference property, skipping')
      return 'updated'
    }
    const riskLevel = feature.properties?.['flood-risk-level']
    if (!riskLevel) {
      console.warn('Feature missing flood-risk-level property, skipping')
      return 'updated'
    }
    const riskType = feature.properties?.['flood-risk-type']
    if (!riskType) {
      console.warn('Feature missing flood-risk-type property, skipping')
      return 'updated'
    }

    // Use cache if available, otherwise individual query
    let existingFeature: { zone: string; type: string } | undefined

    if (this.usingCache) {
      existingFeature = this.existingReferencesCache.get(reference)
    } else {
      const dbResult = await getExtDatagovukFloodRiskZoneForReference(
        this.dbClient,
        { reference }
      )
      existingFeature = dbResult
        ? { zone: dbResult.zone, type: dbResult.type }
        : undefined
    }

    // Use optimized geometry stringification with precision reduction
    let geometry: string
    try {
      geometry = stringifyGeometry(feature.geometry, 6)
    } catch (e) {
      console.error('Failed to stringify geometry for reference:', reference)
      throw e
    }

    // Add to simple batch
    this.batch.push({
      reference,
      geometry,
      riskLevel,
      riskType,
      isUpdate: !!existingFeature,
      existingZone: existingFeature?.zone,
      existingType: existingFeature?.type
    })

    // Process batch when full
    if (this.batch.length >= this.BATCH_SIZE) {
      await this.processBatch()
    }

    // Clear feature reference to help GC
    feature = null as any

    return existingFeature ? 'updated' : 'inserted'
  }

  private async processBatch(): Promise<void> {
    if (this.batch.length === 0) return

    console.debug(`Processing batch of ${this.batch.length} items`)

    const inserts: BatchedFeature[] = []
    const updates: BatchedFeature[] = []

    // Separate inserts and updates
    for (const item of this.batch) {
      if (item.isUpdate) {
        updates.push(item)
      } else {
        inserts.push(item)
      }
    }

    // Process in transaction
    await this.dbClient.query('BEGIN')
    try {
      // Process inserts
      for (const item of inserts) {
        await newExtDatagovukFloodRiskZoneFromWGS84(this.dbClient, {
          geometry: item.geometry,
          reference: item.reference,
          zone: item.riskLevel,
          type: item.riskType
        })

        // Update cache if using it
        if (this.usingCache) {
          this.existingReferencesCache.set(item.reference, {
            zone: item.riskLevel,
            type: item.riskType
          })
        }
      }

      // Process updates
      for (const item of updates) {
        const zoneChanged = item.riskLevel !== item.existingZone
        const typeChanged = item.riskType !== item.existingType

        if (zoneChanged || typeChanged) {
          await partialUpdateExtDatagovukFloodRiskZoneForReference(
            this.dbClient,
            {
              reference: item.reference,
              geometry: item.geometry,
              zone: zoneChanged ? item.riskLevel : null,
              type: typeChanged ? item.riskType : null
            }
          )

          // Update cache if using it
          if (this.usingCache) {
            this.existingReferencesCache.set(item.reference, {
              zone: item.riskLevel,
              type: item.riskType
            })
          }
        }
      }

      await this.dbClient.query('COMMIT')
    } catch (error) {
      await this.dbClient.query('ROLLBACK')
      throw error
    }

    // Clear batch
    this.batch.length = 0

    // Optional GC
    if (global.gc) {
      global.gc()
    }
  }

  // Override fetch to ensure final batch is processed and cleanup cache
  async fetch(): Promise<void> {
    console.info(
      `Starting fetch for ${this.datasetName} with simplified memory optimization`
    )
    await super.fetch()

    // Process any remaining items in the batch
    await this.processBatch()

    // Clear cache to free memory
    this.existingReferencesCache.clear()

    // Final summary log
    console.info(
      `Completed fetch for ${this.datasetName} - processed ${this.processedCount} features`
    )

    // Final memory check
    const used = process.memoryUsage()
    const heapMB = Math.round(used.heapUsed / 1024 / 1024)
    console.info(`Final memory usage: ${heapMB}MB`)
  }

  async truncate(): Promise<void> {
    console.info('Truncating flood risk data')
    try {
      await deleteAllExtDatagovukFloodRiskZones(this.dbClient)
      console.info('Truncated flood risk data')
    } catch (error) {
      throw new Error(
        `Error deleting flood risk zones: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
