'use client';

import { useEffect } from 'react';

import { apiHealthLiveUrl } from '@/lib/api-health-url';

/**
 * Pings the API as soon as the app loads so Render free-tier instances
 * start waking before the user navigates to data-heavy pages.
 */
export function ApiWarmup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const controller = new AbortController();
    void fetch(apiHealthLiveUrl(), { signal: controller.signal, cache: 'no-store' }).catch(
      () => undefined,
    );

    return () => controller.abort();
  }, []);

  return null;
}
