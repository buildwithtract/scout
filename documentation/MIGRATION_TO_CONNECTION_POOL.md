# Migration Guide: From Singleton to Connection Pool

## Why Migrate?

The singleton database pattern causes memory leaks in serverless/edge environments because connections are never released. The connection pool pattern ensures proper resource management.

## Migration Steps

### 1. In API Routes

**Before:**

```typescript
import { getDbClient } from '@/db/singleton-client'

export async function GET() {
  const client = await getDbClient()
  const result = await someQuery(client, params)
  return Response.json(result)
}
```

**After:**

```typescript
import { getCompatibleClient } from '@/db/connection-pool'

export async function GET() {
  const client = await getCompatibleClient()
  try {
    const result = await someQuery(client, params)
    return Response.json(result)
  } finally {
    ;(client as any).release()
  }
}
```

### 2. In Server Components

**Before:**

```typescript
import { getDbClient } from '@/db/singleton-client'

export default async function Page() {
  const client = await getDbClient()
  const data = await fetchData(client)
  return <div>{data}</div>
}
```

**After:**

```typescript
import { getCompatibleClient } from '@/db/connection-pool'

export default async function Page() {
  const client = await getCompatibleClient()
  try {
    const data = await fetchData(client)
    return <div>{data}</div>
  } finally {
    (client as any).release()
  }
}
```

### 3. In Fetchers (Background Jobs)

For long-running tasks, you might want to keep using a dedicated client:

```typescript
import { Client } from 'pg'

class MyFetcher {
  private client: Client

  constructor() {
    // For background jobs, a dedicated client might be appropriate
    this.client = new Client({ connectionString: process.env.DATABASE_URL })
  }

  async connect() {
    await this.client.connect()
  }

  async disconnect() {
    await this.client.end()
  }

  async fetch() {
    try {
      await this.connect()
      // Do work
    } finally {
      await this.disconnect()
    }
  }
}
```

### 4. Using withPoolClient Helper

For simpler cases where you don't need the Client type:

```typescript
import { withPoolClient } from '@/db/connection-pool'

export async function GET() {
  const result = await withPoolClient(async (client) => {
    // client is automatically released after this function
    return client.query('SELECT * FROM users')
  })
  return Response.json(result.rows)
}
```

## Best Practices

1. **Always use try/finally** to ensure client release
2. **Keep connections short-lived** - acquire late, release early
3. **Don't share clients between requests** - each request should get its own
4. **Monitor pool health** in production with logging

## Common Pitfalls

❌ **Don't forget to release:**

```typescript
const client = await getCompatibleClient()
const result = await query(client) // If this throws, client leaks!
client.release()
```

✅ **Always use try/finally:**

```typescript
const client = await getCompatibleClient()
try {
  const result = await query(client)
} finally {
  ;(client as any).release()
}
```

## Environment Variables

The connection pool uses the same `DATABASE_URL` environment variable as before, so no changes needed there.

## Testing

To verify the migration:

1. Check that database connections don't increase unboundedly
2. Monitor for "too many connections" errors
3. Ensure proper cleanup in error scenarios
