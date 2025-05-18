import { describe, expect, it } from 'bun:test'
import { createGeoJSONFeatureIterator } from './streamGeojson'

describe('createGeoJSONFeatureIterator', () => {
  it('should return a GeoJSON feature iterator', async () => {
    const featureIterator = createGeoJSONFeatureIterator(
      strToReadableStreamDefaultReader(geoJSONData(geoJSONFeatures))
    )
    expect(featureIterator).toBeDefined()
  })

  it('should yield each feature in the GeoJSON data', async () => {
    const featureIterator = createGeoJSONFeatureIterator(
      strToReadableStreamDefaultReader(geoJSONData(geoJSONFeatures))
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(((await featureIterator.next()).value as any).geometry.type).toBe(
      'Polygon'
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(((await featureIterator.next()).value as any).geometry.type).toBe(
      'Point'
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((await featureIterator.next()).value as any).toBeUndefined()
    expect((await featureIterator.next()).done).toBe(true)
  })

  it('should keep memory usage low', async () => {
    const lotsOfFeatures = Array.from({ length: 100000 })
      .map(() => geoJSONFeatures)
      .join(',')
    const featureIterator = createGeoJSONFeatureIterator(
      strToReadableStreamDefaultReader(geoJSONData(lotsOfFeatures))
    )
    let total = 0
    for await (const _ of featureIterator) {
      total++
    }
    expect(process.memoryUsage().heapUsed).toBeLessThan(100000000) // 100MB
    expect(total).toBe(200000)
  })
})

const strToReadableStreamDefaultReader = (str: string) =>
  new Blob([str]).stream().getReader()

const geoJSONFeatures = `{
  "type": "Feature",
  "properties": {},
  "geometry": {
    "coordinates": [
      [
        [
          -0.1440286627461944,
          51.50117012177543
        ],
        [
          -0.14273336278139936,
          51.49984381502577
        ],
        [
          -0.14166806935352838,
          51.500175395331894
        ],
        [
          -0.14205544878140586,
          51.500514509058576
        ],
        [
          -0.1417528086037123,
          51.50062754640672
        ],
        [
          -0.14149859085318894,
          51.500506973225185
        ],
        [
          -0.14132911235287793,
          51.50057479567903
        ],
        [
          -0.1413775347813555,
          51.50063508221976
        ],
        [
          -0.1408933104965513,
          51.50074811926922
        ],
        [
          -0.14112331703213954,
          51.50092144219988
        ],
        [
          -0.1413049011392502,
          51.50090637066691
        ],
        [
          -0.1422249272817453,
          51.50178051134364
        ],
        [
          -0.14344759360312764,
          51.501275621791194
        ],
        [
          -0.14359286088986778,
          51.501366050182185
        ],
        [
          -0.1440286627461944,
          51.50117012177543
        ]
      ]
    ],
    "type": "Polygon"
  }
},
{
  "type": "Feature",
  "properties": {},
  "geometry": {
    "coordinates": [
      -0.08350029208745013,
      51.51190878493938
    ],
    "type": "Point"
  }
}`

const geoJSONData = (f: string) =>
  `{"type": "FeatureCollection", "features": [${f}]}`
