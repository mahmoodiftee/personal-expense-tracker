'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  parseViewedInsightIds,
  serializeViewedInsightIds,
  VIEWED_INSIGHTS_STORAGE_KEY,
} from '../lib/viewed-insights-storage';

function loadViewedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  return parseViewedInsightIds(window.localStorage.getItem(VIEWED_INSIGHTS_STORAGE_KEY));
}

function persistViewedIds(ids: ReadonlySet<string>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(VIEWED_INSIGHTS_STORAGE_KEY, serializeViewedInsightIds(ids));
}

export function useViewedInsights() {
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setViewedIds(loadViewedIds());
    setHydrated(true);
  }, []);

  const markViewed = useCallback((id: string) => {
    setViewedIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      persistViewedIds(next);
      return next;
    });
  }, []);

  const isViewed = useCallback((id: string) => viewedIds.has(id), [viewedIds]);

  const markAllViewed = useCallback((ids: readonly string[]) => {
    setViewedIds((current) => {
      const next = new Set(current);
      for (const id of ids) next.add(id);
      persistViewedIds(next);
      return next;
    });
  }, []);

  return { markViewed, isViewed, markAllViewed, viewedIds, hydrated };
}
