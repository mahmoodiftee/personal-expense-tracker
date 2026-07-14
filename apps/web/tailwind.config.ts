import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/**
 * Dark-mode-first Tailwind setup. Design tokens are exposed as CSS variables
 * (shadcn/ui convention) so themes can be swapped without recompiling classes.
 * The actual variable values live in the global stylesheet (added with the UI).
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  safelist: [
    // Layout tokens referenced via design-tokens.ts strings
    'px-4',
    'sm:px-6',
    'lg:px-8',
    'py-6',
    'md:py-8',
    'space-y-6',
    'md:space-y-8',
    'p-4',
    'md:p-5',
    '-mx-4',
    'sm:-mx-6',
    'lg:-mx-8',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
      },
      fontSize: {
        display: ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],
        'display-md': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '600' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
