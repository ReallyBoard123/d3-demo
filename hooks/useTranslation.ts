'use client';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { getActivityTranslation, getOriginalActivity } from '@/config/translations/activities';
import { TranslationPath, translations } from '@/config/translations/translations';

type TranslationParams = Record<string, string | number>;

const getNestedValue = (obj: any, path: string[]): string | undefined => {
  return path.reduce<any>((curr, key) => {
    if (curr && typeof curr === 'object' && key in curr) {
      return curr[key];
    }
    return undefined;
  }, obj);
};

const interpolateString = (str: string, params?: TranslationParams): string => {
  if (!params) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] || ''));
};

export const useTranslation = () => {
  const { currentLanguage } = useLanguageStore();

  return {
    t: (key: TranslationPath, params?: TranslationParams) => {
      const keys = key.split('.');
      const value = getNestedValue(translations[currentLanguage], keys);
      
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      
      return interpolateString(value, params);
    },
    translateActivity: (activity: string) => {
      return getActivityTranslation(activity, currentLanguage);
    },
    getOriginalActivity: (translatedActivity: string) => {
      return getOriginalActivity(translatedActivity, currentLanguage);
    },
    language: currentLanguage,
  };
};