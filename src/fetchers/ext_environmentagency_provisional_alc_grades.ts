import {
  deleteAllExtEnvironmentagencyProvisionalAlcGrades,
  getExtEnvironmentagencyProvisionalALCGradesForReference,
  getExtEnvironmentagencyProvisionalALCGradesLatestImport,
  newExtEnvironmentagencyProvisionalAlcGrade,
  partialUpdateExtEnvironmentagencyProvisionalALCGrades
} from '@/db/generated/ext_environmentagency_provisional_alc_grades_sql'
import { hectaresToAcres } from '@/lib/utils'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { EnvironmentAgencyFetcher } from './ext_environmentagency'

const PROVISIONAL_ALC_GRADES_SOURCE_URL =
  'https://opendata.arcgis.com/datasets/5d2477d8d04b41d4bbc9a8742f858f4d_0.geojson'

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

export class ExtEnvironmentagencyProvisionalAlcGrades extends EnvironmentAgencyFetcher<any> {
  name = 'ext-environmentagency-provisional-alc-grades'

  constructor(dbClient: Client) {
    super(dbClient, 'provisional-alc-grades', PROVISIONAL_ALC_GRADES_SOURCE_URL)
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result =
      await getExtEnvironmentagencyProvisionalALCGradesLatestImport(
        this.dbClient
      )
    return result?.max ? new Date(result.max) : new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    const properties = feature.properties || {}
    const objectid = properties.OBJECTID
    if (objectid === undefined || objectid === null) {
      throw new Error('Missing OBJECTID in feature')
    }
    const rawAlcGrade = properties.ALC_GRADE
    const alcGrade = transformALCGrade(rawAlcGrade)
    if (alcGrade === undefined || alcGrade === null) {
      throw new Error('Missing ALC_GRADE in feature')
    }
    const areaHa = properties.AREA || undefined
    const area = hectaresToAcres(areaHa)
    const existingFeature =
      await getExtEnvironmentagencyProvisionalALCGradesForReference(
        this.dbClient,
        { objectid }
      )
    const geometryJson = JSON.stringify(feature.geometry)
    if (!existingFeature) {
      await newExtEnvironmentagencyProvisionalAlcGrade(this.dbClient, {
        objectid,
        alcGrade,
        area: area?.toString(),
        geometry: geometryJson
      })
      return 'inserted'
    } else {
      await partialUpdateExtEnvironmentagencyProvisionalALCGrades(
        this.dbClient,
        {
          objectid,
          alcGrade: alcGrade !== existingFeature.alcGrade ? alcGrade : null,
          area:
            area?.toString() !== existingFeature.area ? area?.toString() : null,
          geometry: null
        }
      )
      // If geometry needs updating, we need to do it with a direct query
      if (feature.geometry) {
        await this.dbClient.query(
          `
            UPDATE public.ext_environmentagency_provisional_alc_grades
            SET
              geometry = ST_GeomFromGeoJSON($1)::geometry,
              last_imported_at = NOW()
            WHERE objectid = $2
            `,
          [geometryJson, objectid]
        )
      }
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    console.info('Truncating Provisional ALC Grades data')
    try {
      await deleteAllExtEnvironmentagencyProvisionalAlcGrades(this.dbClient)
      console.info('Truncated Provisional ALC Grades data')
    } catch (error) {
      console.error('Error truncating Provisional ALC Grades:', error)
      throw new Error(
        `Error truncating Provisional ALC Grades: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
