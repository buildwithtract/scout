'use client'

import pako from 'pako'

export const compressDataToUrlSafe = (raw: any): string => {
  const data = JSON.stringify(raw)

  const encoder = new TextEncoder()
  const binaryData = encoder.encode(data)
  const compressed = pako.gzip(binaryData)

  return btoa(String.fromCharCode(...Array.from(compressed)))
}

export const decompressDataFromUrlSafe = <T>(compressedUrlSafe: string): T => {
  const binaryString = atob(compressedUrlSafe)
  const compressedData = Uint8Array.from(binaryString, (char) =>
    char.charCodeAt(0)
  )

  const decompressedData = pako.inflate(compressedData)

  const decoder = new TextDecoder()
  const raw = decoder.decode(decompressedData)
  return JSON.parse(raw) as T
}
