import { getDbClient } from '@/db/singleton-client'
import { ExtDatagovukAncientWoodland } from '@/fetchers/ext_datagovuk_ancient_woodland'
import { ExtDatagovukAonb } from '@/fetchers/ext_datagovuk_aonb'
import { ExtDatagovukBattlefields } from '@/fetchers/ext_datagovuk_battlefields'
import { ExtDatagovukBrownfield } from '@/fetchers/ext_datagovuk_brownfield'
import { ExtDatagovukBuiltUpAreas } from '@/fetchers/ext_datagovuk_built_up_areas'
import { ExtDatagovukConservationArea } from '@/fetchers/ext_datagovuk_conservation_area'
import { ExtDatagovukEducationalEstablishment } from '@/fetchers/ext_datagovuk_educational_establishment'
import { ExtDatagovukFloodRiskZones } from '@/fetchers/ext_datagovuk_flood_risk_zones'
import { ExtDatagovukGreenBelt } from '@/fetchers/ext_datagovuk_green_belt'
import { ExtDatagovukHeritageAtRisk } from '@/fetchers/ext_datagovuk_heritage_at_risk'
import { ExtDatagovukHeritageCoast } from '@/fetchers/ext_datagovuk_heritage_coast'
import { ExtDatagovukHistoricParkGarden } from '@/fetchers/ext_datagovuk_historic_park_garden'
import { ExtDatagovukListedBuilding } from '@/fetchers/ext_datagovuk_listed_buildings'
import { ExtDatagovukLocalAuthorities } from '@/fetchers/ext_datagovuk_local_authorities'
import { ExtDatagovukLocalNatureReserves } from '@/fetchers/ext_datagovuk_local_nature_reserves'
import { ExtDatagovukLocalPlanningAuthorities } from '@/fetchers/ext_datagovuk_local_planning_authorities'
import { ExtDatagovukNationalNatureReserves } from '@/fetchers/ext_datagovuk_national_nature_reserves'
import { ExtDatagovukNationalParks } from '@/fetchers/ext_datagovuk_national_parks'
import { ExtDatagovukParishes } from '@/fetchers/ext_datagovuk_parishes'
import { ExtDatagovukRamsar } from '@/fetchers/ext_datagovuk_ramsar'
import { ExtDatagovukRegions } from '@/fetchers/ext_datagovuk_regions'
import { ExtDatagovukScheduledMonuments } from '@/fetchers/ext_datagovuk_scheduled_monuments'
import { ExtDatagovukSpecialAreasOfConservation } from '@/fetchers/ext_datagovuk_special_areas_of_conservation'
import { ExtDatagovukSpecialProtectionArea } from '@/fetchers/ext_datagovuk_special_protection_area'
import { ExtDatagovukSSSI } from '@/fetchers/ext_datagovuk_sssi'
import { ExtDatagovukTrees } from '@/fetchers/ext_datagovuk_trees'
import { ExtDatagovukWorldHeritageSites } from '@/fetchers/ext_datagovuk_world_heritage_sites'
import { ExtEnvironmentagencyAlcGrades } from '@/fetchers/ext_environmentagency_alc_grades'
import { ExtEnvironmentagencyProvisionalAlcGrades } from '@/fetchers/ext_environmentagency_provisional_alc_grades'
import { ExtEnw11kvOverheadLines } from '@/fetchers/ext_enw_11kv_overhead_lines'
import { ExtEnw132kvOverheadLines } from '@/fetchers/ext_enw_132kv_overhead_lines'
import { ExtEnw33kvOverheadLines } from '@/fetchers/ext_enw_33kv_overhead_lines'
import { ExtEnw6Point6kvOverheadLines } from '@/fetchers/ext_enw_6_6kv_overhead_lines'
import { ExtEnwLowVoltageOverheadLines } from '@/fetchers/ext_enw_low_voltage_overhead_lines'
import { ExtEnwSubstations } from '@/fetchers/ext_enw_substations'
import { NutrientNeutralityCatchmentsFetcher } from '@/fetchers/ext_naturalengland_nutrient_neutrality_catchments'
import { ExtNgetOverheadLines } from '@/fetchers/ext_nget_overhead_lines'
import { ExtNgetSubstations } from '@/fetchers/ext_nget_substations'
import { ExtNgetTowers } from '@/fetchers/ext_nget_towers'
import { ExtNpgDnos } from '@/fetchers/ext_npg_dnos'
import { ExtNpgExtraHighVoltageLines } from '@/fetchers/ext_npg_extra_high_voltage_lines'
import { ExtNpgHighVoltageOverheadLines } from '@/fetchers/ext_npg_high_voltage_overhead_lines'
import { ExtNpgIndependentOperators } from '@/fetchers/ext_npg_independent_operators'
import { ExtNpgLowVoltageOverheadLines } from '@/fetchers/ext_npg_low_voltage_overhead_lines'
import { ExtNpgSubstations } from '@/fetchers/ext_npg_substations'
import { ExtSsenTransmissionOverheadLineGrid } from '@/fetchers/ext_ssen_transmission_overhead_line_grid'
import { ExtSsenTransmissionOverheadLineSupergrid } from '@/fetchers/ext_ssen_transmission_overhead_line_supergrid'
import { ExtSsenTransmissionSubstationsGrid } from '@/fetchers/ext_ssen_transmission_substations_grid'
import { ExtSsenTransmissionSubstationsSupergrid } from '@/fetchers/ext_ssen_transmission_substations_supergrid'
import { ExtUkpn132kvOverheadLines } from '@/fetchers/ext_ukpn_132kv_overhead_lines'
import { ExtUkpn33kvOverheadLines } from '@/fetchers/ext_ukpn_33kv_overhead_lines'
import { ExtUkpn66kvOverheadLines } from '@/fetchers/ext_ukpn_66kv_overhead_lines'
import { ExtUkpnHighVoltageOverheadLines } from '@/fetchers/ext_ukpn_high_voltage_overhead_lines'
import { ExtUkpnIndependentOperators } from '@/fetchers/ext_ukpn_independent_operators'
import { ExtUkpnSubstations } from '@/fetchers/ext_ukpn_substations'
import { IntIndependentOperators } from '@/fetchers/int_independent_operators'
import { IntPowerlines } from '@/fetchers/int_powerlines'
import { IntSubstations } from '@/fetchers/int_substations'
import chalk from 'chalk'

const dbClient = await getDbClient()

function getFetcherName(FetcherClass: any) {
  return new FetcherClass(dbClient).name
}

// Add this type for the fetchers object
interface FetcherRegistry {
  [key: string]: any
}

export const fetchers: FetcherRegistry = {
  [getFetcherName(ExtDatagovukAncientWoodland)]: ExtDatagovukAncientWoodland,
  [getFetcherName(ExtDatagovukAonb)]: ExtDatagovukAonb,
  [getFetcherName(ExtDatagovukBattlefields)]: ExtDatagovukBattlefields,
  [getFetcherName(ExtDatagovukBrownfield)]: ExtDatagovukBrownfield,
  [getFetcherName(ExtDatagovukBuiltUpAreas)]: ExtDatagovukBuiltUpAreas,
  [getFetcherName(ExtDatagovukConservationArea)]: ExtDatagovukConservationArea,
  [getFetcherName(ExtDatagovukEducationalEstablishment)]:
    ExtDatagovukEducationalEstablishment,
  [getFetcherName(ExtDatagovukFloodRiskZones)]: ExtDatagovukFloodRiskZones,
  [getFetcherName(ExtDatagovukGreenBelt)]: ExtDatagovukGreenBelt,
  [getFetcherName(ExtDatagovukHeritageAtRisk)]: ExtDatagovukHeritageAtRisk,
  [getFetcherName(ExtDatagovukHeritageCoast)]: ExtDatagovukHeritageCoast,
  [getFetcherName(ExtDatagovukHistoricParkGarden)]:
    ExtDatagovukHistoricParkGarden,
  [getFetcherName(ExtDatagovukListedBuilding)]: ExtDatagovukListedBuilding,
  [getFetcherName(ExtDatagovukLocalAuthorities)]: ExtDatagovukLocalAuthorities,
  [getFetcherName(ExtDatagovukLocalNatureReserves)]:
    ExtDatagovukLocalNatureReserves,
  [getFetcherName(ExtDatagovukLocalPlanningAuthorities)]:
    ExtDatagovukLocalPlanningAuthorities,
  [getFetcherName(ExtDatagovukNationalNatureReserves)]:
    ExtDatagovukNationalNatureReserves,
  [getFetcherName(ExtDatagovukNationalParks)]: ExtDatagovukNationalParks,
  [getFetcherName(ExtDatagovukParishes)]: ExtDatagovukParishes,
  [getFetcherName(ExtDatagovukRamsar)]: ExtDatagovukRamsar,
  [getFetcherName(ExtDatagovukRegions)]: ExtDatagovukRegions,
  [getFetcherName(ExtDatagovukScheduledMonuments)]:
    ExtDatagovukScheduledMonuments,
  [getFetcherName(ExtDatagovukSpecialAreasOfConservation)]:
    ExtDatagovukSpecialAreasOfConservation,
  [getFetcherName(ExtDatagovukSpecialProtectionArea)]:
    ExtDatagovukSpecialProtectionArea,
  [getFetcherName(ExtDatagovukSSSI)]: ExtDatagovukSSSI,
  [getFetcherName(ExtDatagovukTrees)]: ExtDatagovukTrees,
  [getFetcherName(ExtDatagovukWorldHeritageSites)]:
    ExtDatagovukWorldHeritageSites,
  [getFetcherName(ExtEnvironmentagencyAlcGrades)]:
    ExtEnvironmentagencyAlcGrades,
  [getFetcherName(ExtEnvironmentagencyProvisionalAlcGrades)]:
    ExtEnvironmentagencyProvisionalAlcGrades,
  [getFetcherName(ExtEnwSubstations)]: ExtEnwSubstations,
  [getFetcherName(ExtEnwLowVoltageOverheadLines)]:
    ExtEnwLowVoltageOverheadLines,
  [getFetcherName(ExtEnw6Point6kvOverheadLines)]: ExtEnw6Point6kvOverheadLines,
  [getFetcherName(ExtEnw11kvOverheadLines)]: ExtEnw11kvOverheadLines,
  [getFetcherName(ExtEnw33kvOverheadLines)]: ExtEnw33kvOverheadLines,
  [getFetcherName(ExtEnw132kvOverheadLines)]: ExtEnw132kvOverheadLines,
  [getFetcherName(ExtNgetOverheadLines)]: ExtNgetOverheadLines,
  [getFetcherName(ExtNgetSubstations)]: ExtNgetSubstations,
  [getFetcherName(ExtNgetTowers)]: ExtNgetTowers,
  [getFetcherName(ExtNpgDnos)]: ExtNpgDnos,
  [getFetcherName(ExtNpgIndependentOperators)]: ExtNpgIndependentOperators,
  [getFetcherName(ExtNpgExtraHighVoltageLines)]: ExtNpgExtraHighVoltageLines,
  [getFetcherName(ExtNpgHighVoltageOverheadLines)]:
    ExtNpgHighVoltageOverheadLines,
  [getFetcherName(ExtNpgLowVoltageOverheadLines)]:
    ExtNpgLowVoltageOverheadLines,
  [getFetcherName(ExtNpgSubstations)]: ExtNpgSubstations,
  [getFetcherName(NutrientNeutralityCatchmentsFetcher)]:
    NutrientNeutralityCatchmentsFetcher,
  [getFetcherName(ExtSsenTransmissionOverheadLineSupergrid)]:
    ExtSsenTransmissionOverheadLineSupergrid,
  [getFetcherName(ExtSsenTransmissionOverheadLineGrid)]:
    ExtSsenTransmissionOverheadLineGrid,
  [getFetcherName(ExtSsenTransmissionSubstationsSupergrid)]:
    ExtSsenTransmissionSubstationsSupergrid,
  [getFetcherName(ExtSsenTransmissionSubstationsGrid)]:
    ExtSsenTransmissionSubstationsGrid,
  [getFetcherName(ExtUkpn33kvOverheadLines)]: ExtUkpn33kvOverheadLines,
  [getFetcherName(ExtUkpn66kvOverheadLines)]: ExtUkpn66kvOverheadLines,
  [getFetcherName(ExtUkpn132kvOverheadLines)]: ExtUkpn132kvOverheadLines,
  [getFetcherName(ExtUkpnHighVoltageOverheadLines)]:
    ExtUkpnHighVoltageOverheadLines,
  [getFetcherName(ExtUkpnIndependentOperators)]: ExtUkpnIndependentOperators,
  [getFetcherName(ExtUkpnSubstations)]: ExtUkpnSubstations,
  [getFetcherName(IntPowerlines)]: IntPowerlines,
  [getFetcherName(IntSubstations)]: IntSubstations,
  [getFetcherName(IntIndependentOperators)]: IntIndependentOperators
}

export const fetchDataset = async (fetcherName: string) => {
  const fetcherClass = fetchers[fetcherName]
  if (!fetcherClass) {
    console.error(chalk.red(`Fetcher ${fetcherName} not found`))
    process.exit(1)
  }
  console.debug(`Fetching ${fetcherName} if required`)
  const fetcher = new fetcherClass(dbClient)
  await fetcher.fetchIfRequired()
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error(
      chalk.red(
        'No fetcher provided, see `bun run list-fetchers` for a list of available fetchers'
      )
    )
    process.exit(1)
  }

  const fetcherNames = args.filter((arg) => !arg.startsWith('--'))
  console.info(chalk.green('Running fetchers:'), fetcherNames)

  for (const fetcherName of fetcherNames) {
    await fetchDataset(fetcherName)
  }

  console.info(chalk.green('Done!'))
  process.exit(0)
}

if (require.main === module) {
  await main()
}
