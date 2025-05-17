import {
  deleteAllExtEnvironmentagencyAlcGrades,
  getExtEnvironmentagencyALCGradesForReference,
  getExtEnvironmentagencyALCGradesLatestImport,
  newExtEnvironmentagencyAlcGrade,
  partialUpdateExtEnvironmentagencyALCGrades
} from '@/db/generated/ext_environmentagency_alc_grades_sql'
import { hectaresToAcres } from '@/lib/utils'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { EnvironmentAgencyFetcher } from './ext_environmentagency'

const ALC_GRADES_SOURCE_URL =
  'https://opendata.arcgis.com/datasets/26d1ef630b9f46ea8fc4e96711d81376_0.geojson'

type ALCGrade = '1' | '2' | '3a' | '3b' | '4' | '5' | 'Not Surveyed' | 'Other'

function transformALCGrade(grade: string | null | undefined): ALCGrade {
  if (!grade) return 'Not Surveyed'
  const normalizedGrade = grade.trim().toUpperCase()
  switch (normalizedGrade) {
    case '1':
    case 'GRADE 1':
      return '1'
    case '2':
    case 'GRADE 2':
      return '2'
    case '3A':
    case 'GRADE 3A':
      return '3a'
    case '3B':
    case 'GRADE 3B':
      return '3b'
    case '4':
    case 'GRADE 4':
      return '4'
    case '5':
    case 'GRADE 5':
      return '5'
    case 'NOT SURVEYED':
    case 'NOTSURVEY':
    case 'NS':
      return 'Not Surveyed'
    default:
      return 'Other'
  }
}

export class ExtEnvironmentagencyAlcGrades extends EnvironmentAgencyFetcher<any> {
  name = 'ext-environmentagency-alc-grades'

  constructor(dbClient: Client) {
    super(dbClient, 'alc-grades', ALC_GRADES_SOURCE_URL)
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtEnvironmentagencyALCGradesLatestImport(
      this.dbClient
    )
    return result?.max ? new Date(result.max) : new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    const properties = feature.properties || {}
    const objectId = properties['OBJECTID']
    if (!objectId) {
      console.warn('Feature missing OBJECTID:', feature)
      throw new Error('Missing OBJECTID in feature')
    }
    const rawAlcGrade = properties.ALC_GRADE
    const alcGrade = transformALCGrade(rawAlcGrade)
    if (alcGrade === undefined || alcGrade === null) {
      console.warn('Feature missing ALC_GRADE:', { objectId, properties })
      throw new Error('Missing ALC_GRADE in feature')
    }
    const area = hectaresToAcres(properties.HECTARES) || undefined
    const url = properties.Published_ || undefined
    if (!feature.geometry) {
      console.warn('Feature missing geometry:', { objectId, properties })
      throw new Error('Missing geometry in feature')
    }
    const existingFeature = await getExtEnvironmentagencyALCGradesForReference(
      this.dbClient,
      { objectid: objectId }
    )
    try {
      await this.dbClient.query('SELECT ST_IsValid(ST_GeomFromGeoJSON($1))', [
        JSON.stringify(feature.geometry)
      ])
    } catch (geomError) {
      console.error('Invalid geometry for OBJECTID:', objectId, geomError)
      throw new Error(
        `Invalid geometry: ${geomError instanceof Error ? geomError.message : String(geomError)}`
      )
    }
    if (!existingFeature) {
      await newExtEnvironmentagencyAlcGrade(this.dbClient, {
        objectid: objectId,
        alcGrade,
        area: area?.toString(),
        url,
        geometry: Buffer.from(JSON.stringify(feature.geometry)).toString()
      })
      return 'inserted'
    } else {
      await partialUpdateExtEnvironmentagencyALCGrades(this.dbClient, {
        objectid: objectId,
        geometry: Buffer.from(JSON.stringify(feature.geometry)).toString(),
        alcGrade: alcGrade !== existingFeature.alcGrade ? alcGrade : null,
        area:
          area?.toString() !== existingFeature.area ? area?.toString() : null,
        url: null
      })
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    console.info('Truncating ALC Grades data')
    try {
      await deleteAllExtEnvironmentagencyAlcGrades(this.dbClient)
      console.info('Truncated ALC Grades data')
    } catch (error) {
      console.error('Error truncating ALC Grades:', error)
      throw new Error(
        `Error truncating ALC Grades: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
