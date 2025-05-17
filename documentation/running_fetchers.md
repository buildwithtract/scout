# Running fetchers

Fetch all datasets (if required):

```bash
bun run fetch-all
```

Fetch a specific dataset:

```bash
bun run fetch <fetcher-name>
```

You can see all the available fetchers in `bin/fetch.ts`, or by running `bun run list-fetchers`:

```bash
$ bun run list-fetchers
ext-datagovuk-ancient-woodland
ext-datagovuk-aonb
ext-datagovuk-battlefields
ext-datagovuk-brownfield
ext-datagovuk-built-up-areas
ext-datagovuk-conservation-area
...
```

(`bun run list-fetchers --json` will output the fetchers as a JSON array if you need to parse them in a script)
