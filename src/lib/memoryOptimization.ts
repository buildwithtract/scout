/**
 * Memory optimization utilities for data fetchers
 */

/**
 * Simplify GeoJSON geometry by reducing coordinate precision
 * This can significantly reduce memory usage for complex geometries
 */
export function simplifyGeometry(
  geometry: GeoJSON.Geometry,
  precision: number = 6
): GeoJSON.Geometry {
  const roundCoordinate = (coord: number): number => {
    return Math.round(coord * Math.pow(10, precision)) / Math.pow(10, precision)
  }

  const simplifyCoordinates = (coords: any): any => {
    if (Array.isArray(coords[0])) {
      return coords.map(simplifyCoordinates)
    }
    return [roundCoordinate(coords[0]), roundCoordinate(coords[1])]
  }

  const simplified = { ...geometry }

  // Handle different geometry types
  if (simplified.type === 'GeometryCollection') {
    // GeometryCollection doesn't have coordinates, but has geometries
    const collection = simplified as GeoJSON.GeometryCollection
    collection.geometries = collection.geometries.map((geom) =>
      simplifyGeometry(geom, precision)
    )
  } else if ('coordinates' in simplified) {
    // All other geometry types have coordinates
    const geom = simplified as
      | GeoJSON.Point
      | GeoJSON.LineString
      | GeoJSON.Polygon
      | GeoJSON.MultiPoint
      | GeoJSON.MultiLineString
      | GeoJSON.MultiPolygon
    geom.coordinates = simplifyCoordinates(geom.coordinates)
  }

  return simplified
}

/**
 * Monitor memory usage and log when it exceeds thresholds
 */
export function logMemoryUsage(
  context: string,
  threshold: number = 50,
  alwaysLog: boolean = false
): void {
  const used = process.memoryUsage()
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024)
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024)
  const rssMB = Math.round(used.rss / 1024 / 1024)
  const externalMB = Math.round(used.external / 1024 / 1024)

  // Only log if memory usage is high or if explicitly requested
  if (heapUsedMB > threshold || alwaysLog) {
    const level = heapUsedMB > threshold ? 'warn' : 'info'
    const message = `[${context}] Memory - Heap: ${heapUsedMB}/${heapTotalMB}MB, RSS: ${rssMB}MB, External: ${externalMB}MB`

    if (level === 'warn') {
      console.warn(message)
    } else {
      console.info(message)
    }
  }
}

/**
 * Log memory usage only for significant milestones (quieter version)
 */
export function logMemoryMilestone(
  context: string,
  processedCount: number,
  milestoneInterval: number = 10000
): void {
  if (processedCount % milestoneInterval === 0 && processedCount > 0) {
    logMemoryUsage(`${context}-${processedCount}`, 200, true) // Always log milestones but with higher threshold
  }
}

/**
 * Force garbage collection with more aggressive cleanup
 */
export function forceGarbageCollection(): void {
  if (global.gc) {
    // Run GC multiple times to ensure cleanup
    global.gc()
    global.gc()
  } else if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Garbage collection not available. Run with --expose-gc for better memory management.'
    )
  }
}

/**
 * Create a batch processor with memory-conscious batching
 */
export class MemoryAwareBatchProcessor<T> {
  private batch: T[] = []
  private batchSize: number
  private memoryThreshold: number // MB
  private processor: (batch: T[]) => Promise<void>
  private itemsProcessedSinceLastGC = 0
  private totalProcessed = 0

  constructor(
    processor: (batch: T[]) => Promise<void>,
    batchSize: number = 1000,
    memoryThreshold: number = 100 // More reasonable default
  ) {
    this.processor = processor
    this.batchSize = batchSize
    this.memoryThreshold = memoryThreshold
  }

  async add(item: T): Promise<void> {
    this.batch.push(item)
    this.itemsProcessedSinceLastGC++
    this.totalProcessed++

    // Only check memory every 500 items to reduce overhead, or when batch is full
    const shouldCheckMemory = this.itemsProcessedSinceLastGC % 500 === 0
    const memoryExceeded = shouldCheckMemory && this.isMemoryThresholdExceeded()
    const batchFull = this.batch.length >= this.batchSize

    if (batchFull || memoryExceeded) {
      if (memoryExceeded && !batchFull) {
        const used = process.memoryUsage()
        const heapMB = Math.round(used.heapUsed / 1024 / 1024)
        console.warn(
          `Memory threshold exceeded (${this.memoryThreshold}MB, actual: ${heapMB}MB), flushing batch of ${this.batch.length} items`
        )
      }
      await this.flush()
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return

    const batchSize = this.batch.length
    console.debug(
      `Processing batch of ${batchSize} items (total processed: ${this.totalProcessed})`
    )

    const memoryBefore = process.memoryUsage()
    const heapBeforeMB = Math.round(memoryBefore.heapUsed / 1024 / 1024)

    await this.processor([...this.batch])
    this.batch.length = 0 // Clear array efficiently
    this.itemsProcessedSinceLastGC = 0

    // Force aggressive GC
    forceGarbageCollection()

    // Log memory after cleanup for debugging
    const memoryAfter = process.memoryUsage()
    const heapAfterMB = Math.round(memoryAfter.heapUsed / 1024 / 1024)
    const freedMB = heapBeforeMB - heapAfterMB

    if (heapAfterMB > this.memoryThreshold) {
      console.warn(
        `Memory still high after batch processing: ${heapAfterMB}MB (freed: ${freedMB}MB, batch size: ${batchSize})`
      )
    } else if (freedMB > 10) {
      console.debug(
        `Freed ${freedMB}MB after batch processing (${heapAfterMB}MB remaining)`
      )
    }
  }

  private isMemoryThresholdExceeded(): boolean {
    const used = process.memoryUsage()
    const heapUsedMB = used.heapUsed / 1024 / 1024
    return heapUsedMB > this.memoryThreshold
  }

  getQueueSize(): number {
    return this.batch.length
  }

  getTotalProcessed(): number {
    return this.totalProcessed
  }
}

/**
 * Lightweight JSON stringifier for geometries that reduces memory footprint
 */
export function stringifyGeometry(
  geometry: GeoJSON.Geometry,
  precision?: number
): string {
  const simplified = precision
    ? simplifyGeometry(geometry, precision)
    : geometry

  // Use JSON.stringify with a replacer to ensure consistent output
  // and potentially reduce string length
  return JSON.stringify(simplified, (key, value) => {
    // Round any remaining numbers to prevent floating point precision issues
    if (typeof value === 'number') {
      return Math.round(value * 1000000) / 1000000
    }
    return value
  })
}
