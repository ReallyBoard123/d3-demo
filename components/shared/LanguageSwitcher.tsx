'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguageStore, type Language } from '@/stores/useLanguageStore';

const LANGUAGES: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
};

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguageStore();
  
  const toggleLanguage = () => {
    setLanguage(currentLanguage === 'en' ? 'de' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="w-24"
    >
      {LANGUAGES[currentLanguage]}
    </Button>
  );
};

export default LanguageSwitcher;