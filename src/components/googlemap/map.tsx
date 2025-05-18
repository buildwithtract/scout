'use client'
import { PathStyleExtension } from '@deck.gl/extensions'
import DeckGL from '@deck.gl/react'
import { load } from '@loaders.gl/core'
import { Map } from '@vis.gl/react-google-maps'
import {
  Color,
  Deck,
  DeckGLProps,
  DeckProps,
  GeoJsonLayer,
  LinearInterpolator,
  MapViewState,
  MVTLayer
} from 'deck.gl'
import { MapPin } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HoveredFeature, HoverInfoBox } from '../hover-info-box'
import {
  MapSource,
  MapSourceId,
  MAX_ZOOM_MAP,
  MIN_ZOOM_DATA,
  MIN_ZOOM_MAP,
  UK_BOUNDS
} from './config'
import { FeatureInfoBoxProps } from './types'
import {
  getStylePropertyAccessor,
  getViewStateZoomedToFeature,
  StylePropertyAccessor
} from './utils'

export type GoogleMapProps = {
  data: {
    sources?: MapSource[]
  }
  state: {
    initialViewState?: DeckProps['initialViewState']
  }
  callbacks: {
    onUpdateViewState?: (viewState: MapViewState | null | undefined) => void
  }
  infoBoxComponent?: React.ComponentType<FeatureInfoBoxProps>
}

type LayerSharedProperties = Partial<
  ConstructorParameters<typeof GeoJsonLayer<{ uuid: string }>>[0] &
    ConstructorParameters<typeof MVTLayer<{ uuid: string }>>[0]
>

export const GetBoundsZoomLevel = (
  bounds: {
    ne: {
      lat: number
      lng: number
    }
    sw: {
      lat: number
      lng: number
    }
  },
  mapDim: { width: number; height: number }
) => {
  const WORLD_DIM = { height: 256, width: 256 }

  function latRad(lat: number) {
    const sin = Math.sin((lat * Math.PI) / 180)
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
  }

  function zoom(mapPx: number, worldPx: number, fraction: number) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
  }

  const ne = bounds.ne
  const sw = bounds.sw

  const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI

  const lngDiff = ne.lng - sw.lng
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360

  const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction)
  const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction)

  return Math.min(latZoom, lngZoom, MAX_ZOOM_MAP)
}

export type TractMapProps = GoogleMapProps & {
  showResetButton?: boolean
  // Additional props for the DeckGL component
  additionalDeckGLProps?: Omit<DeckGLProps, 'initialViewState'>
  zoomToFeatureOffset?: number
  showAnnotations?: boolean
}

export const GoogleMap = ({
  data: { sources = [] } = {
    sources: []
  },
  state: { initialViewState } = {},
  callbacks: { onUpdateViewState } = {},
  showResetButton = false,
  additionalDeckGLProps,
  zoomToFeatureOffset = 0,
  infoBoxComponent: InfoBoxComponent
}: TractMapProps) => {
  const initState = useMemo(() => {
    return { ...initialViewState, maxZoom: MAX_ZOOM_MAP } as MapViewState
  }, [initialViewState])

  const [viewState, setViewState] = useState<
    DeckProps['viewState'] | undefined
  >(initialViewState)

  const [initialVState, setInitialVState] = useState<
    DeckProps['viewState'] | undefined
  >()

  const containerRef = useRef<HTMLDivElement>(null)

  const [containerSize, setContainerSize] = useState<{
    width: number
    height: number
  } | null>(null)

  // Add effect to measure container
  useEffect(() => {
    if (!containerRef.current) return

    const updateSize = () => {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setContainerSize({ width, height })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!initialViewState) return
    setInitialVState(initialViewState)
  }, [setInitialVState, initialViewState])

  // Track current cursor position for hover box
  const [pointerPosition, setPointerPosition] = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })

  // Track features the cursor is hovering over
  const [hoveredFeatures, setHoveredFeatures] = useState<HoveredFeature[]>([])

  // Debugging effect for hover features
  useEffect(() => {
    if (hoveredFeatures.length > 0) {
      console.log('Hover features updated:', hoveredFeatures)
    }
  }, [hoveredFeatures])

  // Track ID of feature that should be highlighted
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Track ID of selected/clicked feature
  const [clickedId, setClickedId] = useState<string | null>(null)

  const colorAccessors = useMemo(
    () =>
      sources.reduce(
        (acc, source) => {
          acc[source.id] = {
            getFillColorAccessor: getStylePropertyAccessor(source, 'fill'),
            getLineColorAccessor: getStylePropertyAccessor(source, 'line')
          }
          return acc
        },
        {} as Record<
          string,
          {
            getFillColorAccessor: StylePropertyAccessor<Color>
            getLineColorAccessor: StylePropertyAccessor<Color>
          }
        >
      ),
    [sources]
  )

  const lineWidthAccessors = useMemo(
    () =>
      sources.reduce(
        (acc, source) => {
          acc[source.id] = getStylePropertyAccessor(source, 'line', 'width')
          return acc
        },
        {} as Record<string, StylePropertyAccessor<number>>
      ),
    [sources]
  )

  const [selectedFeature, setSelectedFeature] = useState<
    FeatureInfoBoxProps['feature'] | null
  >(null)

  const sourceLayers = useMemo(
    () =>
      sources.map((source) => {
        const sharedProperties: LayerSharedProperties = {
          uniqueIdProperty: 'uuid',
          // Make sure layers are pickable for hover detection
          pickable: true,
          autoHighlight: true, // Enable auto-highlighting on hover
          highlightColor: [255, 255, 255, 12], // Semi-transparent white highlight
          getFillColor: colorAccessors[source.id].getFillColorAccessor(
            hoveredId,
            clickedId
          ),
          getLineColor: colorAccessors[source.id].getLineColorAccessor(
            hoveredId,
            clickedId
          ),
          getLineWidth: lineWidthAccessors[source.id](hoveredId, clickedId),
          lineWidthUnits: 'pixels',
          pointRadiusUnits: 'pixels',
          updateTriggers: {
            getLineColor: [hoveredId, clickedId],
            getLineWidth: [hoveredId, clickedId],
            getFillColor: [hoveredId, clickedId]
          }
        }

        const layer =
          source.sourceType === 'geojson'
            ? new GeoJsonLayer({
                id: source.id,
                data: source.featureCollection,
                minZoom: source.minZoom ?? 0,
                maxZoom: MAX_ZOOM_MAP,
                stroked: true,
                filled: true,
                extruded: false,
                getPointRadius: () => 6,
                ...(source.getDashArray
                  ? {
                      getDashArray: source.getDashArray,
                      dashGapPickable: true,
                      dashJustified: true,
                      extensions: [new PathStyleExtension({ dash: true })]
                    }
                  : {}),
                ...sharedProperties
              })
            : new MVTLayer({
                id: source.id,
                data: source.url,
                stroked: true,
                filled: true,
                extruded: false,
                pickable: true,
                ...(source.getDashArray
                  ? {
                      renderSubLayers: (props) => {
                        const { id } = props

                        return new GeoJsonLayer({
                          ...props,
                          id: `${id}_geometry`,
                          pickable: true,
                          getDashArray: source.getDashArray,
                          dashJustified: true,
                          getLineWidth: source.line?.default.width || 1,
                          dashGapPickable: true,
                          extensions: [
                            new PathStyleExtension({ dash: true }),
                            ...(props.extensions || [])
                          ]
                        })
                      }
                    }
                  : {}),
                getPointRadius: () => 6,
                onTileError: () => {
                  // Silently handle errors
                },
                fetch: (
                  url: string,
                  { layer, loaders, loadOptions, signal }
                ) => {
                  loaders = loaders || layer.props.loaders
                  loadOptions = loadOptions || layer.getLoadOptions()
                  loadOptions.fetch = async (
                    url: string,
                    requestInit: RequestInit
                  ) => {
                    const response = await fetch(url, {
                      ...requestInit,
                      signal
                    })

                    /*
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`)
                    }
                    */

                    return response
                  }
                  return load(url, loaders, loadOptions)
                },
                loadOptions: {
                  tileCache: {
                    maxSize: 1000,
                    maxAge: 60 * 60 * 1000
                  },
                  mvt: {
                    layerProperty: 'source',
                    worker: true,
                    maxRetries: 3,
                    maxConcurrency: 12
                  }
                },
                minZoom: source.minZoom ?? MIN_ZOOM_DATA,
                maxZoom: MAX_ZOOM_MAP,
                ...sharedProperties
              })

        layer.onClick = ({ picked, object }): boolean => {
          if (!picked) return false

          setClickedId(object.properties.uuid)
          setSelectedFeature({ ...object, mapSourceId: source.id })

          // onSelectFeatures?.([object])

          const bboxJson = object.properties.polygon_bbox_geojson

          if (!bboxJson) return true

          const bbox = JSON.parse(bboxJson)

          const newViewState = getViewStateZoomedToFeature(
            layer,
            bbox.coordinates[0],
            zoomToFeatureOffset
          )

          setInitialVState(newViewState)

          return true
        }

        return layer
      }),
    [
      sources,
      colorAccessors,
      hoveredId,
      clickedId,
      lineWidthAccessors,
      zoomToFeatureOffset
    ]
  )

  const hasMoved = useMemo(() => {
    if (
      !viewState?.zoom ||
      !viewState.latitude ||
      !viewState.latitude ||
      !showResetButton
    )
      return false
    return (
      initState?.zoom - viewState?.zoom > 0.00002 ||
      initState?.zoom - viewState?.zoom < -0.00002 ||
      initState?.latitude - viewState?.latitude > 0.00002 ||
      initState?.latitude - viewState?.latitude < -0.00002 ||
      initState?.longitude - viewState?.longitude > 0.00002 ||
      initState?.longitude - viewState?.longitude < -0.00002
    )
  }, [initState, viewState, showResetButton])

  const resetMapPosition = useCallback(() => {
    if (!initialViewState?.longitude || !initialViewState?.latitude) {
      return
    }

    const newViewState = {
      longitude: initialViewState.longitude,
      latitude: initialViewState.latitude,
      zoom: initialViewState.zoom,
      transitionDuration: 300,
      transitionInterpolator: new LinearInterpolator()
      // transitionEasing: t => t * (2 - t) // Ease out function
    }

    setInitialVState(newViewState)
    setViewState(newViewState)
  }, [initialViewState])

  useEffect(() => {
    onUpdateViewState?.(viewState)
  }, [viewState])

  if (!initialVState) {
    return null
  }

  return (
    <div className="relative h-full w-full" ref={containerRef}>
      <div
        id="map"
        className="flex h-full w-full flex-col"
        onMouseLeave={() => {
          // When mouse leaves the entire map, force-clear all hover state
          setHoveredId(null)
          setHoveredFeatures([])
        }}
        onMouseMove={(e) => {
          // Keep track of mouse position even when not over a layer
          const rect = e.currentTarget.getBoundingClientRect()
          setPointerPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          })
        }}
      >
        <div className="h-full w-full flex-grow">
          {/* Hover info box */}
          {hoveredFeatures.length > 0 && (
            <HoverInfoBox
              features={hoveredFeatures}
              position={pointerPosition}
            />
          )}

          <DeckGL
            onError={() => {
              // We want to catch errors and ignore them for now
            }}
            {...additionalDeckGLProps}
            getTooltip={() => null} // Disable default tooltips
            controller={{
              bounds: UK_BOUNDS,
              dragRotate: false,
              touchRotate: false,
              keyboard: false,
              maxZoom: MAX_ZOOM_MAP,
              minZoom: MIN_ZOOM_MAP,
              ...(additionalDeckGLProps?.controller as any)
            }}
            initialViewState={initialVState}
            layers={[...sourceLayers, ...(additionalDeckGLProps?.layers || [])]}
            onViewStateChange={(e) => {
              // Regular view state change handler
              if (!e.interactionState.inTransition) {
                setViewState(e.viewState as any)
                additionalDeckGLProps?.onViewStateChange?.({
                  ...e,
                  viewState: e.viewState
                })
              }
            }}
            ref={(deckRef: any) => {
              // Store the deck ref for picking objects
              if (deckRef) {
                ;(window as any).__deckRef = deckRef
              }
            }}
            onDragStart={() => {
              // Clear hover state when dragging
              setHoveredFeatures([])
              setHoveredId(null)
            }}
            onHover={(info: any) => {
              // Set pointer position for hover info box
              if (info.x !== undefined && info.y !== undefined) {
                setPointerPosition({ x: info.x, y: info.y })

                const newHoveredFeatures: HoveredFeature[] = []
                let topFeatureId: string | null = null

                // 1. Try direct hover info first (most reliable for top feature)
                if (info.object && info.layer) {
                  const layerId = info.layer.id as MapSourceId
                  const source = sources.find((s) => s.id === layerId)
                  if (source && info.object.properties) {
                    console.log('Direct hover detected:', layerId)
                    topFeatureId = info.object.properties.uuid || null
                    newHoveredFeatures.push({
                      layerName: source.name,
                      mapSourceId: layerId,
                      properties: info.object.properties
                    })
                  }
                }

                // 2. If deck is available, try pickObjects to find *additional* layers
                if ((window as any).__deckRef) {
                  const pickedObjects = (
                    (window as any).__deckRef as Deck
                  ).pickMultipleObjects({
                    x: info.x,
                    y: info.y,
                    radius: 5, // Keep 5x5 picking radius
                    layerIds: sources.map((s) => s.id)
                  })

                  if (pickedObjects && pickedObjects.length > 0) {
                    console.log(
                      `pickObjects found ${pickedObjects.length} raw objects.`
                    )
                    const processedLayers = new Set<string>(
                      newHoveredFeatures.map((f) => f.mapSourceId)
                    ) // Start with direct hover layer

                    // Use the direct hover feature's ID if available
                    if (
                      topFeatureId === null &&
                      pickedObjects[0]?.object?.properties?.uuid
                    ) {
                      topFeatureId = pickedObjects[0].object.properties.uuid
                    }

                    for (const picked of pickedObjects) {
                      if (
                        picked.layer &&
                        picked.object &&
                        picked.object.properties
                      ) {
                        const layerId = picked.layer.id as MapSourceId
                        // Add if it's a *different* layer than the direct hover one
                        if (!processedLayers.has(layerId)) {
                          const source = sources.find((s) => s.id === layerId)
                          if (source) {
                            console.log(
                              'Adding feature via pickObjects:',
                              layerId
                            )
                            processedLayers.add(layerId)
                            newHoveredFeatures.push({
                              layerName: source.name,
                              mapSourceId: layerId,
                              properties: picked.object.properties
                            })
                          }
                        }
                      }
                    }
                  }
                }

                // 3. Update State
                if (newHoveredFeatures.length > 0) {
                  console.log(
                    'Setting Hover features:',
                    newHoveredFeatures.map((f) => f.layerName)
                  )
                  setHoveredId(topFeatureId) // Set ID from direct hover or top pickObject
                  setHoveredFeatures(newHoveredFeatures)
                } else {
                  // Only clear if no features were found by either method
                  // console.log('Clearing hover state - no features found.');
                  setHoveredFeatures([])
                  setHoveredId(null)
                }
              } else {
                // Clear hover state when mouse leaves map area
                setHoveredFeatures([])
                setHoveredId(null)
              }
            }}
          >
            {showResetButton && (
              <div
                className={`absolute ml-2 mt-2 cursor-pointer rounded-md border bg-white p-2 transition-all duration-500 ${hasMoved ? 'opacity-100' : 'invisible opacity-0'}`}
                onClick={() => {
                  resetMapPosition()
                }}
              >
                <MapPin size={20} />
              </div>
            )}
            <Map
              // Custom mapId specified in google cloud with POI disabled
              // TODO: parameterise this?
              mapId={'3460a03523bb6fe6'}
              mapTypeId="hybrid"
              defaultCenter={{
                lat: initialViewState?.latitude || 52.562,
                lng: initialViewState?.longitude || -1.465
              }}
              defaultZoom={initialViewState?.zoom || 10}
              tilt={0}
              gestureHandling="none"
            />
          </DeckGL>
        </div>
      </div>

      {selectedFeature && InfoBoxComponent && (
        <InfoBoxComponent
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  )
}
