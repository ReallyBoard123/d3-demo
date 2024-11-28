'use client';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { translations } from '@/config/translations';

export const useTranslation = () => {
  const { currentLanguage } = useLanguageStore();
  return {
    t: (key: string) => {
      const keys = key.split('.');
      let current: any = translations[currentLanguage];
      
      for (const k of keys) {
        if (current[k] === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
        current = current[k];
      }
      
      return current;
    },
    language: currentLanguage,
  };
};