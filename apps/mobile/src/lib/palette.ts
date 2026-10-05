/**
 * Native-side mirror of the CSS variables in src/styles/global.css.
 *
 * NativeWind resolves `bg-card` and friends for className props, but Skia
 * charts, lucide icons and navigator options need concrete color strings.
 * Values are kept as HSL triples so they can be diffed against the stylesheet
 * at a glance; hslToHex does the conversion at call time.
 */

type Hsl = readonly [h: number, s: number, l: number];

const TOKENS = {
  light: {
    background: [240, 5, 94],
    foreground: [240, 10, 10],
    card: [0, 0, 100],
    cardForeground: [240, 10, 10],
    surfaceRaised: [240, 5, 97],
    primary: [82, 78, 55],
    primaryForeground: [100, 30, 12],
    hero: [82, 78, 55],
    heroForeground: [100, 30, 12],
    contrast: [0, 0, 100],
    contrastForeground: [240, 10, 10],
    secondary: [240, 5, 96],
    muted: [240, 5, 96],
    mutedForeground: [240, 4, 46],
    accent: [240, 5, 95],
    destructive: [0, 72, 51],
    border: [240, 6, 90],
    success: [152, 69, 36],
    warning: [38, 92, 45],
    chart1: [217, 84, 55],
    chart2: [145, 63, 42],
    chart3: [28, 95, 53],
    chart4: [255, 90, 66],
    chart5: [0, 79, 63],
    chart6: [45, 93, 58],
    chartTrack: [240, 6, 88],
  },
  dark: {
    background: [0, 0, 0],
    foreground: [0, 0, 96],
    card: [0, 0, 8],
    cardForeground: [0, 0, 96],
    surfaceRaised: [0, 0, 12],
    primary: [82, 74, 56],
    primaryForeground: [100, 45, 8],
    hero: [82, 74, 56],
    heroForeground: [100, 45, 8],
    contrast: [0, 0, 100],
    contrastForeground: [0, 0, 7],
    secondary: [0, 0, 12],
    muted: [0, 0, 12],
    mutedForeground: [0, 0, 58],
    accent: [0, 0, 16],
    destructive: [0, 75, 60],
    border: [0, 0, 14],
    success: [152, 65, 48],
    warning: [38, 92, 58],
    chart1: [217, 88, 62],
    chart2: [145, 60, 48],
    chart3: [28, 95, 58],
    chart4: [255, 92, 72],
    chart5: [0, 79, 66],
    chart6: [45, 93, 62],
    chartTrack: [0, 0, 16],
  },
} satisfies Record<'light' | 'dark', Record<string, Hsl>>;

export type ColorToken = keyof (typeof TOKENS)['dark'];
export type Palette = Record<ColorToken, string>;

function hslToHex([h, s, l]: Hsl): string {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = h / 60;
  const secondary = chroma * (1 - Math.abs((sector % 2) - 1));
  const match = lightness - chroma / 2;

  const rgb: [number, number, number] =
    sector < 1
      ? [chroma, secondary, 0]
      : sector < 2
        ? [secondary, chroma, 0]
        : sector < 3
          ? [0, chroma, secondary]
          : sector < 4
            ? [0, secondary, chroma]
            : sector < 5
              ? [secondary, 0, chroma]
              : [chroma, 0, secondary];

  return `#${rgb
    .map((channel) =>
      Math.round((channel + match) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`.toUpperCase();
}

function buildPalette(scheme: 'light' | 'dark'): Palette {
  const entries = Object.entries(TOKENS[scheme]) as [ColorToken, Hsl][];
  return Object.fromEntries(entries.map(([token, hsl]) => [token, hslToHex(hsl)])) as Palette;
}

export const palettes: Record<'light' | 'dark', Palette> = {
  light: buildPalette('light'),
  dark: buildPalette('dark'),
};

/** Ordered categorical colors for donut slices and category tiles. */
export function categoricalColors(palette: Palette): string[] {
  return [
    palette.chart1,
    palette.chart2,
    palette.chart3,
    palette.chart4,
    palette.chart5,
    palette.chart6,
  ];
}

/** Translucent overlay for chips sitting on top of the lime hero block. */
export function heroOverlay(opacity: number): string {
  return `rgba(0, 0, 0, ${opacity})`;
}
