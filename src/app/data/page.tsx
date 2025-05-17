import { getLatestFetchesForEachDataset } from '@/db'
import { getDbClient } from '@/db/singleton-client'
import Link from 'next/link'

export default async function Page() {
  const client = await getDbClient()
  const fetches = await getLatestFetchesForEachDataset(client)

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mx-auto flex w-full max-w-[832px] flex-col justify-center gap-8">
        <div className="bg-white p-8 py-12 shadow-lg lg:p-12">
          <p>
            <Link href="/" className="link">
              Back to Scout
            </Link>
          </p>

          <div className="mt-8">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="py-2 text-left">Dataset</th>
                  <th className="py-2 text-left">Last Fetch</th>
                </tr>
              </thead>

              <tbody>
                {fetches.map((fetch) => (
                  <tr key={fetch.name}>
                    <td className="border px-4 py-2">{fetch.name}</td>
                    <td className="border px-4 py-2">
                      {fetch.finishedAt ? (
                        fetch.finishedAt.toISOString()
                      ) : (
                        <span className="text-xs">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <p className="text-sm">
              <Link
                href="https://github.com/buildwithtract/scout/tree/master/src/fetchers"
                target="_blank"
                className="link"
              >
                View fetchers source code
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
