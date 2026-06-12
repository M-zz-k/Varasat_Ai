import { useLanguage } from '../context/LanguageContext';

export function useTranslation() {
  const { t, lang, toggleLanguage } = useLanguage();
  return { t, lang, toggleLanguage };
}
