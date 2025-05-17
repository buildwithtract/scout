import type { PathStyleExtensionProps } from '@deck.gl/extensions'
import { Feature } from 'geojson'
import { LegendGroup } from './types'
import { hexToRgb } from './utils'

export enum MapSourceId {
  ExtDatagovukAncientWoodlands = 'ext-datagovuk-ancient-woodland',
  ExtDatagovukAonb = 'ext-datagovuk-aonb',
  ExtDatagovukBuiltUpAreas = 'ext-datagovuk-built-up-areas',
  ExtDatagovukBattlefields = 'ext-datagovuk-battlefields',
  ExtDatagovukGreenBelt = 'ext-datagovuk-green-belt',
  ExtDatagovukListedBuildings = 'ext-datagovuk-listed-buildings',
  ExtDatagovukLocalAuthorities = 'ext-datagovuk-local-authorities',
  ExtDatagovukLocalPlanningAuthorities = 'ext-datagovuk-local-planning-authorities',
  ExtDatagovukNationalParks = 'ext-datagovuk-national-parks',
  ExtDatagovukParishes = 'ext-datagovuk-parishes',
  ExtDatagovukRegions = 'ext-datagovuk-regions',
  ExtDatagovSpecialAreasOfConservation = 'ext-datagovuk-special-areas-of-conservation',
  ExtDatagovukScheduledMonuments = 'ext-datagovuk-scheduled-monuments',
  ExtDatagovukSSSIs = 'ext-datagovuk-sssis',
  ExtDatagovukWorldHeritageSites = 'ext-datagovuk-world-heritage-sites',
  ExtOsContours = 'ext-os-contours',
  ExtDatagovukFloodZone = 'ext_datagovuk_flood_risk_zones',
  ExtDatagovukNationalNatureReserves = 'ext-datagovuk-national-nature-reserves',
  ExtDatagovukWorldHeritageSiteBufferZones = 'ext-datagovuk-world-heritage-site-buffer-zones',
  ExtDatagovukBrownfieldLand = 'ext-datagovuk-brownfield-land',
  ExtDatagovukSpecialProtectionArea = 'ext-datagovuk-special-protection-area',
  ExtDatagovukRamsar = 'ext-datagovuk-ramsar',
  ExtDatagovukHeritageAtRisk = 'ext-datagovuk-heritage-at-risk',
  ExtDatagovukHeritageCoast = 'ext-datagovuk-heritage-coast',
  ExtDatagovukConservationArea = 'ext-datagovuk-conservation-area',
  ExtDatagovukHistoricParkGarden = 'ext-datagovuk-historic-park-garden',
  ExtDatagovukLocalNatureReserve = 'ext-datagovuk-local-nature-reserve',
  ExtDatagovukTrees = 'ext-datagovuk-trees',
  ExtDatagovukEducationalEstablishments = 'ext-datagovuk-educational-establishment',
  ExtEnvironmentagencyAlcGrades = 'ext-environmentagency-alc-grades',
  ExtEnvironmentagencyProvisionalAlcGrades = 'ext-environmentagency-provisional-alc-grades',
  ExtOpenstreetmapPublicRightOfWay = 'ext-openstreetmap-public-right-of-way',
  ExtOpenstreetmapPublicRightOfWayFootpath = 'ext-openstreetmap-public-right-of-way-footpath',
  ExtOpenstreetmapPublicRightOfWayBridleway = 'ext-openstreetmap-public-right-of-way-bridleway',
  ExtOpenstreetmapPublicRightOfWayByway = 'ext-openstreetmap-public-right-of-way-byway',
  ExtNaturalEnglandNutrientNeutralityCatchments = 'ext-naturalengland-nutrient-neutrality-catchments',
  ExtNpgDnos = 'ext-npg-dnos',
  ExtOpenstreetmapPublicTransportBusStop = 'ext-openstreetmap-public-transport-bus-stop',
  ExtOpenstreetmapPublicTransportTrainStation = 'ext-openstreetmap-public-transport-train-station',
  ExtOpenstreetmapHealthcareDoctor = 'ext-openstreetmap-healthcare-doctor',
  ExtPlanningApplications = 'ext-planning-applications',
  IntIndependentOperators = 'int-independent-operators',
  IntPowerlines = 'int-powerlines',
  IntSubstations = 'int-substations'
}

export const MapSourceOrder: MapSourceId[] = [
  MapSourceId.ExtDatagovukAncientWoodlands,
  MapSourceId.ExtDatagovukBattlefields,
  MapSourceId.ExtDatagovukBrownfieldLand,
  MapSourceId.ExtDatagovukBuiltUpAreas,
  MapSourceId.ExtDatagovukConservationArea,
  MapSourceId.ExtDatagovukFloodZone,
  MapSourceId.ExtDatagovukGreenBelt,
  MapSourceId.ExtDatagovukHeritageAtRisk,
  MapSourceId.ExtDatagovukHeritageCoast,
  MapSourceId.ExtDatagovukHistoricParkGarden,
  MapSourceId.ExtDatagovukLocalAuthorities,
  MapSourceId.ExtDatagovukLocalPlanningAuthorities,
  MapSourceId.ExtDatagovukLocalNatureReserve,
  MapSourceId.ExtDatagovukAonb,
  MapSourceId.ExtDatagovukNationalNatureReserves,
  MapSourceId.ExtDatagovukNationalParks,
  MapSourceId.ExtNaturalEnglandNutrientNeutralityCatchments,
  MapSourceId.ExtDatagovukParishes,
  MapSourceId.ExtDatagovukRamsar,
  MapSourceId.ExtDatagovukRegions,
  MapSourceId.ExtDatagovukScheduledMonuments,
  MapSourceId.ExtDatagovukSpecialProtectionArea,
  MapSourceId.ExtDatagovSpecialAreasOfConservation,
  MapSourceId.ExtDatagovukSSSIs,
  MapSourceId.ExtDatagovukWorldHeritageSiteBufferZones,
  MapSourceId.ExtDatagovukWorldHeritageSites,
  MapSourceId.ExtEnvironmentagencyAlcGrades,
  MapSourceId.ExtEnvironmentagencyProvisionalAlcGrades,
  MapSourceId.ExtNpgDnos,
  MapSourceId.ExtOsContours,
  MapSourceId.ExtOpenstreetmapPublicRightOfWay,
  MapSourceId.ExtOpenstreetmapPublicRightOfWayFootpath,
  MapSourceId.ExtOpenstreetmapPublicRightOfWayBridleway,
  MapSourceId.ExtOpenstreetmapPublicRightOfWayByway,
  MapSourceId.ExtDatagovukTrees,
  MapSourceId.ExtOpenstreetmapPublicTransportBusStop,
  MapSourceId.ExtOpenstreetmapPublicTransportTrainStation,
  MapSourceId.ExtDatagovukEducationalEstablishments,
  MapSourceId.ExtOpenstreetmapHealthcareDoctor,
  MapSourceId.ExtDatagovukListedBuildings,
  MapSourceId.ExtPlanningApplications,
  MapSourceId.IntIndependentOperators,
  MapSourceId.IntPowerlines,
  MapSourceId.IntSubstations
]

type MapSourceBase = {
  type: 'polygon' | 'point' | 'line'
  id: MapSourceId
  name: string
  minZoom?: number
  maxZoom?: number
  fill?: {
    layer?: string
    default: {
      color: string
      opacity: number
    }
    hover?: {
      color: string
      opacity: number
    }
    clicked?: {
      color: string
      opacity: number
    }
  }
  line?: {
    layer?: string
    default: {
      color: string
      opacity: number
      width: number
    }
    hover?: {
      color: string
      opacity: number
      width: number
    }
    clicked?: {
      color: string
      opacity: number
      width: number
    }
  }
  filled?: boolean
  pointType?: string
  stroked?: boolean
  getPointRadius?: () => number
  getText?: (f: Feature) => string
  getColor?: (f: Feature) => string
  getWidth?: (f: Feature) => number
  getTextSize?: number
  getDashArray?: PathStyleExtensionProps<Feature>['getDashArray']
}

export type MapSource =
  | (MapSourceBase & {
      sourceType: 'vector'
      url: string
    })
  | (MapSourceBase & {
      sourceType: 'geojson'
      featureCollection: GeoJSON.FeatureCollection
    })

// Global config
// ----------------------------------------------------------------------------

export const MAX_ZOOM_MAP = 17
export const MIN_ZOOM_MAP = 6
export const MIN_ZOOM_DATA = 14

export const UK_BOUNDS = {
  minLongitude: -8.65, // Western edge (includes Northern Ireland)
  maxLongitude: 1.76, // Eastern edge
  minLatitude: 49.84, // Southern edge
  maxLatitude: 60.86 // Northern edge (includes Shetland Islands)
}

// Sources
// ----------------------------------------------------------------------------

const DEFAULT_DASH_ARRAY: [number, number] = [8, 8]

export type MapSourceFoundation = Omit<
  MapSource,
  'sourceType' | 'featureCollection' | 'url'
> & {
  minZoom?: number
  maxZoom?: number
}

const mapSourceFillProperty = (
  type: 'line' | 'polygon' | 'point',
  color: string
) => {
  return {
    default: {
      color: color,
      opacity: type == 'polygon' ? 0.2 : 0.8
    },
    hover: {
      color: color,
      opacity: type == 'polygon' ? 0.3 : 1
    }
  }
}

const mapSourceLineProperty = (
  type: 'line' | 'polygon' | 'point',
  color: string
) => {
  let lineWidth = 1
  let opacityDefault = 0.7
  let opacityHover = 0.8

  if (type == 'line' || type == 'point') {
    lineWidth = 2
    opacityDefault = type == 'line' ? 1 : 0.9
    opacityHover = 1
  }

  return {
    default: {
      color: color,
      opacity: opacityDefault,
      width: lineWidth
    },
    hover: {
      color: color,
      opacity: opacityHover,
      width: lineWidth
    },
    clicked: {
      color: color,
      opacity: opacityHover,
      width: lineWidth
    }
  }
}

const mapColorProperties = ({
  type,
  fill,
  line
}: {
  type: 'line' | 'polygon' | 'point'
  fill: string
  line?: string
}) => {
  return {
    fill: mapSourceFillProperty(type, fill),
    line: mapSourceLineProperty(type, line || fill)
  }
}

const mapLayerProps = ({
  type,
  id,
  name,
  fill,
  line,
  dashed,
  getDashArray,
  getColor
}: {
  type: 'line' | 'polygon' | 'point'
  fill: string
  line?: string
  id: MapSourceId
  name: string
  dashed?: boolean
  getDashArray?: MapSourceBase['getDashArray']
  getColor?: MapSourceBase['getColor']
}) => {
  return {
    type,
    id,
    name,
    ...mapColorProperties({ type, fill: fill, line: line }),
    ...(dashed || getDashArray
      ? { getDashArray: getDashArray || DEFAULT_DASH_ARRAY }
      : {}),
    ...(getColor ? { getColor } : {})
  } as MapSourceFoundation
}

const mapSourcesBase: Record<MapSourceId, MapSourceFoundation> = {
  [MapSourceId.ExtDatagovukLocalAuthorities]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukLocalAuthorities,
    name: 'Local Authorities',
    fill: '#b8860b',
    line: '#a37509'
  }),
  [MapSourceId.ExtDatagovukLocalPlanningAuthorities]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukLocalPlanningAuthorities,
    name: 'Local Planning Authorities',
    fill: '#000000',
    line: '#000000'
  }),
  [MapSourceId.ExtDatagovukParishes]: {
    type: 'polygon',
    id: MapSourceId.ExtDatagovukParishes,
    name: 'Parishes',
    fill: {
      default: {
        color: '#6a5acd', // Slate blue color instead of green
        opacity: 0.1 // More transparent fill (was 0.2)
      },
      hover: {
        color: '#6a5acd',
        opacity: 0.2 // Slightly more opaque on hover
      }
    },
    line: {
      default: {
        color: '#483d8b', // Darker variant for the boundary
        opacity: 0.9, // Higher opacity for more visible boundaries (was 0.7)
        width: 2 // Thicker lines for more prominent boundaries (was 1)
      },
      hover: {
        color: '#483d8b',
        opacity: 1,
        width: 2
      },
      clicked: {
        color: '#483d8b',
        opacity: 1,
        width: 2
      }
    }
  },
  [MapSourceId.ExtDatagovukRegions]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukRegions,
    name: 'Regions',
    fill: '#00a1c1',
    line: '#008fbf'
  }),
  [MapSourceId.ExtEnvironmentagencyAlcGrades]: {
    ...mapLayerProps({
      type: 'polygon',
      id: MapSourceId.ExtEnvironmentagencyAlcGrades,
      name: 'ALC Grades',
      fill: '#d3d3d3',
      getColor: (feature) => {
        const raw = feature.properties.alc_grade as string
        switch (raw) {
          case '1':
            return '#006400'
          case '2':
            return '#7fff00'
          case '3a':
            return '#ffff00'
          case '3b':
            return '#ffd700'
          case '4':
            return '#ffa500'
          case '5':
            return '#8b4513'
          default:
            return '#d3d3d3'
        }
      }
    }),
    fill: {
      default: { color: '#d3d3d3', opacity: 0.4 },
      hover: { color: '#d3d3d3', opacity: 0.8 },
      clicked: { color: '#d3d3d3', opacity: 0.8 }
    },
    line: {
      default: { color: '#d3d3d3', opacity: 1, width: 2 },
      hover: { color: '#d3d3d3', opacity: 1, width: 2 },
      clicked: { color: '#d3d3d3', opacity: 1, width: 2 }
    }
  },
  [MapSourceId.ExtEnvironmentagencyProvisionalAlcGrades]: {
    ...mapLayerProps({
      type: 'polygon',
      id: MapSourceId.ExtEnvironmentagencyProvisionalAlcGrades,
      name: 'Provisional ALC Grades',
      fill: '#d3d3d3',
      getColor: (feature) => {
        const raw = feature.properties.alc_grade as string
        switch (raw) {
          case '1':
            return '#006400'
          case '2':
            return '#7fff00'
          case '3a':
            return '#ffff00'
          case '3b':
            return '#ffd700'
          case '4':
            return '#ffa500'
          case '5':
            return '#8b4513'
          default:
            return '#d3d3d3'
        }
      }
    }),
    fill: {
      default: { color: '#d3d3d3', opacity: 0.4 },
      hover: { color: '#d3d3d3', opacity: 0.8 },
      clicked: { color: '#d3d3d3', opacity: 0.8 }
    },
    line: {
      default: { color: '#d3d3d3', opacity: 1, width: 2 },
      hover: { color: '#d3d3d3', opacity: 1, width: 2 },
      clicked: { color: '#d3d3d3', opacity: 1, width: 2 }
    }
  },
  [MapSourceId.ExtDatagovukFloodZone]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukFloodZone,
    name: 'Flood Risk Zones',
    fill: '#cceeff',
    line: '#005ce6',
    getColor: (feature) => {
      const zone = feature.properties.zone ?? feature.properties.Zone
      const z = typeof zone === 'string' ? parseInt(zone, 10) : zone
      switch (z) {
        case 3:
          return '#005ce6'
        case 2:
          return '#66b2ff'
        case 1:
        default:
          return '#cceeff'
      }
    }
  }),
  [MapSourceId.ExtDatagovukNationalNatureReserves]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukNationalNatureReserves,
    name: 'National Nature Reserves',
    fill: '#531253'
  }),
  [MapSourceId.ExtDatagovSpecialAreasOfConservation]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovSpecialAreasOfConservation,
    name: 'Special Areas of Conservation',
    fill: '#9acd32',
    line: '#8bbf2e'
  }),
  [MapSourceId.ExtDatagovukAonb]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukAonb,
    name: 'National Landscape',
    fill: '#97D8B2'
  }),
  [MapSourceId.ExtDatagovukNationalParks]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukNationalParks,
    name: 'National Parks',
    fill: '#ff8c00',
    line: '#e67e00'
  }),
  [MapSourceId.ExtDatagovukBattlefields]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukBattlefields,
    name: 'Battlefields',
    fill: '#a52a2a'
  }),
  [MapSourceId.ExtDatagovukWorldHeritageSiteBufferZones]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukWorldHeritageSiteBufferZones,
    name: 'World Heritage Site Buffer Zone',
    fill: '#EE964B'
  }),
  [MapSourceId.ExtDatagovukWorldHeritageSites]: {
    type: 'polygon',
    id: MapSourceId.ExtDatagovukWorldHeritageSites,
    name: 'World Heritage Sites',
    fill: {
      default: {
        color: '#EE964B',
        opacity: 0.4 // More opaque than the default 0.2
      },
      hover: {
        color: '#EE964B',
        opacity: 0.5 // More opaque than the default 0.3
      }
    },
    line: {
      default: {
        color: '#EE964B',
        opacity: 0.8,
        width: 1
      },
      hover: {
        color: '#EE964B',
        opacity: 0.9,
        width: 1
      },
      clicked: {
        color: '#EE964B',
        opacity: 0.9,
        width: 1
      }
    }
  },
  [MapSourceId.ExtDatagovukScheduledMonuments]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukScheduledMonuments,
    name: 'Scheduled Monuments',
    fill: '#882d88'
  }),
  [MapSourceId.ExtDatagovukSSSIs]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukSSSIs,
    name: 'Sites of Special Scientific Interest',
    fill: '#00ffff',
    line: '#00e6e6'
  }),
  [MapSourceId.ExtDatagovukGreenBelt]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukGreenBelt,
    name: 'Green Belt',
    fill: '#F48498'
  }),
  [MapSourceId.ExtDatagovukAncientWoodlands]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukAncientWoodlands,
    name: 'Ancient Woodlands',
    fill: '#BEEDAA'
  }),
  [MapSourceId.ExtOsContours]: {
    ...mapLayerProps({
      type: 'line',
      id: MapSourceId.ExtOsContours,
      name: 'Contours',
      fill: '#000000'
    }),
    line: {
      default: {
        color: '#000000', // bg-[#ff0000]
        opacity: 1,
        width: 1
      }
    }
  },
  [MapSourceId.ExtDatagovukSpecialProtectionArea]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukSpecialProtectionArea,
    name: 'Special Protection Area',
    fill: '#C5D86D'
  }),
  [MapSourceId.ExtDatagovukRamsar]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukRamsar,
    name: 'Ramsar Wetland',
    fill: '#C3423F'
  }),
  [MapSourceId.ExtDatagovukHeritageAtRisk]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukHeritageAtRisk,
    name: 'Heritage at Risk',
    fill: '#F1C40F'
  }),
  [MapSourceId.ExtDatagovukHeritageCoast]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukHeritageCoast,
    name: 'Heritage Coast',
    fill: '#BCE784',
    line: '#BCE784'
  }),
  [MapSourceId.ExtDatagovukConservationArea]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukConservationArea,
    name: 'Conservation Area',
    fill: '#3388aa'
  }),
  [MapSourceId.ExtDatagovukHistoricParkGarden]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukHistoricParkGarden,
    name: 'Historic Parks and Gardens',
    fill: '#3A015C'
  }),
  [MapSourceId.ExtDatagovukLocalNatureReserve]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukLocalNatureReserve,
    name: 'Local Nature Reserves',
    fill: '#A6ECE0'
  }),
  [MapSourceId.ExtNaturalEnglandNutrientNeutralityCatchments]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtNaturalEnglandNutrientNeutralityCatchments,
    name: 'Nutrient Neutrality Catchments',
    fill: '#00ff00',
    line: '#00e600'
  }),
  [MapSourceId.ExtOpenstreetmapPublicRightOfWay]: mapLayerProps({
    type: 'line',
    id: MapSourceId.ExtOpenstreetmapPublicRightOfWay,
    name: 'Public Rights of Way',
    fill: '#ff339f'
  }),
  [MapSourceId.ExtOpenstreetmapPublicRightOfWayFootpath]: mapLayerProps({
    type: 'line',
    id: MapSourceId.ExtOpenstreetmapPublicRightOfWayFootpath,
    name: 'Public Footpath',
    fill: '#6CD4FF'
  }),
  [MapSourceId.ExtOpenstreetmapPublicRightOfWayBridleway]: mapLayerProps({
    type: 'line',
    id: MapSourceId.ExtOpenstreetmapPublicRightOfWayBridleway,
    name: 'Public Bridleway',
    fill: '#ff339f'
  }),
  [MapSourceId.ExtOpenstreetmapPublicRightOfWayByway]: mapLayerProps({
    type: 'line',
    id: MapSourceId.ExtOpenstreetmapPublicRightOfWayByway,
    name: 'Public Byway',
    fill: '#ff9f33'
  }),
  [MapSourceId.ExtDatagovukTrees]: mapLayerProps({
    type: 'point',
    id: MapSourceId.ExtDatagovukTrees,
    name: 'Tree Preservation Orders',
    fill: '#339933'
  }),
  [MapSourceId.ExtDatagovukEducationalEstablishments]: mapLayerProps({
    type: 'point',
    id: MapSourceId.ExtDatagovukEducationalEstablishments,
    name: 'Educational Establishments',
    fill: '#ff009f'
  }),
  [MapSourceId.ExtOpenstreetmapPublicTransportBusStop]: mapLayerProps({
    type: 'point',
    id: MapSourceId.ExtOpenstreetmapPublicTransportBusStop,
    name: 'Bus Stops',
    fill: '#6060ff',
    line: '#f0f0ff'
  }),
  [MapSourceId.ExtOpenstreetmapPublicTransportTrainStation]: mapLayerProps({
    type: 'point',
    id: MapSourceId.ExtOpenstreetmapPublicTransportTrainStation,
    name: 'Train Stations',
    fill: '#c2a909'
  }),
  [MapSourceId.ExtOpenstreetmapHealthcareDoctor]: mapLayerProps({
    type: 'point',
    id: MapSourceId.ExtOpenstreetmapHealthcareDoctor,
    name: 'Doctors',
    fill: '#ef2323',
    line: '#ef2323'
  }),
  [MapSourceId.ExtDatagovukListedBuildings]: mapLayerProps({
    type: 'point',
    id: MapSourceId.ExtDatagovukListedBuildings,
    name: 'Listed Buildings',
    fill: '#ff9fff',
    line: '#a56fa5'
  }),
  [MapSourceId.ExtDatagovukBrownfieldLand]: mapLayerProps({
    type: 'point',
    id: MapSourceId.ExtDatagovukBrownfieldLand,
    name: 'Brownfield Land Register',
    fill: '#ffff00',
    line: '#EAD637'
  }),
  [MapSourceId.ExtDatagovukBuiltUpAreas]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtDatagovukBuiltUpAreas,
    name: 'Built Up Areas',
    fill: '#D2FDFF',
    line: '#D2FDFF'
  }),
  [MapSourceId.ExtNpgDnos]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtNpgDnos,
    name: 'DNOs',
    fill: '#0000ff'
  }),
  [MapSourceId.ExtPlanningApplications]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.ExtPlanningApplications,
    name: 'Planning Applications',
    fill: '#ffff00',
    line: '#ffff00'
  }),
  [MapSourceId.IntIndependentOperators]: mapLayerProps({
    type: 'polygon',
    id: MapSourceId.IntIndependentOperators,
    name: 'Independent Operators',
    fill: '#ff69b4',
    line: '#ff69b4'
  }),
  [MapSourceId.IntPowerlines]: {
    type: 'line',
    id: MapSourceId.IntPowerlines,
    name: 'Powerlines',
    getColor: (feature: Feature) => {
      const voltage = feature.properties?.voltage as number | undefined
      const dno = feature.properties?.dno
      const situation = feature.properties?.situation
      console.log('Powerline properties:', { voltage, dno, situation })
      if (!voltage) {
        console.debug(`Missing voltage for powerline in DNO ${dno}`)
        return '#999999'
      }
      // Standard voltage levels in the UK:
      // LV: 230V/400V
      // HV: 11kV, 33kV
      // EHV: 132kV
      // Transmission: 275kV, 400kV
      if (voltage <= 1000) return '#D3D3D3' // Light gray for LV (230V/400V)
      if (voltage <= 11000) return '#87CEEB' // Sky blue for 11kV
      if (voltage <= 33000) return '#4169E1' // Royal blue for 33kV
      if (voltage <= 132000) return '#000080' // Navy blue for 132kV
      if (voltage <= 275000) return '#191970' // Midnight blue for 275kV
      return '#000000' // Black for 400kV
    },
    getDashArray: (feature: Feature) => {
      return feature.properties?.situation === 'Underground'
        ? DEFAULT_DASH_ARRAY
        : [0, 0]
    },
    line: {
      default: {
        color: '#4169E1', // Default color (will be overridden by getColor)
        opacity: 1,
        width: 2
      },
      hover: {
        color: '#4169E1', // Default color (will be overridden by getColor)
        opacity: 1,
        width: 3
      }
    },
    getWidth: (feature: Feature) => {
      const voltage = feature.properties?.voltage as number | undefined
      if (!voltage) return 1
      if (voltage <= 11000) return 1
      if (voltage <= 132000) return 2
      return 3
    }
  },
  [MapSourceId.IntSubstations]: mapLayerProps({
    type: 'point',
    id: MapSourceId.IntSubstations,
    name: 'Substations',
    fill: '#e93e3a',
    line: '#e93e3a'
  })
}

const sortedMapSourcesBase = Object.fromEntries(
  Object.entries(mapSourcesBase).sort(([keyA], [keyB]) => {
    const orderA = MapSourceOrder.indexOf(keyA as MapSourceId)
    const orderB = MapSourceOrder.indexOf(keyB as MapSourceId)

    if (orderA !== -1 && orderB !== -1) {
      return orderA - orderB
    }
    if (orderA !== -1) return -1
    if (orderB !== -1) return 1

    return 0
  })
)

export const mapSources = Object.fromEntries(
  Object.entries(sortedMapSourcesBase).map(([key, value]) => [
    key as MapSourceId,
    {
      ...value,
      ...(!value.minZoom ? { minZoom: 6 } : {}),
      ...(!value.maxZoom ? { maxZoom: MAX_ZOOM_MAP } : {})
    }
  ])
) as Record<MapSourceId, MapSource>

export const mapSourcesMvt = Object.fromEntries(
  Object.entries(mapSources).map(([key, value]) => [
    key as MapSourceId,
    {
      ...value,
      sourceType: 'vector',
      url: `/api/mvt/datasets/${key}/{z}/{x}/{y}`
    }
  ])
) as Record<MapSourceId, MapSource>

export const getMapSourceRgba = (mapSource: MapSourceFoundation) => {
  const bgRgb = mapSource.fill?.default.color
    ? hexToRgb(mapSource.fill?.default.color)
    : undefined
  const bgRgba = !bgRgb
    ? undefined
    : `rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, ${mapSource.fill?.default.opacity ?? '0.5'})`

  const lineRgb = mapSource.line?.default.color
    ? hexToRgb(mapSource.line?.default.color)
    : undefined
  const lineRgba = !lineRgb
    ? undefined
    : `rgba(${lineRgb[0]}, ${lineRgb[1]}, ${lineRgb[2]}, ${mapSource.line?.default.opacity ?? '1'})`

  return {
    line: lineRgba,
    bg: bgRgba
  }
}

export const planningDesignationGroup: LegendGroup = {
  name: 'Planning Designations',
  keys: [
    MapSourceId.ExtDatagovukAonb,
    MapSourceId.ExtDatagovukAncientWoodlands,
    MapSourceId.ExtDatagovukBattlefields,
    MapSourceId.ExtDatagovukBrownfieldLand,
    MapSourceId.ExtDatagovukBuiltUpAreas,
    MapSourceId.ExtDatagovukConservationArea,
    MapSourceId.ExtDatagovukFloodZone,
    MapSourceId.ExtDatagovukGreenBelt,
    MapSourceId.ExtDatagovukHeritageAtRisk,
    MapSourceId.ExtDatagovukHeritageCoast,
    MapSourceId.ExtDatagovukHistoricParkGarden,
    MapSourceId.ExtDatagovukListedBuildings,
    MapSourceId.ExtDatagovukLocalAuthorities,
    MapSourceId.ExtDatagovukLocalPlanningAuthorities,
    MapSourceId.ExtDatagovukLocalNatureReserve,
    MapSourceId.ExtDatagovukNationalNatureReserves,
    MapSourceId.ExtDatagovukNationalParks,
    MapSourceId.ExtNaturalEnglandNutrientNeutralityCatchments,
    MapSourceId.ExtDatagovukParishes,
    MapSourceId.ExtPlanningApplications,
    MapSourceId.ExtDatagovukRamsar,
    MapSourceId.ExtDatagovukRegions,
    MapSourceId.ExtDatagovukScheduledMonuments,
    MapSourceId.ExtDatagovSpecialAreasOfConservation,
    MapSourceId.ExtDatagovukSpecialProtectionArea,
    MapSourceId.ExtDatagovukSSSIs,
    MapSourceId.ExtDatagovukTrees,
    MapSourceId.ExtDatagovukWorldHeritageSites,
    MapSourceId.ExtDatagovukWorldHeritageSiteBufferZones,
    MapSourceId.ExtEnvironmentagencyAlcGrades,
    MapSourceId.ExtEnvironmentagencyProvisionalAlcGrades
  ]
}

export const gridInfrastructureGroup: LegendGroup = {
  name: 'Grid Infrastructure',
  keys: [
    MapSourceId.ExtNpgDnos,
    MapSourceId.IntIndependentOperators,
    MapSourceId.IntSubstations,
    MapSourceId.IntPowerlines
  ]
}

export const amenityGroup: LegendGroup = {
  name: 'Amenities',
  keys: [
    MapSourceId.ExtOpenstreetmapHealthcareDoctor,
    MapSourceId.ExtDatagovukEducationalEstablishments,
    MapSourceId.ExtOpenstreetmapPublicTransportBusStop,
    MapSourceId.ExtOpenstreetmapPublicTransportTrainStation
  ]
}

export const sortByMapSourceOrder = (
  keyA: MapSourceId,
  keyB: MapSourceId,
  order: MapSourceId[] = MapSourceOrder
): number => {
  const orderA = order.indexOf(keyA)
  const orderB = order.indexOf(keyB)

  if (orderA !== -1 && orderB !== -1) {
    return orderA - orderB
  }
  if (orderA !== -1) return -1
  if (orderB !== -1) return 1

  // Fall back to alphabetical sorting
  return mapSources[keyA].name > mapSources[keyB].name ? 1 : -1
}
