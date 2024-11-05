import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChartId } from '@/types/activity';

// Helper to generate complementary colors
const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const b = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const g = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
};

export interface ColorPalette {
  primary: string[];
  comparison: string[];
}

export const COLOR_SCHEMES = [
  {
    name: 'Default',
    colors: {
      primary: ['#4f46e5', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'] as string[],
      comparison: ['#9333ea', '#4f46e5', '#ec4899', '#f97316', '#84cc16', '#06b6d4'] as string[],
    },
  },
  {
    name: 'Cool/Warm',
    colors: {
      primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#2563eb'] as string[],
      comparison: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c'] as string[],
    },
  },
  {
    name: 'Forest/Autumn',
    colors: {
      primary: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#047857'] as string[],
      comparison: ['#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#991b1b'] as string[],
    },
  },
  {
    name: 'Ocean/Coral',
    colors: {
      primary: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#0284c7'] as string[],
      comparison: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6', '#e11d48'] as string[],
    },
  },
  {
    name: 'Purple/Gold',
    colors: {
      primary: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#6d28d9'] as string[],
      comparison: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#b45309'] as string[],
    },
  },
  {
    name: 'Monochrome',
    colors: {
      primary: ['#111827', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'] as string[],
      comparison: ['#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'] as string[],
    },
  },
] as const;

interface ColorGenConfig {
  hue: number;
  saturation: number;
  lightness: number;
  steps: number;
}

export interface ColorStore {
  globalScheme: string;
  customPalettes: Record<string, ColorPalette>;
  setGlobalScheme: (scheme: string) => void;
  getChartColors: (chartId: ChartId) => ColorPalette;
  generateColorPalette: (config: ColorGenConfig) => ColorPalette;
  saveCustomPalette: (name: string, palette: ColorPalette) => void;
  deleteCustomPalette: (name: string) => void;
}

const generateHslPalette = (config: ColorGenConfig): string[] => {
  const { hue, saturation, lightness, steps } = config;
  const palette: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const l = Math.min(90, Math.max(20, lightness + (i * 10)));
    const s = Math.min(100, Math.max(20, saturation - (i * 5)));
    palette.push(`hsl(${hue}, ${s}%, ${l}%)`);
  }
  
  return palette;
};

export const useColorStore = create<ColorStore>()(
  persist(
    (set, get) => ({
      globalScheme: 'Default',
      customPalettes: {},
      
      setGlobalScheme: (scheme) => {
        set({ globalScheme: scheme });
      },
      
      getChartColors: (chartId) => {
        const { globalScheme, customPalettes } = get();
        
        // Check if it's a custom palette
        if (customPalettes[globalScheme]) {
          return customPalettes[globalScheme];
        }
        
        // Get predefined scheme
        const scheme = COLOR_SCHEMES.find(s => s.name === globalScheme);
        return scheme?.colors || COLOR_SCHEMES[0].colors;
      },
      
      generateColorPalette: (config) => {
        const primaryColors = generateHslPalette(config);
        
        // Generate complementary colors by shifting hue by 180 degrees
        const compConfig = {
          ...config,
          hue: (config.hue + 180) % 360,
          saturation: Math.min(100, config.saturation + 10),
        };
        const compColors = generateHslPalette(compConfig);
        
        return {
          primary: primaryColors,
          comparison: compColors,
        };
      },
      
      saveCustomPalette: (name, palette) => {
        set(state => ({
          customPalettes: {
            ...state.customPalettes,
            [name]: palette,
          },
        }));
      },
      
      deleteCustomPalette: (name) => {
        set(state => {
          const newPalettes = { ...state.customPalettes };
          delete newPalettes[name];
          return { customPalettes: newPalettes };
        });
      },
    }),
    {
      name: 'chart-colors',
      version: 1,
    }
  )
);