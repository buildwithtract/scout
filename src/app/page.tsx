'use client'

import CentreForBritishProgress from '@/assets/CentreForBritishProgress.svg'
import Github from '@/assets/Github.svg'
import House from '@/assets/House.svg'
import Tract from '@/assets/Tract.svg'
import { Button } from '@/components/buttons'
import {
  gridInfrastructureGroup,
  MapSourceId,
  planningDesignationGroup
} from '@/components/googlemap/config'
import { MapProvider } from '@/components/googlemap/context'
import { GoogleMap, TractMapProps } from '@/components/googlemap/map'
import { MapLegend } from '@/components/map-legend'
import { useUrlPersistedState } from '@/lib/hooks/useUrlPersistedState'
import { Database, Menu, Minimize2, PlusCircle, X } from 'lucide-react'
import Link from 'next/link'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { InfoBox } from '../components/info-box'
import { mapSourcesScout, minZoomsScout } from '../config/map-sources'

export default function Page() {
  return (
    <Suspense>
      <Scout />
    </Suspense>
  )
}

const Scout = () => {
  const [isLegendOpen, setIsLegendOpen] = useState(false)
  const layerKeys = Object.keys(mapSourcesScout) as MapSourceId[]

  const [layerKeysVisiblePersisted, setLayerKeysVisiblePersisted] =
    useUrlPersistedState<MapSourceId[]>('l', 'json', [])
  const [layerKeysVisible, setLayerKeysVisible] = useState<MapSourceId[]>(
    layerKeysVisiblePersisted || []
  )

  // Add refs for both desktop and mobile scroll containers
  const desktopScrollRef = useRef<HTMLDivElement>(null)
  const mobileScrollRef = useRef<HTMLDivElement>(null)

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setLayerKeysVisiblePersisted(layerKeysVisible)
  }, [layerKeysVisible, setLayerKeysVisiblePersisted])

  // Store the last scroll position
  const lastScrollPosition = useRef(0)

  const sources = useMemo(
    () =>
      Object.keys(mapSourcesScout)
        .filter((key) => layerKeysVisible.includes(key as MapSourceId))
        .map((key) => mapSourcesScout[key as MapSourceId]),
    [layerKeysVisible]
  )

  const [currentPosition, setCurrentPosition] = useState<{
    lat: number
    lng: number
  }>({
    lat: 52.562,
    lng: -1.465
  })

  useEffect(() => {
    if (!('geolocation' in navigator)) return
    if (currentPosition) return

    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    })
  })

  const [at, setAt] = useUrlPersistedState(
    'at',
    'string',
    `${currentPosition?.lat},${currentPosition?.lng},7`
  )

  const positionRef = useRef(
    at ?? `${currentPosition?.lat},${currentPosition?.lng},7`
  )

  const [latitude, longitude, zoom] = positionRef.current
    ?.split(',')
    .map((val) => parseFloat(val)) ?? [
    currentPosition.lat,
    currentPosition.lng,
    10
  ]

  const initialViewState = useMemo(
    () => ({
      latitude,
      longitude,
      zoom
    }),
    [latitude, longitude, zoom]
  )

  const [zoomLevel, setZoomLevel] = useState(Math.round(zoom))
  const lastViewState = useRef({ latitude, longitude, zoom })

  const mapProps = useMemo(
    (): TractMapProps => ({
      data: {
        sources
      },
      state: {
        initialViewState
      },
      infoBoxComponent: InfoBox,
      callbacks: {
        onUpdateViewState: (v) => {
          if (!v) return
          const newZoom = Math.round(v.zoom)

          if (
            lastViewState.current.latitude !== v.latitude ||
            lastViewState.current.longitude !== v.longitude ||
            lastViewState.current.zoom !== v.zoom
          ) {
            lastViewState.current = v
            setAt(`${v.latitude},${v.longitude},${v.zoom}`)
          }

          if (zoomLevel !== newZoom) {
            setZoomLevel(newZoom)
          }
        }
      }
    }),
    [sources, initialViewState, setAt, zoomLevel]
  )

  const activeLegendKeys = useMemo(
    () =>
      layerKeys.filter(
        (key) => minZoomsScout[key] && minZoomsScout[key] <= zoomLevel
      ),
    [zoomLevel, layerKeys]
  )

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    lastScrollPosition.current = e.currentTarget.scrollTop
  }, [])

  useEffect(() => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollTop = lastScrollPosition.current
    }
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollTop = lastScrollPosition.current
    }
  }, [layerKeysVisible, activeLegendKeys, lastScrollPosition, zoomLevel])

  const LegendContent = ({
    scrollRef
  }: {
    scrollRef: React.RefObject<HTMLDivElement | null>
  }) => (
    <>
      <div className="flex flex-col gap-2 p-2 text-center">
        <div className="flex flex-row items-center justify-between px-8">
          <div className="flex w-1/2 items-center justify-start gap-3">
            <House height={35} />
            <Tract height={35} width={100} />
          </div>
          <div className="flex w-1/2 items-center justify-end">
            <CentreForBritishProgress height={60} width={180} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            SCOUT
          </h1>
          <p className="text-md mx-auto max-w-md leading-relaxed">
            British infrastructure and planning data
          </p>
        </div>
        <div className="flex flex-row items-center justify-between px-8">
          <div className="flex w-1/2 items-center justify-start">
            <Link
              href="/data"
              className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-brand-brown transition-all duration-200 hover:bg-brand-primary/10 hover:text-brand-primary"
            >
              <Database
                width={20}
                height={20}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              <span className="relative">
                Data
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand-primary transition-all duration-200 group-hover:w-full" />
              </span>
            </Link>
          </div>
          <div className="flex w-1/2 items-center justify-end gap-2">
            <Link
              href="https://github.com/buildwithtract/scout"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-brand-brown transition-all duration-200 hover:bg-brand-primary/10 hover:text-brand-primary"
            >
              <Github
                height={20}
                width={20}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              <span className="relative">
                GitHub
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-brand-primary transition-all duration-200 group-hover:w-full" />
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll p-8"
      >
        <div className="mb-4 flex flex-col items-center justify-center">
          <Button
            onClick={() => {
              if (layerKeysVisible.length == layerKeys.length) {
                setLayerKeysVisible([])
              } else {
                setLayerKeysVisible(layerKeys)
              }
            }}
            variant="tertiary"
            className="group relative overflow-hidden rounded-lg bg-brand-cream px-6 py-3 text-sm font-medium text-brand-brown shadow-sm transition-all duration-200 hover:bg-brand-primary hover:text-white hover:shadow-md"
          >
            <span className="relative z-10 flex items-center gap-2">
              {layerKeysVisible.length == layerKeys.length ? (
                <Minimize2
                  width={18}
                  height={18}
                  className="transition-transform duration-200 group-hover:rotate-180"
                />
              ) : (
                <PlusCircle
                  width={18}
                  height={18}
                  className="transition-transform duration-200 group-hover:rotate-180"
                />
              )}
              {layerKeysVisible.length == layerKeys.length
                ? 'Disable'
                : 'Enable'}{' '}
              All
            </span>
          </Button>
        </div>

        <MapLegend
          twoWayToggle={true}
          legendGroups={[planningDesignationGroup, gridInfrastructureGroup]}
          legendKeys={activeLegendKeys}
          visible={layerKeysVisible}
          setVisible={setLayerKeysVisible}
          filled={layerKeysVisible}
          setFilled={() => {}}
          legendContainerClassName="flex-col gap-4"
          titleOutline={false}
          helperText={
            <>
              <p>Click on items below to toggle.</p>
              <p className="text-14px">
                You may need to zoom in to see all items.
              </p>
            </>
          }
          itemClassName="items-center"
          currentZoom={zoomLevel}
          minZoomLevels={minZoomsScout}
        />
      </div>
    </>
  )

  return (
    <div className="flex h-full w-full flex-row">
      <MapProvider
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
      >
        <div className="w-full">
          <div className="relative h-full w-full">
            <GoogleMap {...mapProps} />
          </div>
        </div>

        {/* Desktop Legend - hidden on mobile */}
        <div className="hidden h-full max-h-full w-[350px] shrink-0 flex-col lg:flex">
          <LegendContent scrollRef={desktopScrollRef} />
        </div>

        {/* Mobile Legend Toggle Button */}
        <div className="lg:hidden">
          <div className="absolute right-0 top-0 z-10 mr-4 mt-4 flex transform flex-row items-center justify-center gap-4 rounded-lg bg-brand-cream p-4 shadow-md">
            <button onClick={() => setIsLegendOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Sliding Legend Panel */}
        <div
          className={`fixed inset-y-0 right-0 w-full min-w-[280px] max-w-[350px] transform bg-white ${
            isMounted ? 'transition-transform duration-300 ease-in-out' : ''
          } lg:hidden ${
            isLegendOpen ? 'translate-x-0' : 'translate-x-full'
          } z-20 flex flex-col shadow-lg`}
        >
          <button
            onClick={() => setIsLegendOpen(false)}
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
          <LegendContent scrollRef={mobileScrollRef} />
        </div>
      </MapProvider>
    </div>
  )
}
