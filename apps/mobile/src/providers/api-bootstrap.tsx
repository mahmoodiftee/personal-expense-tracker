import { apiHealthLiveUrl, configureApiClient } from '@finance/client';
import { useEffect, type ReactNode } from 'react';

import { env } from '@/lib/env';

configureApiClient({
  baseUrl: env.apiBaseUrl,
  defaultHeaders: () => {
    const headers: Record<string, string> = {};
    if (env.demoUserId) {
      headers['x-user-id'] = env.demoUserId;
    }
    return headers;
  },
});

type ApiBootstrapProps = {
  children: ReactNode;
};

/** Configures the shared API client and warms the Render free-tier instance. */
export function ApiBootstrap({ children }: ApiBootstrapProps) {
  useEffect(() => {
    const controller = new AbortController();
    void fetch(apiHealthLiveUrl(), { signal: controller.signal }).catch(() => {
      // Cold starts are expected; screens handle their own loading/error states.
    });
    return () => controller.abort();
  }, []);

  return children;
}
