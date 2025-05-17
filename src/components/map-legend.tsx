import { cn } from '@/lib/utils'
import { Lightbulb } from 'lucide-react'
import {
  getMapSourceRgba,
  MapSourceId,
  mapSources,
  sortByMapSourceOrder
} from './googlemap/config'
import { LegendGroup } from './googlemap/types'

export const MapLegend = ({
  twoWayToggle = false,
  legendGroups = [],
  legendKeys,
  legendOrder,
  visible,
  setVisible,
  filled,
  setFilled,
  legendContainerClassName,
  helperText = (
    <p>Click on items below to toggle them from outline, filled, or hidden.</p>
  ),
  itemClassName,
  currentZoom = 0,
  minZoomLevels
}: {
  twoWayToggle?: boolean
  legendGroups?: LegendGroup[]
  legendKeys: MapSourceId[]
  legendOrder?: MapSourceId[]
  visible: MapSourceId[] | undefined
  setVisible: (val: MapSourceId[]) => void
  filled: MapSourceId[]
  setFilled: (val: MapSourceId[]) => void
  legendContainerClassName?: string
  titleOutline?: boolean
  helperText?: React.ReactNode
  itemClassName?: string
  currentZoom?: number
  minZoomLevels?: Record<string, number>
}) => {
  const toggleMapLegendKey = (key: MapSourceId) => {
    if (!visible) return

    // Two way toggle for line
    if (twoWayToggle || mapSources[key].type == 'line') {
      if (visible.includes(key)) {
        setVisible(visible.filter((k) => k !== key))
      } else {
        setVisible([...visible, key])
      }
      return
    }

    // Three way toggle for others
    if (visible.includes(key) && filled.includes(key)) {
      setFilled(filled.filter((k) => k !== key))
      setVisible(visible.filter((k) => k !== key))
    } else if (visible.includes(key)) {
      setFilled([...filled, key])
    } else {
      setVisible([...visible, key])
    }
  }

  const toggleGroup = (keys: MapSourceId[]) => {
    if (!visible) return

    const allVisible = keys.every((key) => visible.includes(key))
    if (allVisible) {
      // If all visible, hide all
      setVisible(visible.filter((k) => !keys.includes(k)))
      setFilled(filled.filter((k) => !keys.includes(k)))
    } else {
      // Show all
      const newVisible = [...visible]
      keys.forEach((key) => {
        if (!newVisible.includes(key)) {
          newVisible.push(key)
        }
      })
      setVisible(newVisible)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="items-top flex flex-row gap-2">
        <Lightbulb />
        <div>{helperText}</div>
      </div>
      <div
        className={cn(
          'flex flex-row flex-wrap gap-6',
          legendContainerClassName
        )}
      >
        {/* Groups */}
        {legendGroups.map((group) => (
          <div key={group.name} className="flex flex-col gap-2">
            <button
              onClick={() => toggleGroup(group.keys)}
              className="flex items-center gap-2 text-sm font-medium"
            >
              {group.name}
            </button>
            <div className="ml-4 flex flex-col gap-2">
              {[...group.keys]
                .sort((a, b) => sortByMapSourceOrder(a, b, legendOrder))
                .map((key) => (
                  <LegendItem
                    key={key}
                    mapSource={mapSources[key]}
                    visible={visible?.includes(key)}
                    filled={filled?.includes(key)}
                    onClick={() => toggleMapLegendKey(key)}
                    className={itemClassName}
                    currentZoom={currentZoom}
                    minZoom={minZoomLevels?.[key]}
                  />
                ))}
            </div>
          </div>
        ))}

        {/* Ungrouped items */}
        <div className="flex flex-row flex-wrap gap-4">
          {legendKeys
            .filter(
              (key) => !legendGroups.some((group) => group.keys.includes(key))
            )
            .sort((a, b) => (mapSources[a].name > mapSources[b].name ? 1 : -1))
            .map((key) => (
              <LegendItem
                key={key}
                mapSource={mapSources[key]}
                visible={visible?.includes(key)}
                filled={filled?.includes(key)}
                onClick={() => toggleMapLegendKey(key)}
                className={itemClassName}
                currentZoom={currentZoom}
                minZoom={minZoomLevels?.[key]}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

// Separate component for legend items to reduce duplication
const LegendItem = ({
  mapSource,
  visible,
  filled,
  onClick,
  className,
  currentZoom,
  minZoom
}: {
  mapSource: (typeof mapSources)[MapSourceId]
  visible: boolean
  filled: boolean
  onClick: () => void
  className?: string
  currentZoom?: number
  minZoom?: number
}) => {
  const isDisabledByZoom = minZoom ? currentZoom < minZoom : false

  return (
    <div
      className={cn(
        'flex cursor-pointer flex-row items-center gap-2',
        isDisabledByZoom && 'cursor-not-allowed opacity-40',
        className
      )}
      onClick={() => !isDisabledByZoom && onClick()}
    >
      <div
        className={cn(
          'h-5 w-5 rounded border-2',
          mapSource.type == 'point' ? 'rounded-full' : '',
          mapSource.type == 'line' ? 'h-[2px]' : ''
        )}
        style={{
          borderColor: visible ? getMapSourceRgba(mapSource).line : '#CCC',
          opacity: visible && !isDisabledByZoom ? 1 : 0.3,
          backgroundColor:
            visible && filled && !isDisabledByZoom
              ? getMapSourceRgba(mapSource).bg
              : undefined
        }}
      ></div>
      <div className={cn(!visible ? 'opacity-50' : '')}>{mapSource.name} </div>
    </div>
  )
}
