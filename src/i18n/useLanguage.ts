import { createContext, useContext } from 'react';
import type { UILanguageCode, UIStrings } from './translations';
import type { WorldLanguage } from './worldLanguages';

export interface LanguageContextValue {
  lang: UILanguageCode;
  worldLangCode: string;
  currentWorldLang: WorldLanguage;
  setLang: (code: UILanguageCode) => void;
  selectWorldLanguage: (code: string) => void;
  t: UIStrings;
  dir: 'ltr' | 'rtl';
  worldTranslateActive: boolean;
  enableWorldTranslate: () => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
