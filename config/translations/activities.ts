import { translations } from "./translations";

export type ActivityTranslation = {
  [K in keyof typeof translations]: {
    [key: string]: string;
  };
};

export const activityTranslations: ActivityTranslation = {
  en: {
    "Handle center": "Handle center",
    "Sit": "Sit",
    "Walk": "Walk",
    "Handle up": "Handle up",
    "Stand": "Stand",
    "Handle down": "Handle down",
    "Drive": "Drive",
    "Unknown": "Unknown"
  },
  de: {
    "Handle center": "Mittig greifen",
    "Sit": "Sitzen",
    "Walk": "Gehen",
    "Handle up": "Nach oben greifen",
    "Stand": "Stehen",
    "Handle down": "Nach unten greifen",
    "Drive": "Fahren",
    "Unknown": "Unbekannt"
  }
};

// Helper function to translate activity
export const getActivityTranslation = (activity: string, language: keyof ActivityTranslation): string => {
  return activityTranslations[language][activity] || activity;
};

// Helper function to get original English activity from translation
export const getOriginalActivity = (translatedActivity: string, language: keyof ActivityTranslation): string => {
  const translations = activityTranslations[language];
  const original = Object.entries(translations).find(([_, value]) => value === translatedActivity);
  return original ? original[0] : translatedActivity;
};