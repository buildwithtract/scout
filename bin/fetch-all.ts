import chalk from 'chalk'
import { fetchDataset, fetchers } from './fetch'

const main = async () => {
  for (const fetcherName of Object.keys(fetchers)) {
    await fetchDataset(fetcherName)
  }
  console.info(chalk.green('Done!'))
  process.exit(0)
}

if (require.main === module) {
  await main()
}
