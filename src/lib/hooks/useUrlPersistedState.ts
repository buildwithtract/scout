'use client'

import {
  compressDataToUrlSafe,
  decompressDataFromUrlSafe
} from '@/lib/compress'
import { debounce } from 'es-toolkit'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'

function coerceToType<T>(
  type: 'string' | 'number' | 'json',
  value: string | null | undefined
): T | undefined {
  if (value === null || value === undefined) return undefined
  if (type === 'string') return value as unknown as T
  if (type === 'number') return Number(value) as unknown as T
  return decompressDataFromUrlSafe<T>(value)
}

function getUrlValue<T>(
  key: string,
  type: 'string' | 'number' | 'json'
): T | undefined {
  if (typeof window === 'undefined') return undefined
  const urlValue = new URLSearchParams(window.location.search).get(key)
  return urlValue ? coerceToType<T>(type, urlValue) : undefined
}

export const useUrlPersistedState = <T>(
  key: string,
  type: 'string' | 'number' | 'json',
  defaultValue: T
): [T | undefined, (val: T) => void] => {
  const searchParams = useSearchParams()
  const paramValue = coerceToType<T>(type, searchParams.get(key))
  const lastDebouncedValue = useRef<T | undefined>(paramValue ?? defaultValue)

  const skipNextUrlUpdate = useRef(false)

  const debouncedUpdateUrl = useMemo(
    () =>
      debounce((val: T) => {
        lastDebouncedValue.current = val
        if (skipNextUrlUpdate.current) {
          skipNextUrlUpdate.current = false
          return
        }

        if (typeof window === 'undefined') return
        let urlSafeVal = val as string
        if (type === 'json') {
          urlSafeVal = compressDataToUrlSafe(val)
        }

        // Instead of updating URL and causing a re-render through Next.js,
        // directly update the URL with pushState
        const url = new URL(window.location.href)
        url.searchParams.set(key, urlSafeVal)
        if (url.toString() !== window.location.href) {
          window.history.pushState({}, '', url.toString())
        }
      }, 1000), // Added a longer debounce time
    [key, type]
  )

  useEffect(() => () => debouncedUpdateUrl.cancel(), [debouncedUpdateUrl])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handlePopState = () => {
      skipNextUrlUpdate.current = true
      const poppedValue = getUrlValue<T>(key, type)
      if (poppedValue !== undefined) {
        lastDebouncedValue.current = poppedValue
      } else {
        lastDebouncedValue.current = defaultValue
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [defaultValue, key, type])

  const setStateAndPersist = useCallback(
    (val: T) => {
      //setState(val)
      debouncedUpdateUrl(val)
    },
    [debouncedUpdateUrl]
  )

  return [lastDebouncedValue.current, setStateAndPersist]
}
