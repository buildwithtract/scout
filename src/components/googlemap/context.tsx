'use client'
import { APIProvider } from '@vis.gl/react-google-maps'

export const MapProvider = ({
  googleMapsApiKey,
  children
}: {
  googleMapsApiKey: string
  children: React.ReactNode
}) => {
  return <APIProvider apiKey={googleMapsApiKey}>{children}</APIProvider>
}
