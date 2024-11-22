// colorConfig.ts
export const DEFAULT_PALETTE_SIZE = 6;

// Opinionated color choices for maximum contrast and accessibility
export const DEFAULT_PALETTES = {
  DEFAULT: {
    name: 'Default',
    colors: {
      primary: [
        '#4338CA', // Indigo
        '#0891B2', // Cyan
        '#7C3AED', // Purple
        '#DC2626', // Red
        '#16A34A', // Green
        '#F59E0B'  // Amber
      ],
      comparison: [
        '#6D28D9', // Purple
        '#0E7490', // Cyan dark
        '#9333EA', // Purple light
        '#EF4444', // Red light
        '#22C55E', // Green light
        '#F97316'  // Orange
      ]
    }
  },
  MONOCHROME: {
    name: 'Monochrome',
    colors: {
      primary: [
        '#18181B', // Slate darkest
        '#3F3F46', // Slate darker
        '#52525B', // Slate dark
        '#71717A', // Slate medium
        '#A1A1AA', // Slate light
        '#D4D4D8'  // Slate lightest
      ],
      comparison: [
        '#27272A', // Slightly lighter versions
        '#4B4B54',
        '#65656E',
        '#84848D',
        '#B4B4BD',
        '#E7E7EB'
      ]
    }
  },
  OCEAN: {
    name: 'Ocean',
    colors: {
      primary: [
        '#0C4A6E', // Blue darkest
        '#0369A1', // Blue dark
        '#0EA5E9', // Blue medium
        '#38BDF8', // Blue light
        '#7DD3FC', // Blue lighter
        '#BAE6FD'  // Blue lightest
      ],
      comparison: [
        '#164E63', // Cyan versions
        '#0E7490',
        '#06B6D4',
        '#22D3EE',
        '#67E8F9',
        '#A5F3FC'
      ]
    }
  },
  FOREST: {
    name: 'Forest',
    colors: {
      primary: [
        '#166534', // Green darkest
        '#16A34A', // Green dark
        '#22C55E', // Green medium
        '#4ADE80', // Green light
        '#86EFAC', // Green lighter
        '#BBF7D0'  // Green lightest
      ],
      comparison: [
        '#854D0E', // Amber versions
        '#A16207',
        '#CA8A04',
        '#EAB308',
        '#FDE047',
        '#FEF08A'
      ]
    }
  },
  WARM: {
    name: 'Warm',
    colors: {
      primary: [
        '#9F1239', // Rose
        '#DC2626', // Red
        '#EA580C', // Orange
        '#D97706', // Amber
        '#CA8A04', // Yellow
        '#65A30D'  // Lime
      ],
      comparison: [
        '#6D28D9', // Cool contrasting colors
        '#2563EB',
        '#0891B2',
        '#0D9488',
        '#059669',
        '#16A34A'
      ]
    }
  },
  COOL: {
    name: 'Cool',
    colors: {
      primary: [
        '#1E40AF', // Blue
        '#0EA5E9', // Sky
        '#06B6D4', // Cyan
        '#0D9488', // Teal
        '#059669', // Emerald
        '#16A34A'  // Green
      ],
      comparison: [
        '#9F1239', // Warm contrasting colors
        '#DC2626',
        '#EA580C',
        '#D97706',
        '#CA8A04',
        '#65A30D'
      ]
    }
  }
} as const;

export type PaletteTheme = keyof typeof DEFAULT_PALETTES;
export type ColorPalette = {
  primary: string[];
  comparison: string[];
};

export interface ColorScheme {
  name: string;
  colors: ColorPalette;
}

export const COLOR_SCHEMES: ColorScheme[] = Object.values(DEFAULT_PALETTES).map(palette => ({
  name: palette.name,
  colors: {
    primary: [...palette.colors.primary],
    comparison: [...palette.colors.comparison]
  }
}));

// Utility functions for working with colors
export const getDefaultPalette = (): ColorPalette => ({
  primary: [...DEFAULT_PALETTES.DEFAULT.colors.primary],
  comparison: [...DEFAULT_PALETTES.DEFAULT.colors.comparison]
});

export const validatePalette = (palette: ColorPalette): boolean => {
  return (
    palette.primary.length === DEFAULT_PALETTE_SIZE &&
    palette.comparison.length === DEFAULT_PALETTE_SIZE &&
    palette.primary.every(color => /^#[0-9A-Fa-f]{6}$/.test(color)) &&
    palette.comparison.every(color => /^#[0-9A-Fa-f]{6}$/.test(color))
  );
};

export const generateDefaultPalette = (): ColorPalette => ({
  primary: [...DEFAULT_PALETTES.DEFAULT.colors.primary],
  comparison: [...DEFAULT_PALETTES.DEFAULT.colors.comparison]
});