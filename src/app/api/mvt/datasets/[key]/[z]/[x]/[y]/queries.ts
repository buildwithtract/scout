import * as dbQueries from '@/db'
import { Client } from 'pg'

export enum Dataset {
  ExtDatagovukLocalAuthorities = 'ext-datagovuk-local-authorities',
  ExtDatagovukLocalPlanningAuthorities = 'ext-datagovuk-local-planning-authorities',
  ExtDatagovukNationalNatureReserves = 'ext-datagovuk-national-nature-reserves',
  ExtDatagovukSpecialAreasOfConservation = 'ext-datagovuk-special-areas-of-conservation',
  ExtDatagovukAncientWoodland = 'ext-datagovuk-ancient-woodland',
  ExtDatagovukAonb = 'ext-datagovuk-aonb',
  ExtDatagovukNationalParks = 'ext-datagovuk-national-parks',
  ExtDatagovukBattlefields = 'ext-datagovuk-battlefields',
  ExtDatagovukScheduledMonuments = 'ext-datagovuk-scheduled-monuments',
  ExtDatagovukSSSIs = 'ext-datagovuk-sssis',
  ExtDatagovukFloodZone = 'ext_datagovuk_flood_risk_zones',
  ExtDatagovukGreenBelt = 'ext-datagovuk-green-belt',
  ExtDatagovukSpecialProtectionArea = 'ext-datagovuk-special-protection-area',
  ExtDatagovukRamsar = 'ext-datagovuk-ramsar',
  ExtDatagovukHeritageAtRisk = 'ext-datagovuk-heritage-at-risk',
  ExtDatagovukHeritageCoast = 'ext-datagovuk-heritage-coast',
  ExtDatagovukConservationArea = 'ext-datagovuk-conservation-area',
  ExtDatagovukHistoricParkGarden = 'ext-datagovuk-historic-park-garden',
  ExtDatagovukLocalNatureReserve = 'ext-datagovuk-local-nature-reserve',
  ExtDatagovukBuiltUpAreas = 'ext-datagovuk-built-up-areas',
  ExtDatagovukRegions = 'ext-datagovuk-regions',
  ExtDatagovukParishes = 'ext-datagovuk-parishes',
  ExtDatagovukTrees = 'ext-datagovuk-trees',
  ExtDatagovukEducationalEstablishment = 'ext-datagovuk-educational-establishment',
  ExtDatagovukWorldHeritageSiteBufferZones = 'ext-datagovuk-world-heritage-site-buffer-zones',
  ExtDatagovukWorldHeritageSites = 'ext-datagovuk-world-heritage-sites',
  ExtNaturalenglandNutrientNeutrality = 'ext-naturalengland-nutrient-neutrality-catchments',
  ExtEnvironmentagencyAlcGrades = 'ext-environmentagency-alc-grades',
  ExtEnvironmentagencyProvisionalAlcGrades = 'ext-environmentagency-provisional-alc-grades',
  ExtDatagovukListedBuildings = 'ext-datagovuk-listed-buildings',
  ExtDatagovukBrownfieldLand = 'ext-datagovuk-brownfield-land',
  ExtNpgDnos = 'ext-npg-dnos',
  ExtPlanningApplications = 'ext-planning-applications',
  IntIndependentOperators = 'int-independent-operators',
  IntPowerlines = 'int-powerlines',
  IntSubstations = 'int-substations'
}

interface TileParams {
  z: number
  x: number
  y: number
}

/**
 * Returns the appropriate query function for a given dataset key
 * @param key The dataset key enum value
 * @param params Tile parameters (z, x, y coordinates)
 * @returns A function that when executed will fetch the MVT data
 */
export function getDataset(client: Client, key: Dataset, params: TileParams) {
  const { z, x, y } = params

  switch (key) {
    case Dataset.ExtDatagovukAncientWoodland:
      return dbQueries.getExtDatagovukAncientWoodlandInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukAonb:
      return dbQueries.getExtDatagovukAonbInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukNationalParks:
      return dbQueries.getExtDatagovukNationalParksInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukBattlefields:
      return dbQueries.getExtDatagovukBattlefieldsInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukScheduledMonuments:
      return dbQueries.getExtDatagovukScheduledMonumentsInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukSSSIs:
      return dbQueries.getExtDatagovukSSSIsInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukFloodZone:
      return dbQueries.getFloodRiskZonesInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukGreenBelt:
      return dbQueries.getExtDatagovukGreenBeltInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukHeritageAtRisk:
      return dbQueries.getExtDatagovukHeritageAtRiskInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukHeritageCoast:
      return dbQueries.getExtDatagovukHeritageCoastInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukConservationArea:
      return dbQueries.getExtDatagovukConservationAreaInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukHistoricParkGarden:
      return dbQueries.getExtDatagovukHistoricParkGardenInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukLocalAuthorities:
      return dbQueries.getExtDatagovukLocalAuthoritiesInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukLocalPlanningAuthorities:
      return dbQueries.getExtDatagovukLocalPlanningAuthoritiesInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukSpecialAreasOfConservation:
      return dbQueries.getExtDatagovukSpecialAreasOfConservationInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukLocalNatureReserve:
      return dbQueries.getExtDatagovukLocalNatureReserveInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukTrees:
      return dbQueries.getExtDatagovukTreesInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukListedBuildings:
      return dbQueries.getExtDatagovukListedBuildingsInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukBrownfieldLand:
      return dbQueries.getExtDatagovukBrownfieldInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukNationalNatureReserves:
      return dbQueries.getExtDatagovukNationalNatureReservesInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukSpecialProtectionArea:
      return dbQueries.getExtDatagovukSpecialProtectionAreasInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukRamsar:
      return dbQueries.getExtDatagovukRamsarInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukEducationalEstablishment:
      return dbQueries.getExtDatagovukEducationalEstablishmentsInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukWorldHeritageSiteBufferZones:
      return dbQueries.getExtDatagovukWorldHeritageSiteBufferZonesInMvt(
        client,
        {
          z: z as number,
          x: x as number,
          y: y as number
        }
      )

    case Dataset.ExtDatagovukWorldHeritageSites:
      return dbQueries.getExtDatagovukWorldHeritageSitesInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtEnvironmentagencyAlcGrades:
      return dbQueries.getExtEnvironmentagencyAlcGradesInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtEnvironmentagencyProvisionalAlcGrades:
      return dbQueries.getExtEnvironmentagencyProvisionalAlcGradesInMvt(
        client,
        {
          z: z as number,
          x: x as number,
          y: y as number
        }
      )

    case Dataset.ExtNaturalenglandNutrientNeutrality:
      return dbQueries.getExtNaturalenglandNutrientNeutralityCatchmentsInMvt(
        client,
        {
          z: z as number,
          x: x as number,
          y: y as number
        }
      )

    case Dataset.ExtNpgDnos:
      return dbQueries.getExtNpgDnosInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukBuiltUpAreas:
      return dbQueries.getExtDatagovukBuiltUpAreasInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtPlanningApplications:
      return dbQueries.getPlanningApplicationsInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukParishes:
      return dbQueries.getExtDatagovukParishesInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.ExtDatagovukRegions:
      return dbQueries.getExtDatagovukRegionsInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.IntIndependentOperators:
      return dbQueries.getIntIndependentOperatorsInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.IntPowerlines:
      return dbQueries.getIntPowerlinesInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    case Dataset.IntSubstations:
      return dbQueries.getIntSubstationsInMvt(client, {
        z: z as number,
        x: x as number,
        y: y as number
      })

    default:
      throw new Error(`Unsupported dataset: ${key}`)
  }
}
