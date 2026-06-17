import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/en';
import { hi } from '../i18n/hi';
import { kn } from '../i18n/kn';

const LanguageContext = createContext(null);

const translations = {
  en,
  hi,
  kn,
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    localStorage.setItem('varasat_lang', 'en');
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('varasat_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => {
      if (prev === 'en') return 'hi';
      if (prev === 'hi') return 'kn';
      return 'en';
    });
  };

  const t = (key) => {
    const dict = translations[lang] || en;
    return dict[key] || en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
