/**
 * Design tokens — single source of truth for the ChatGPT-inspired design system.
 * CSS variables in globals.css mirror these values; use this file for JS/TS
 * contexts (charts, programmatic styling, documentation).
 */

export const colors = {
  /** App canvas */
  background: 'hsl(0 0% 7%)',
  /** Primary text */
  foreground: 'hsl(0 0% 93%)',
  /** Elevated surfaces (cards, panels) */
  surface: 'hsl(0 0% 12%)',
  /** Hover / secondary surface */
  surfaceHover: 'hsl(0 0% 15%)',
  /** Subtle borders */
  border: 'hsl(0 0% 18%)',
  /** Muted text */
  muted: 'hsl(0 0% 55%)',
  /** ChatGPT-inspired accent green */
  accent: 'hsl(160 84% 39%)',
  accentHover: 'hsl(160 84% 45%)',
  /** Semantic */
  success: 'hsl(152 69% 40%)',
  warning: 'hsl(38 92% 50%)',
  destructive: 'hsl(0 72% 51%)',
} as const;

/** Type scale (mobile-first; scales up at md). */
export const typography = {
  display: { size: '2rem', lineHeight: '2.5rem', weight: 600 },
  h1: { size: '1.75rem', lineHeight: '2.125rem', weight: 600 },
  h2: { size: '1.375rem', lineHeight: '1.75rem', weight: 600 },
  h3: { size: '1.125rem', lineHeight: '1.5rem', weight: 500 },
  h4: { size: '1rem', lineHeight: '1.375rem', weight: 500 },
  body: { size: '0.9375rem', lineHeight: '1.5rem', weight: 400 },
  bodySm: { size: '0.8125rem', lineHeight: '1.25rem', weight: 400 },
  caption: { size: '0.75rem', lineHeight: '1rem', weight: 400 },
  label: { size: '0.8125rem', lineHeight: '1rem', weight: 500 },
} as const;

/** Spacing rhythm (Tailwind class references). */
export const spacing = {
  pageX: 'px-4 sm:px-6 lg:px-8',
  pageY: 'py-6 md:py-8',
  section: 'space-y-6 md:space-y-8',
  stack: 'space-y-4',
  inline: 'gap-3',
  card: 'p-4 md:p-5',
  /** Cancel horizontal page inset so a child can span the viewport edge on mobile. */
  bleedXPage: '-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
} as const;

/** Motion durations (respect reduced-motion in components). */
export const motion = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;
