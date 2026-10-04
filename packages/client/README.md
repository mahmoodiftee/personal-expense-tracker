# `@finance/client`

Shared API client, fetchers, TanStack Query hooks, Zod form schemas, and view-model mappers for the Finance web and mobile apps.

## Usage

```ts
import { configureApiClient, useDashboard, currentMonthKey } from '@finance/client';

configureApiClient({
  baseUrl: 'https://host/api/v1',
  defaultHeaders: () => ({}), // e.g. Bearer token later
});
```

Build after changes:

```bash
pnpm --filter @finance/client build
```
