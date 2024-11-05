import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChartId } from '@/types/activity';

export const COLOR_SCHEMES = [
  {
    name: 'Default',
    colors: ['#4f46e5', '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706'],
  },
  {
    name: 'Blues',
    colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  },
  {
    name: 'Forest',
    colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  },
  {
    name: 'Sunset',
    colors: ['#dc2626', '#f59e0b', '#d97706', '#ea580c', '#db2777', '#e11d48'],
  },
  {
    name: 'Ocean',
    colors: ['#2dd4bf', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'],
  },
  {
    name: 'Monochrome',
    colors: ['#111827', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'],
  },
] as const;

export type ColorScheme = typeof COLOR_SCHEMES[number];

interface ColorStore {
  globalScheme: string;
  setGlobalScheme: (scheme: string) => void;
  getChartColors: (chartId: ChartId) => string[];
}

export const useColorStore = create<ColorStore>()(
  persist(
    (set, get) => ({
      globalScheme: 'Default',
      setGlobalScheme: (scheme) => {
        set({ globalScheme: scheme });
      },
      getChartColors: (chartId) => {
        const { globalScheme } = get();
        const scheme = COLOR_SCHEMES.find(s => s.name === globalScheme);
        return (scheme?.colors || COLOR_SCHEMES[0].colors).slice();
      },
    }),
    {
      name: 'chart-colors',
      version: 1,
    }
  )
);