import { FontClassName } from '@/assets/fonts'
import { MapProvider } from '@/components/googlemap/context'
import '@/globals.css'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: 'Scout | %s',
    default: 'Scout | UK Geodata for planning'
  },
  description: ''
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          FontClassName,
          'flex h-full min-h-screen flex-col items-center justify-between bg-brand-cream'
        )}
      >
        <MapProvider
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        >
          {children}
        </MapProvider>
      </body>
    </html>
  )
}

export default RootLayout
