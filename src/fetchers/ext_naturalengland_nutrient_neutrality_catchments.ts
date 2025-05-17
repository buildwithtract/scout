import {
  deleteAllExtNaturalenglandNutrientNeutralityCatchments,
  getExtNaturalenglandNutrientNeutralityCatchmentsForReference,
  newExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSON,
  partialUpdateExtNaturalenglandNutrientNeutralityCatchmentsFromGeoJSON
} from '@/db/generated/ext_naturalengland_nutrient_neutrality_catchments_sql'
import { Feature } from 'geojson'
import { Client } from 'pg'
import { ArcGisFetcher } from './ext_arcgis'

const NUTRIENT_NEUTRALITY_CATCHMENTS_SOURCE_URL =
  'https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/Nutrient_Neutrality_Catchments_England/FeatureServer/0'

export class NutrientNeutralityCatchmentsFetcher extends ArcGisFetcher<any> {
  name = 'ext-naturalengland-nutrient-neutrality-catchments'

  constructor(dbClient: Client) {
    super(dbClient, NUTRIENT_NEUTRALITY_CATCHMENTS_SOURCE_URL)
  }

  protected async getLatestImportDate(): Promise<Date> {
    // No import date tracking for this dataset yet
    return new Date(0)
  }

  async insertFeature(feature: Feature): Promise<'inserted' | 'updated'> {
    const objectID = this.getGeoJSONPropertyInt(feature, 'OBJECTID')
    const popupInfo = this.getNullableGeoJSONPropertyString(
      feature,
      'PopupInfo'
    )
    const n2kSiteName = this.getNullableGeoJSONPropertyString(
      feature,
      'N2K_Site_N'
    )
    const label = this.getNullableGeoJSONPropertyString(feature, 'Label')
    const dateAmended = this.getNullableGeoJSONPropertyFloat(
      feature,
      'DateAmend'
    )
    let dateAmendedTime: Date | null = null
    if (dateAmended !== null) {
      dateAmendedTime = new Date(dateAmended * 1000)
    }
    const notes = this.getNullableGeoJSONPropertyString(feature, 'Notes')
    const geomJSON = JSON.stringify(feature.geometry)
    const existingRow =
      await getExtNaturalenglandNutrientNeutralityCatchmentsForReference(
        this.dbClient,
        { objectId: objectID }
      )
    if (!existingRow) {
      await newExtNaturalenglandNutrientNeutralityCatchmentFromGeoJSON(
        this.dbClient,
        {
          stGeomfromgeojson: geomJSON,
          popupInfo,
          n2kSiteName,
          label,
          objectId: objectID,
          dateAmended: dateAmendedTime,
          notes,
          globalId: null,
          oid_1: null
        }
      )
      return 'inserted'
    } else {
      await partialUpdateExtNaturalenglandNutrientNeutralityCatchmentsFromGeoJSON(
        this.dbClient,
        {
          geometry: geomJSON,
          popupInfo: popupInfo !== existingRow.popupInfo ? popupInfo : null,
          n2kSiteName:
            n2kSiteName !== existingRow.n2kSiteName ? n2kSiteName : null,
          label: label !== existingRow.label ? label : null,
          dateAmended:
            dateAmendedTime !== existingRow.dateAmended
              ? dateAmendedTime
              : null,
          notes: notes !== existingRow.notes ? notes : null,
          objectId: objectID,
          globalId: null,
          oid_1: null
        }
      )
      return 'updated'
    }
  }

  async truncate(): Promise<void> {
    try {
      console.info('Truncating Nutrient Neutrality Catchments data')
      await deleteAllExtNaturalenglandNutrientNeutralityCatchments(
        this.dbClient
      )
      console.info('Truncated Nutrient Neutrality Catchments data')
    } catch (err) {
      throw new Error(`Error truncating Nutrient Neutrality Catchments: ${err}`)
    }
  }

  // Helper methods for extracting properties from GeoJSON features
  private getGeoJSONPropertyInt(feature: Feature, property: string): number {
    const value = feature.properties?.[property]
    if (value === undefined || value === null) {
      throw new Error(`Property ${property} not found in GeoJSON feature`)
    }
    return Number(value)
  }

  private getNullableGeoJSONPropertyString(
    feature: Feature,
    property: string
  ): string | null {
    const value = feature.properties?.[property]
    if (value === undefined) {
      return null
    }
    return value !== null ? String(value) : null
  }

  private getNullableGeoJSONPropertyFloat(
    feature: Feature,
    property: string
  ): number | null {
    const value = feature.properties?.[property]
    if (value === undefined) {
      return null
    }
    return value !== null ? Number(value) : null
  }
}
