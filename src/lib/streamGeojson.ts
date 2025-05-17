import { Readable } from 'stream'
import { chain } from 'stream-chain'
import { parser } from 'stream-json'
import { pick } from 'stream-json/filters/Pick'
import { streamArray } from 'stream-json/streamers/StreamArray'

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
  geoJSONData: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>
): AsyncGenerator<GeoJSON.Feature> {
  const pipeline = chain([
    createReadableStream(geoJSONData),
    parser(),
    pick({ filter: 'features' }),
    streamArray()
  ])

  for await (const data of pipeline) {
    yield data.value as GeoJSON.Feature
  }
}

function createReadableStream(
  geoJSONData: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>
) {
  return new Readable({
    async read() {
      try {
        const { done, value } = await geoJSONData.read()
        if (done) {
          this.push(null)
        } else {
          this.push(value)
        }
      } catch (error) {
        this.destroy(error as Error)
      }
    }
  })
}
