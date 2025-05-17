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
  [MapSourceId.ExtDatagovukAonb]: minZoomLevels.xxl,
  [MapSourceId.ExtDatagovukAncientWoodlands]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukBattlefields]: minZoomLevels.lg,
  [MapSourceId.ExtDatagovukBrownfieldLand]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukBuiltUpAreas]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukConservationArea]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukFloodZone]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukGreenBelt]: minZoomLevels.xxl,
  [MapSourceId.ExtDatagovukListedBuildings]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukLocalAuthorities]: minZoomLevels.lg,
  [MapSourceId.ExtDatagovukLocalPlanningAuthorities]: minZoomLevels.lg,
  [MapSourceId.ExtDatagovukNationalParks]: minZoomLevels.xxl,
  [MapSourceId.ExtDatagovukParishes]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukRegions]: minZoomLevels.xxl,
  [MapSourceId.ExtDatagovukScheduledMonuments]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovSpecialAreasOfConservation]: minZoomLevels.lg,
  [MapSourceId.ExtDatagovukSSSIs]: minZoomLevels.md,
  [MapSourceId.ExtOsContours]: minZoomLevels.xxs,
  [MapSourceId.ExtDatagovukNationalNatureReserves]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukSpecialProtectionArea]: minZoomLevels.lg,
  [MapSourceId.ExtDatagovukRamsar]: minZoomLevels.lg,
  [MapSourceId.ExtDatagovukHeritageAtRisk]: minZoomLevels.md,
  [MapSourceId.ExtDatagovukHeritageCoast]: minZoomLevels.lg,
  [MapSourceId.ExtDatagovukHistoricParkGarden]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovukLocalNatureReserve]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovukTrees]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovukEducationalEstablishments]: minZoomLevels.sm,
  [MapSourceId.ExtDatagovukWorldHeritageSites]: minZoomLevels.lg,
  [MapSourceId.ExtDatagovukWorldHeritageSiteBufferZones]: minZoomLevels.lg,
  [MapSourceId.ExtEnvironmentagencyAlcGrades]: minZoomLevels.lg,
  [MapSourceId.ExtEnvironmentagencyProvisionalAlcGrades]: minZoomLevels.lg,
  [MapSourceId.ExtOpenstreetmapPublicRightOfWayFootpath]: minZoomLevels.md,
  [MapSourceId.ExtOpenstreetmapPublicRightOfWayBridleway]: minZoomLevels.md,
  [MapSourceId.ExtOpenstreetmapPublicRightOfWayByway]: minZoomLevels.md,
  [MapSourceId.ExtNaturalEnglandNutrientNeutralityCatchments]: minZoomLevels.xl,
  [MapSourceId.ExtOpenstreetmapPublicRightOfWay]: minZoomLevels.xxs,
  [MapSourceId.ExtOpenstreetmapPublicTransportBusStop]: minZoomLevels.sm,
  [MapSourceId.ExtOpenstreetmapPublicTransportTrainStation]: minZoomLevels.sm,
  [MapSourceId.ExtOpenstreetmapHealthcareDoctor]: minZoomLevels.sm,
  [MapSourceId.ExtNpgDnos]: minZoomLevels.xxl,
  [MapSourceId.ExtPlanningApplications]: minZoomLevels.md,
  [MapSourceId.IntIndependentOperators]: minZoomLevels.xxl,
  [MapSourceId.IntPowerlines]: minZoomLevels.xxl,
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
