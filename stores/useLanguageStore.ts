import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'de';

interface LanguageState {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      currentLanguage: 'en',
      setLanguage: (language) => set({ currentLanguage: language }),
    }),
    {
      name: 'language-settings',
    }
  )
);