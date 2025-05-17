import {
  deleteAllExtDatagovukBrownfields,
  getExtDatagovukBrownfieldForReference,
  getExtDatagovukBrownfieldLatestImport,
  newExtDatagovukBrownfieldFromWGS84,
  partialUpdateExtDatagovukBrownfieldForReference
} from '@/db'
import { Client } from 'pg'
import { DatagovukFetcher } from './ext_datagovuk'

export class ExtDatagovukBrownfield extends DatagovukFetcher<any> {
  name = 'ext-datagovuk-brownfield'

  constructor(dbClient: Client) {
    super(dbClient, 'brownfield-land')
  }

  protected async getLatestImportDate(): Promise<Date> {
    const result = await getExtDatagovukBrownfieldLatestImport(this.dbClient)
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
    const organisationEntity = feature.properties?.['organisation-entity']
    const address = feature.properties?.['site-address'] || null
    const notes = feature.properties?.notes || null
    const ownershipStatus = feature.properties?.['ownership-status'] || null
    const minimumNetDwellings =
      feature.properties?.['minimum-net-dwellings'] || null
    const maximumNetDwellings =
      feature.properties?.['maximum-net-dwellings'] || null
    const planningPermissionDateStr =
      feature.properties?.['planning-permission-date']
    let planningPermissionDate: Date | null = null
    if (planningPermissionDateStr) {
      try {
        planningPermissionDate = new Date(planningPermissionDateStr)
        if (isNaN(planningPermissionDate.getTime())) {
          planningPermissionDate = null
        }
      } catch {
        console.warn(
          `Invalid planning-permission-date: ${planningPermissionDateStr}, ignoring`
        )
      }
    }
    const planningPermissionType =
      feature.properties?.['planning-permission-type'] || null
    const planningPermissionStatus =
      feature.properties?.['planning-permission-status'] || null
    const existingFeature = await getExtDatagovukBrownfieldForReference(
      this.dbClient,
      { reference }
    )
    const geometry = JSON.stringify(feature.geometry)
    if (!existingFeature) {
      await newExtDatagovukBrownfieldFromWGS84(this.dbClient, {
        geometry,
        reference,
        name,
        organisationEntity,
        address,
        notes,
        ownershipStatus,
        minimumNetDwellings,
        maximumNetDwellings,
        planningPermissionDate,
        planningPermissionType,
        planningPermissionStatus
      })
      return 'inserted'
    } else {
      await partialUpdateExtDatagovukBrownfieldForReference(this.dbClient, {
        reference,
        geometry,
        name: name !== existingFeature.name ? name : null,
        address: address !== existingFeature.address ? address : null,
        notes: notes !== existingFeature.notes ? notes : null,
        ownershipStatus:
          ownershipStatus !== existingFeature.ownershipStatus
            ? ownershipStatus
            : null,
        minimumNetDwellings:
          minimumNetDwellings !== existingFeature.minimumNetDwellings
            ? minimumNetDwellings
            : null,
        maximumNetDwellings:
          maximumNetDwellings !== existingFeature.maximumNetDwellings
            ? maximumNetDwellings
            : null,
        planningPermissionDate: !this.datesEqual(
          planningPermissionDate,
          existingFeature.planningPermissionDate
        )
          ? planningPermissionDate
          : null,
        planningPermissionType:
          planningPermissionType !== existingFeature.planningPermissionType
            ? planningPermissionType
            : null,
        planningPermissionStatus:
          planningPermissionStatus !== existingFeature.planningPermissionStatus
            ? planningPermissionStatus
            : null
      })
      return 'updated'
    }
  }

  private datesEqual(date1: Date | null, date2: Date | null): boolean {
    if (date1 === null && date2 === null) return true
    if (date1 === null || date2 === null) return false
    return date1.getTime() === date2.getTime()
  }

  async truncate(): Promise<void> {
    console.info('Truncating brownfield land data')
    try {
      await deleteAllExtDatagovukBrownfields(this.dbClient)
      console.info('Truncated brownfield land data')
    } catch (error) {
      throw new Error(
        `Error deleting brownfields: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
