'use client'
import { MapSourceId } from './googlemap/config'

// Custom type for hover info
export type HoveredFeature = {
  layerName: string
  mapSourceId: MapSourceId
  properties: any
}

interface HoverInfoBoxProps {
  features: HoveredFeature[]
  position: { x: number; y: number }
}

export const HoverInfoBox = ({ features, position }: HoverInfoBoxProps) => {
  if (features.length === 0) return null

  // Set position
  const positionStyle = {
    left: `${position.x + 15}px`,
    top: `${position.y + 15}px`
  }

  // Helper function to format property value
  const formatPropertyValue = (key: string, value: any) => {
    if (value === undefined || value === null) return ''

    // Format dates
    if (
      (key.includes('date') || key === 'entry_date') &&
      typeof value === 'string'
    ) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString()
        }
      } catch {
        // Fall back to original value
      }
    }

    // Format numeric values
    if (typeof value === 'number') {
      if (key.includes('area') || key === 'areaSquareMetres') {
        return `${value.toLocaleString()} m²`
      }
      if (key.includes('height') || key === 'height_m') {
        return `${value} m`
      }
    }

    return String(value)
  }

  // Get the most important properties to display for each feature type
  const getKeyProperties = (feature: HoveredFeature) => {
    const props = feature.properties
    const keys: string[] = []

    // Specific handling for regions to prevent duplication
    if (feature.mapSourceId === MapSourceId.ExtDatagovukRegions) {
      // Only show name once for regions
      if (props.name) keys.push('name')
      return keys.map((key) => ({
        key: key.replace(/_/g, ' '),
        value: formatPropertyValue(key, props[key])
      }))
    }

    // Common properties to show
    if (props.name) keys.push('name')
    if (props.reference) keys.push('reference')

    // Add source-specific properties
    switch (feature.mapSourceId) {
      case MapSourceId.ExtDatagovukParishes:
        if (props.entry_date) keys.push('entry_date')
        break
      case MapSourceId.ExtOsContours:
        if (props.height_m !== undefined) keys.push('height_m')
        break
      case MapSourceId.ExtDatagovukSSSIs:
        if (props.entry_date) keys.push('entry_date')
        break
      case MapSourceId.ExtDatagovukLocalPlanningAuthorities:
        if (props.name) keys.push('name')
        break
      default:
        // Add any meaningful properties for other layers
        if (props.entry_date) keys.push('entry_date')
        if (props.reference) keys.push('reference')
        if (props.height_m !== undefined) keys.push('height_m')
        break
    }

    // If we don't have any properties at all, add any available properties
    if (keys.length === 0) {
      Object.keys(props).forEach((key) => {
        // Exclude internal properties
        if (
          key !== 'uuid' &&
          key !== 'geometry' &&
          key !== 'geometry_geojson' &&
          key !== 'polygon_bbox_geojson' &&
          props[key] !== undefined &&
          props[key] !== null &&
          props[key] !== ''
        ) {
          keys.push(key)
        }
      })

      // Limit to first 3 properties if there are many
      if (keys.length > 3) {
        keys.splice(3)
      }
    }

    // Return an array of key-value pairs
    return keys.map((key) => ({
      key: key.replace(/_/g, ' '),
      value: formatPropertyValue(key, props[key])
    }))
  }

  return (
    <div
      className="absolute z-50 max-w-xs rounded border border-gray-200 bg-white p-3 shadow-lg"
      style={{
        ...positionStyle,
        maxHeight: '300px',
        overflow: 'auto',
        pointerEvents: 'none',
        minWidth: '200px'
      }}
    >
      {features.length > 1 && (
        <div className="mb-2 border-b border-gray-200 pb-1 text-xs font-bold text-gray-500">
          {features.length} overlapping features
        </div>
      )}

      {features.map((feature, index) => (
        <div
          key={`${feature.mapSourceId}-${index}`}
          className={index > 0 ? 'mt-2 border-t border-gray-200 pt-2' : ''}
        >
          <div className="text-sm font-bold text-blue-600">
            {feature.layerName}
          </div>
          <div className="space-y-1 text-xs">
            {getKeyProperties(feature).map(({ key, value }, i) => (
              <div key={i}>
                <span className="font-medium capitalize">{key}: </span>
                <span>{value}</span>
              </div>
            ))}
            {getKeyProperties(feature).length === 0 && (
              <div className="italic text-gray-400">
                No additional information
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
