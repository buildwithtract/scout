import { MapSourceId } from '@/components/googlemap/config'
import { FeatureInfoBoxProps } from '@/components/googlemap/types'
import { LinkIcon } from 'lucide-react'
import Link from 'next/link'

const InfoBoxInners: Partial<
  Record<
    MapSourceId,
    ({ feature, onClose }: FeatureInfoBoxProps) => React.ReactNode
  >
> = {
  [MapSourceId.ExtPlanningApplications]: ({ feature }: FeatureInfoBoxProps) => (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-brand-brown">
          {feature.properties.reference}
        </h2>
      </div>

      <div className="mb-4 text-link hover:text-linkHover">
        <Link
          href={feature.properties.url}
          target="_blank"
          className="flex items-center"
        >
          <LinkIcon className="mr-2" />
          Visit Page
        </Link>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-tints-brown-darker">Submitted</h3>
          <p>{feature.properties.submitted_date}</p>
        </div>

        <div>
          <h3 className="text-tints-brown-darker">Address</h3>
          <p>{feature.properties.address}</p>
        </div>

        <div>
          <h3 className="text-tints-brown-darker">Description</h3>
          <p>{feature.properties.description}</p>
        </div>

        <div>
          <h3 className="text-tints-brown-darker">Status</h3>
          <p>{feature.properties.application_status || 'N/A'}</p>
        </div>

        <div>
          <h3 className="text-tints-brown-darker">Decision</h3>
          <p>{feature.properties.application_decision || 'N/A'}</p>
        </div>
      </div>
    </>
  )
}

export const InfoBox = ({ feature, onClose }: FeatureInfoBoxProps) => {
  const InnerComponent = InfoBoxInners[feature.mapSourceId] || null
  if (!InnerComponent) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 max-h-[60vh] w-full overflow-y-auto rounded-lg bg-brand-cream text-brand-brown shadow-xl lg:absolute lg:bottom-auto lg:right-4 lg:top-4 lg:m-4 lg:max-h-[calc(100vh-4rem)] lg:w-96">
      <div className="sticky right-0 top-0 z-20 bg-brand-cream p-6 pb-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-3xl text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <span className="sr-only">Close</span>×
        </button>
      </div>
      <div className="p-6">
        <InnerComponent feature={feature} onClose={onClose} />
      </div>
    </div>
  )
}
