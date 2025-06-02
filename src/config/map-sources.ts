import {
  MapSource,
  MapSourceId,
  mapSourcesMvt
} from '@/components/googlemap/config'

const minZoomsByFeatureTypeScout = {
  polygon: 6,
  line: 10,
  point: 12
}

const minZoomLevels = {
  xxl: 6,
  xl: 8,
  lg: 9,
  md: 10,
  sm: 11,
  xs: 12,
  xxs: 14
}

export const minZoomsScout: Partial<Record<MapSourceId, number>> = {
  [MapSourceId.ExtDatagovukAncientWoodlands]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukAonb]: minZoomLevels.xl,
  [MapSourceId.ExtDatagovukBattlefields]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukBrownfieldLand]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukBuiltUpAreas]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukConservationArea]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukFloodZone]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukGreenBelt]: minZoomLevels.xl,
  [MapSourceId.ExtDatagovukListedBuildings]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukLocalAuthorities]: minZoomLevels.xl,
  [MapSourceId.ExtDatagovukLocalPlanningAuthorities]: minZoomLevels.xl,
  [MapSourceId.ExtDatagovukNationalParks]: minZoomLevels.xl,
  [MapSourceId.ExtDatagovukParishes]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukRegions]: minZoomLevels.xl,
  [MapSourceId.ExtDatagovukScheduledMonuments]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovSpecialAreasOfConservation]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukSSSIs]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovukNationalNatureReserves]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukSpecialProtectionArea]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukRamsar]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukHeritageAtRisk]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukHeritageCoast]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukHistoricParkGarden]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovukLocalNatureReserve]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovukTrees]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovukEducationalEstablishments]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovukWorldHeritageSites]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukWorldHeritageSiteBufferZones]: minZoomLevels.md,
  [MapSourceId.ExtEnvironmentagencyAlcGrades]: minZoomLevels.md,
  [MapSourceId.ExtEnvironmentagencyProvisionalAlcGrades]: minZoomLevels.md,
  [MapSourceId.ExtNaturalEnglandNutrientNeutralityCatchments]: minZoomLevels.xl,
  [MapSourceId.ExtNpgDnos]: minZoomLevels.xl,
  [MapSourceId.ExtPlanningApplications]: minZoomLevels.md,
  [MapSourceId.IntIndependentOperators]: minZoomLevels.xl,
  [MapSourceId.IntPowerlines]: minZoomLevels.xl,
  [MapSourceId.IntSubstations]: minZoomLevels.sm
}

// These are mainly views that have 'filtered' responses.
// Some of these (like flood zones) we will bring in.
// Others are 'filtered', and their filtered specific option is above.
// Some are just not appropriate for scout.
const hideFromScout: MapSourceId[] = []

export const mapSourcesScout = Object.fromEntries(
  Object.entries(mapSourcesMvt)
    .filter(([key]) => !hideFromScout.includes(key as MapSourceId))
    .map(([key, value]) => [
      key as MapSourceId,
      {
        ...value,
        minZoom:
          minZoomsScout[key as MapSourceId] ??
          minZoomsByFeatureTypeScout[value.type] ??
          14
      }
    ])
) as Record<MapSourceId, MapSource>
