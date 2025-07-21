
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import type { Language } from '../types';
import { translations } from '../i18n';
import type { Translations } from '../i18n';

const LANGUAGE_STORAGE_KEY = 'capTableLanguage_v2';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  locale: string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('de');

  useEffect(() => {
    try {
        const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLang && (savedLang === 'de' || savedLang === 'en')) {
            setLanguageState(savedLang as Language);
        }
    } catch (e) {
        console.error("Could not read language from localStorage", e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      } catch(e) {
          console.error("Could not save language to localStorage", e);
      }
      setLanguageState(lang);
  };

  const contextValue = useMemo(() => {
    return {
      language,
      setLanguage,
      t: translations[language],
      locale: language === 'de' ? 'de-DE' : 'en-US'
    };
  }, [language]);

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
