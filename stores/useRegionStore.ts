import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RegionCombination {
  name: string;
  regions: string[];
}

interface RegionState {
  combinations: RegionCombination[];
  excludedRegions: Set<string>;
  addCombination: (name: string, regions: string[]) => void;
  removeCombination: (name: string) => void;
  updateCombination: (oldName: string, newName: string, regions: string[]) => void;
  toggleExclusion: (region: string) => void;
  clearExclusions: () => void;
  getCombinedRegion: (region: string) => string;
}

const validateCombination = (
  name: string, 
  regions: string[], 
  currentCombinations: RegionCombination[],
  oldName?: string
): boolean => {
  if (!name.trim() || regions.length < 2) return false;
  if (oldName && name === oldName) return true;
  
  const nameExists = currentCombinations.some(c => c.name === name);
  if (nameExists) return false;

  const existingRegions = new Set(
    currentCombinations
      .filter(c => c.name !== oldName)
      .flatMap(c => c.regions)
  );

  return !regions.some(r => existingRegions.has(r));
};

export const useRegionStore = create<RegionState>()(
  persist(
    (set, get) => ({
      combinations: [],
      excludedRegions: new Set<string>(),
      
      addCombination: (name: string, regions: string[]) => {
        const currentCombinations = get().combinations;
        
        if (!validateCombination(name, regions, currentCombinations)) {
          console.error('Invalid combination parameters');
          return;
        }

        set((state) => ({
          combinations: [...state.combinations, { name, regions }]
        }));
      },
      
      removeCombination: (name: string) => {
        set((state) => ({
          combinations: state.combinations.filter(c => c.name !== name)
        }));
      },

      updateCombination: (oldName: string, newName: string, regions: string[]) => {
        const currentCombinations = get().combinations;
        
        if (!validateCombination(newName, regions, currentCombinations, oldName)) {
          console.error('Invalid combination update parameters');
          return;
        }

        set((state) => ({
          combinations: state.combinations.map(c => 
            c.name === oldName ? { name: newName, regions } : c
          )
        }));
      },

      toggleExclusion: (region: string) => {
        set((state) => {
          const newExcluded = new Set(state.excludedRegions);
          if (newExcluded.has(region)) {
            newExcluded.delete(region);
          } else {
            newExcluded.add(region);
          }
          return { excludedRegions: newExcluded };
        });
      },

      clearExclusions: () => {
        set({ excludedRegions: new Set() });
      },
      
      getCombinedRegion: (region: string) => {
        const { combinations } = get();
        const combination = combinations.find(c => c.regions.includes(region));
        return combination ? combination.name : region;
      }
    }),
    {
      name: 'region-store',
      version: 1,
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          return {
            ...data,
            state: {
              ...data.state,
              excludedRegions: new Set(data.state.excludedRegions)
            }
          };
        },
        setItem: (name, value) => {
          const data = {
            ...value,
            state: {
              ...value.state,
              excludedRegions: Array.from(value.state.excludedRegions)
            }
          };
          localStorage.setItem(name, JSON.stringify(data));
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);

export const useCombinations = () => {
  return useRegionStore(state => state.combinations);
};

export const useExcludedRegions = () => {
  return useRegionStore(state => state.excludedRegions);
};

export const useRegionCombination = (name: string): RegionCombination | undefined => {
  return useRegionStore(state => 
    state.combinations.find(c => c.name === name)
  );
};

export const isRegionCombination = (value: unknown): value is RegionCombination => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'regions' in value &&
    Array.isArray((value as RegionCombination).regions)
  );
};