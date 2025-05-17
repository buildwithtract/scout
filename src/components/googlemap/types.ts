import { Feature } from 'geojson'
import { MapSourceId } from './config'

export type FeatureInfoBoxProps = {
  feature: Feature & { mapSourceId: MapSourceId }
  onClose: () => void
}

export type LegendGroup = {
  name: string
  keys: MapSourceId[]
}
