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
