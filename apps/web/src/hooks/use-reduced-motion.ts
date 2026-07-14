'use client';

import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

/** Respects user OS preference for reduced motion. */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}
