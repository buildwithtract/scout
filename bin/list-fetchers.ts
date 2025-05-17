import { fetchers } from './fetch'

const main = async () => {
  const args = process.argv.slice(2)
  if (args.includes('--json')) {
    console.log(JSON.stringify(Object.keys(fetchers)))
  } else {
    Object.keys(fetchers).forEach((fetcherName) => {
      console.log(fetcherName)
    })
  }
  process.exit(0)
}

if (require.main === module) {
  await main()
}
