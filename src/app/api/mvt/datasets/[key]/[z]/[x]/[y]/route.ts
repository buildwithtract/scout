import { getCompatibleClient } from '@/db/connection-pool'
import { Dataset, getDataset } from './queries'

export async function GET(
  request: Request,
  {
    params
  }: { params: Promise<{ key: string; z: string; x: string; y: string }> }
) {
  const { key, z, x, y } = await params

  if (!key || !z || !x || !y) {
    return new Response('Missing parameters', { status: 400 })
  }

  if (isNaN(parseInt(z)) || isNaN(parseInt(x)) || isNaN(parseInt(y))) {
    return new Response('Invalid parameters', { status: 400 })
  }

  if (parseInt(z) < 0 || parseInt(z) > 22) {
    return new Response('Invalid zoom level', { status: 400 })
  }

  if (parseInt(x) < 0 || parseInt(x) > 2 ** parseInt(z)) {
    return new Response('Invalid x coordinate', { status: 400 })
  }

  if (parseInt(y) < 0 || parseInt(y) > 2 ** parseInt(z)) {
    return new Response('Invalid y coordinate', { status: 400 })
  }

  const isValidKey = Object.values(Dataset).includes(key as Dataset)
  if (!isValidKey) {
    return new Response('Invalid dataset', { status: 400 })
  }

  const client = await getCompatibleClient()

  try {
    const result = await getDataset(client, key as Dataset, {
      z: parseInt(z),
      x: parseInt(x),
      y: parseInt(y)
    })

    const mvtBuffer = result.mvt
    if (!mvtBuffer) {
      return new Response('No content', { status: 204 })
    }

    // Set appropriate headers for MVT
    return new Response(Buffer.from(mvtBuffer), {
      headers: {
        'Content-Type': 'application/x-protobuf',
        'Content-Disposition': `attachment; filename=${z}_${x}_${y}.mvt`,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error generating MVT:', error)
    return new Response('Failed to generate tile', { status: 500 })
  } finally {
    // IMPORTANT: Always release the client back to the pool
    ;(client as any).release()
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false
  }
}
