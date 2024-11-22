import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RegionCombination {
  name: string;
  regions: string[];
}

interface RegionState {
  combinations: RegionCombination[];
  addCombination: (name: string, regions: string[]) => void;
  removeCombination: (name: string) => void;
  updateCombination: (oldName: string, newName: string, regions: string[]) => void;
  getCombinedRegion: (region: string) => string;
}

type RegionStore = RegionState;

const validateCombination = (
  name: string, 
  regions: string[], 
  currentCombinations: RegionCombination[],
  oldName?: string
): boolean => {
  // Check if name is not empty and has at least 2 regions
  if (!name.trim() || regions.length < 2) return false;

  // When updating, allow the same name if it's the one being edited
  if (oldName && name === oldName) return true;

  // Check if name is unique
  const nameExists = currentCombinations.some(c => c.name === name);
  if (nameExists) return false;

  // Check if any of the regions are already part of another combination
  const existingRegions = new Set(
    currentCombinations
      .filter(c => c.name !== oldName) // Exclude the combination being edited
      .flatMap(c => c.regions)
  );

  return !regions.some(r => existingRegions.has(r));
};

export const useRegionStore = create<RegionStore>()(
  persist(
    (set, get) => ({
      combinations: [],
      
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
      
      getCombinedRegion: (region: string) => {
        const { combinations } = get();
        const combination = combinations.find(c => c.regions.includes(region));
        return combination ? combination.name : region;
      }
    }),
    {
      name: 'region-combinations',
      version: 1,
      
      // Optional: Add migration strategies if the store structure changes
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migration from version 0 if needed
          return {
            ...persistedState,
            combinations: persistedState.combinations || []
          };
        }
        return persistedState as RegionStore;
      }
    }
  )
);

// Helper hook for getting typed selections from the store
export const useCombinations = () => {
  return useRegionStore(state => state.combinations);
};

export const useRegionCombination = (name: string): RegionCombination | undefined => {
  return useRegionStore(state => 
    state.combinations.find(c => c.name === name)
  );
};

// Type guard for checking if a value is a RegionCombination
export const isRegionCombination = (value: unknown): value is RegionCombination => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'regions' in value &&
    Array.isArray((value as RegionCombination).regions)
  );
};