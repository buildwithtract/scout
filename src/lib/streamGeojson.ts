export async function streamGeoJSONFromURL(url: string) {
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to fetch data: ${response.status} ${response.statusText}`
    )
  }

  const reader = response.body.getReader()

  return createGeoJSONFeatureIterator(reader)
}

export async function* createGeoJSONFeatureIterator(
  reader: ReadableStreamDefaultReader<Uint8Array | string>
): AsyncGenerator<GeoJSON.Feature, void, unknown> {
  const decoder = new TextDecoder()
  let { value, done } = await reader.read()
  let inFeatures = false
  let depth = 0
  const featureSegments: string[] = []

  while (!done) {
    const chunk =
      typeof value === 'string'
        ? value
        : decoder.decode(value, { stream: true })
    let i = 0

    if (!inFeatures) {
      const fi = chunk.indexOf('"features"')
      if (fi >= 0) {
        const bi = chunk.indexOf('[', fi)
        if (bi >= 0) {
          inFeatures = true
          i = bi + 1
        }
      }
    }

    if (!inFeatures) {
      ;({ value, done } = await reader.read())
      continue
    }

    for (; i < chunk.length; i++) {
      const c = chunk[i]

      if (depth === 0) {
        if (c === '{') {
          depth = 1
          featureSegments.push(c)
        } else if (c === ']') {
          return
        }
      } else {
        featureSegments.push(c)
        if (c === '{') depth++
        else if (c === '}') {
          depth--
          if (depth === 0) {
            const featureJson = featureSegments.join('')
            yield JSON.parse(featureJson)
            featureSegments.length = 0
          }
        }
      }
    }

    ;({ value, done } = await reader.read())
  }
}

const strToReadableStreamDefaultReader = (str: string) => {
  const reader = new ReadableStream({
    start(controller) {
      const chunks = str.split(',')
      for (let i = 0; i < chunks.length; i++) {
        if (i === chunks.length - 1) controller.enqueue(chunks[i])
        else controller.enqueue(chunks[i] + ',')
      }
      controller.close()
    }
  })
  return reader.getReader()
}

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

const featureIterator = createGeoJSONFeatureIterator(
  strToReadableStreamDefaultReader(geoJSONData(geoJSONFeatures))
)

await featureIterator.next() // to consume the first value
