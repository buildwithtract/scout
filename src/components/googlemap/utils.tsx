import {
  Accessor,
  Color,
  FlyToInterpolator,
  Layer,
  MapViewState,
  WebMercatorViewport
} from 'deck.gl'
import type { Feature, Geometry } from 'geojson'
import { MapSource } from './config'

export const hexToRgb = (hex: string): [number, number, number] => {
  const hexString = hex.replace(/^#/, '')
  const num = parseInt(hexString, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

const DEFAULT_COLOR = hexToRgb('#000000')

export type StylePropertyAccessor<C> = (
  hoveredId: string | null,
  clickedId: string | null
) => Accessor<Feature<Geometry, { uuid: string }>, C>

export function getStylePropertyAccessor<C>(
  source: MapSource,
  key: 'fill' | 'line',
  property: 'color' | 'width' = 'color'
): StylePropertyAccessor<C> {
  if (key === 'fill' && property === 'width') {
    throw new Error('fill style cannot have a width property')
  }

  if (property === 'width') {
    const hoverWidth = (source[key]?.hover || (source[key]?.default as any))
      .width
    const clickWidth = (source[key]?.clicked || (source[key]?.default as any))
      .width
    const defaultWidth = (source[key]?.default as any).width

    return (hoveredId: string | null, clickedId: string | null) =>
      ({ properties }) => {
        if (properties.uuid === clickedId) {
          return clickWidth
        }

        if (properties.uuid === hoveredId) {
          return hoverWidth
        }

        return defaultWidth
      }
  }

  const hoverOpacity = Math.floor(
    (source[key]?.hover?.opacity ?? source[key]?.default.opacity ?? 1) * 255
  )
  const clickOpacity = Math.floor(
    (source[key]?.clicked?.opacity ?? source[key]?.default.opacity ?? 1) * 255
  )
  const defaultOpacity = Math.floor((source[key]?.default.opacity ?? 1) * 255)

  if (typeof source.getColor === 'function') {
    return (hoveredId: string | null, clickedId: string | null) =>
      (feature: Feature<Geometry, { uuid: string }>) => {
        const colorHex = source.getColor(feature)
        const baseRgb =
          typeof colorHex === 'string' ? hexToRgb(colorHex) : colorHex
        if (feature.properties.uuid === clickedId) {
          return [...baseRgb, clickOpacity] as C
        }
        if (feature.properties.uuid === hoveredId) {
          return [...baseRgb, hoverOpacity] as C
        }
        return [...baseRgb, defaultOpacity] as C
      }
  }

  const hoverColor =
    source[key]?.hover?.color ?? source[key]?.default.color ?? DEFAULT_COLOR
  const clickColor =
    source[key]?.clicked?.color ?? source[key]?.default.color ?? DEFAULT_COLOR
  const defaultColor = source[key]?.default.color ?? DEFAULT_COLOR

  const defaultC =
    typeof defaultColor == 'string' ? hexToRgb(defaultColor) : defaultColor

  const hoverC =
    typeof hoverColor == 'string' ? hexToRgb(hoverColor) : hoverColor

  const clickC =
    typeof clickColor == 'string' ? hexToRgb(clickColor) : clickColor

  const hoverRgba = [...hoverC, hoverOpacity] as Color
  const clickRgba = [...clickC, clickOpacity] as Color
  const defaultRgba = [...defaultC, defaultOpacity] as Color

  return (hoveredId: string | null, clickedId: string | null) =>
    ({ properties }: Feature<Geometry, { uuid: string }>) => {
      if (properties.uuid === clickedId) {
        return clickRgba as C
      }

      if (properties.uuid === hoveredId) {
        return hoverRgba as C
      }

      return defaultRgba as C
    }
}

export const ZOOM_TO_FEATURE_PADDING = 100
export const ZOOM_TO_FEATURE_TRANSITION_DURATION = 300
/*
(
  (MINX, MINY),
  (MINX, MAXY),
  (MAXX, MAXY),
  (MAXX, MINY),
  (MINX, MINY)
)
  */

export const getViewStateZoomedToFeature = (
  layer: Layer,
  bounds: [number, number][],
  zoomToFeatureOffset: number
): MapViewState => {
  const southWest: [number, number] = bounds[0]
  const northEast: [number, number] = bounds[2]

  const viewport = layer.context.viewport as WebMercatorViewport

  const minZoom = 6

  const { longitude, latitude, zoom } = viewport.fitBounds(
    [southWest, northEast],
    { padding: ZOOM_TO_FEATURE_PADDING }
  )

  const zoomLevel = (zoom >= minZoom ? zoom : minZoom) + zoomToFeatureOffset

  return {
    longitude,
    latitude,
    zoom: zoomLevel,
    transitionDuration: ZOOM_TO_FEATURE_TRANSITION_DURATION,
    transitionInterpolator: new FlyToInterpolator()
  }
}
