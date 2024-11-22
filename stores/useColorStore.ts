import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COLOR_SCHEMES, type ColorPalette } from '@/config/color';
import { ChartId } from '@/types';

// Helper to generate complementary colors
const adjustColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const b = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const g = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
};

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