import AdmZip from 'adm-zip'
import { exec } from 'child_process'
import * as fs from 'fs'
import { FeatureCollection } from 'geojson'
import * as os from 'os'
import * as path from 'path'
import { Client } from 'pg'
import { promisify } from 'util'
import { BaseFetcher } from './fetcher'

const execPromise = promisify(exec)

export const NATIONAL_GRID_BASE_URL = 'https://www.nationalgrid.com/document'

export abstract class NgetFetcher<
  P,
  G extends GeoJSON.Geometry = GeoJSON.Geometry,
  F extends GeoJSON.Feature = GeoJSON.Feature<G, P>
> extends BaseFetcher {
  abstract insertFeature(row: F): Promise<{
    operation: 'inserted' | 'updated' | 'skipped'
    reference: string
  }>
  abstract name: string
  abstract deleteMissingForReferences(references: string[]): Promise<number>
  abstract getLatestImport(): Promise<Date>

  static datasetID: string
  static expectedShapefileName: string

  private withDelete = false

  constructor(dbClient: Client, options?: { withDelete?: boolean }) {
    super(dbClient)
    const constructor = this.constructor as typeof NgetFetcher
    this.withDelete = options?.withDelete || false

    if (!constructor.name) {
      throw new Error('name is required')
    }

    if (!constructor.datasetID) {
      throw new Error('datasetID is required')
    }

    if (!constructor.expectedShapefileName) {
      throw new Error('expectedShapefileName is required')
    }
  }

  private getDatasetURL(datasetID: string): string {
    return `${NATIONAL_GRID_BASE_URL}/${datasetID}/download`
  }

  private async checkDatasetModified(
    datasetID: string,
    latestImport: Date
  ): Promise<boolean> {
    const url = this.getDatasetURL(datasetID)

    try {
      const response = await fetch(url, { method: 'HEAD' })

      const lastModifiedStr = response.headers.get('Last-Modified')
      if (!lastModifiedStr) {
        return true // If no Last-Modified header, assume we should fetch
      }

      const lastModified = new Date(lastModifiedStr)
      return lastModified > latestImport
    } catch (error) {
      throw new Error(`Error making HEAD request: ${error}`)
    }
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = []

    const items = fs.readdirSync(dir)
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath))
      } else {
        files.push(fullPath)
      }
    }

    return files
  }

  private deleteDirectory(dir: string): void {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }

  protected async getFeatureCollection(
    datasetID: string
  ): Promise<FeatureCollection> {
    const constructor = this.constructor as typeof NgetFetcher
    const url = this.getDatasetURL(datasetID)
    console.log('Fetching National Grid dataset from URL:', url)

    // Get the dataset by downloading the file
    let response
    try {
      response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      console.log('Successfully downloaded file')
      console.log('Response headers:', response.headers)
    } catch (error) {
      console.error('Error downloading file:', error)
      throw new Error(`Error downloading file: ${error}`)
    }

    // Create a debug directory in /tmp
    const debugDir = path.join(os.tmpdir(), 'nationalgrid-debug')
    fs.mkdirSync(debugDir, { recursive: true })
    console.log('Created debug directory:', debugDir)

    // Write it to a temporary file
    let tempDir, zipFilePath
    try {
      tempDir = fs.mkdtempSync(path.join(debugDir, 'nationalgrid-'))
      zipFilePath = path.join(tempDir, `${datasetID}.zip`)
      const arrayBuffer = await response.arrayBuffer()
      fs.writeFileSync(zipFilePath, Buffer.from(arrayBuffer))
      console.log('Successfully wrote zip file to:', zipFilePath)
      console.log('Zip file size:', fs.statSync(zipFilePath).size, 'bytes')
    } catch (error) {
      console.error('Error writing zip file:', error)
      throw error
    }

    // Unzip the file
    let extractDir
    try {
      const zip = new AdmZip(zipFilePath)
      const zipEntries = zip.getEntries()
      console.log(
        'Zip contents:',
        zipEntries.map((entry) => ({
          name: entry.entryName,
          size: entry.header.size
        }))
      )

      extractDir = path.join(tempDir, 'extract')
      fs.mkdirSync(extractDir, { recursive: true })
      zip.extractAllTo(extractDir, true)
      console.log('Successfully extracted zip to:', extractDir)
    } catch (error) {
      console.error('Error extracting zip:', error)
      throw error
    }

    // Find the .shp file
    let files, shpFile
    try {
      files = this.getAllFiles(extractDir)
      console.log('Files found in extract directory:', files)

      shpFile = files.find((file) =>
        file.endsWith(constructor.expectedShapefileName)
      )
      if (!shpFile) {
        throw new Error(
          `No ${constructor.expectedShapefileName} file found in the downloaded zip`
        )
      }
      console.log('Found shapefile:', shpFile)

      // Check for all related files
      const baseFile = shpFile.slice(0, -4)
      const relatedFiles = [
        `${baseFile}.dbf`,
        `${baseFile}.shx`,
        `${baseFile}.prj`,
        `${baseFile}.cpg`
      ]

      console.log('Checking for related files:')
      for (const file of relatedFiles) {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file)
          console.log(
            `- Found ${path.basename(file)}, size: ${stats.size} bytes`
          )
        } else {
          console.warn(`- Missing ${path.basename(file)}`)
        }
      }

      // Verify we have the .dbf file specifically
      const dbfFile = `${baseFile}.dbf`
      if (!fs.existsSync(dbfFile)) {
        throw new Error(
          `Critical error: ${path.basename(dbfFile)} file not found. The shapefile is incomplete.`
        )
      }
    } catch (error) {
      console.error('Error finding shapefile:', error)
      throw error
    }

    // Convert to GeoJSON
    let targetPath
    try {
      console.log('Starting shapefile conversion...')
      targetPath = path.join(tempDir, `${datasetID}.geojson`)

      // First inspect the shapefile
      const ogrInfoCmd = `ogrinfo -al -so ${shpFile}`
      console.log('Running ogrinfo command:', ogrInfoCmd)
      const { stdout: ogrInfoOutput } = await execPromise(ogrInfoCmd)
      console.log('Shapefile info:', ogrInfoOutput)

      // Convert with explicit attribute preservation and layer name
      const ogrCmd = `ogr2ogr -f GeoJSON -preserve_fid -mapFieldType Integer64=Integer -lco RFC7946=YES ${targetPath} ${shpFile}`
      console.log('Running conversion command:', ogrCmd)
      const { stdout: ogrOutput, stderr: ogrError } = await execPromise(ogrCmd)
      if (ogrError) console.log('ogr2ogr stderr:', ogrError)
      if (ogrOutput) console.log('ogr2ogr stdout:', ogrOutput)

      console.log('Conversion completed. GeoJSON file created at:', targetPath)
    } catch (error) {
      console.error('Error during conversion:', error)
      throw error
    }

    // Read and parse the GeoJSON
    let featureCollection: FeatureCollection
    try {
      console.log('Reading GeoJSON file...')
      const geojsonData = fs.readFileSync(targetPath, 'utf8')
      console.log('GeoJSON file size:', geojsonData.length, 'bytes')

      featureCollection = JSON.parse(geojsonData) as FeatureCollection
      console.log('Successfully parsed GeoJSON')
      console.log('Number of features:', featureCollection.features.length)

      if (featureCollection.features.length > 0) {
        console.log(
          'First feature properties:',
          JSON.stringify(featureCollection.features[0].properties, null, 2)
        )
        console.log(
          'Available property keys:',
          Object.keys(featureCollection.features[0].properties)
        )
      } else {
        console.warn('Warning: No features found in the GeoJSON')
      }

      // Save a copy of the GeoJSON for debugging
      const debugGeoJsonPath = path.join(debugDir, `${datasetID}.geojson`)
      fs.writeFileSync(debugGeoJsonPath, geojsonData)
      console.log('Saved debug copy of GeoJSON to:', debugGeoJsonPath)
    } catch (error) {
      console.error('Error reading or parsing GeoJSON:', error)
      throw error
    }

    // Don't clean up - leave files for debugging
    console.log('Debug files available in:', debugDir)
    console.log('Temporary working directory:', tempDir)

    return featureCollection
  }

  async fetch(): Promise<void> {
    const constructor = this.constructor as typeof NgetFetcher

    const featureCollection = await this.getFeatureCollection(
      constructor.datasetID
    )

    const featureReferences: string[] = []
    let total = 0,
      totalInserted = 0,
      totalUpdated = 0,
      totalDeleted = 0

    for (const feature of featureCollection.features) {
      if (total % 1000 === 0) {
        console.info(
          'Saved features',
          'total',
          total,
          'inserted',
          totalInserted,
          'updated',
          totalUpdated,
          'deleted',
          totalDeleted
        )
      }

      if (!feature.geometry) {
        continue
      }

      const { operation, reference } = await this.insertFeature(feature as F)
      if (operation === 'updated') {
        totalUpdated++
      } else if (operation === 'inserted') {
        totalInserted++
      } else {
        continue
      }

      featureReferences.push(reference)
      total++
    }

    if (this.withDelete) {
      const deletedCount =
        await this.deleteMissingForReferences(featureReferences)
      totalDeleted = Number(deletedCount || 0)
    }

    console.info(
      'Saved all features',
      'total',
      total,
      'inserted',
      totalInserted,
      'updated',
      totalUpdated,
      'deleted',
      totalDeleted
    )
  }

  async shouldGet(): Promise<boolean> {
    const constructor = this.constructor as typeof NgetFetcher
    const latestImport = await this.getLatestImport()
    const lastImportDate = latestImport ? new Date(latestImport) : new Date(0)

    return this.checkDatasetModified(constructor.datasetID, lastImportDate)
  }
}
