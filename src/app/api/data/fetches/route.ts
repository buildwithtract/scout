import { getLatestFetchesForEachDataset } from '@/db'
import { getDbClient } from '@/db/singleton-client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const client = await getDbClient()
    const fetches = await getLatestFetchesForEachDataset(client)
    // Convert finishedAt to ISO string for serialization
    const result = fetches.map((f) => ({
      ...f,
      finishedAt: f.finishedAt ? f.finishedAt.toISOString() : null
    }))
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
