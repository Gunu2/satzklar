import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  TRANSLATIONS,
  type UILanguageCode,
} from './translations';
import { WORLD_LANGUAGES } from './worldLanguages';
import { LanguageContext } from './useLanguage';

const LANG_STORAGE_KEY = 'satzklar_ui_lang_v1';
const WORLD_LANG_STORAGE_KEY = 'satzklar_world_lang_v1';

function mapToBuiltinCode(code: string): UILanguageCode {
  if (code === 'zh-CN' || code === 'zh-TW' || code === 'zh') return 'zh';
  const short = code.slice(0, 2).toLowerCase() as UILanguageCode;
  if (short in TRANSLATIONS) return short;
  return 'en';
}

function detectInitialWorldLang(): string {
  if (typeof window === 'undefined') return 'en';
  try {
    const savedWorld = window.localStorage.getItem(WORLD_LANG_STORAGE_KEY);
    if (savedWorld && WORLD_LANGUAGES.some((w) => w.code === savedWorld)) {
      return savedWorld;
    }
    const savedLegacy = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (savedLegacy) {
      if (savedLegacy === 'zh') return 'zh-CN';
      if (WORLD_LANGUAGES.some((w) => w.code === savedLegacy)) return savedLegacy;
    }
    const browserFull = (navigator.language || 'en').trim();
    const exactMatch = WORLD_LANGUAGES.find(
      (w) => w.code.toLowerCase() === browserFull.toLowerCase()
    );
    if (exactMatch) return exactMatch.code;
    const shortMatch = WORLD_LANGUAGES.find(
      (w) => w.code.toLowerCase() === browserFull.slice(0, 2).toLowerCase()
    );
    if (shortMatch) return shortMatch.code;
  } catch {
    // Ignore storage errors
  }
  return 'en';
}

function setGoogleTranslateCookie(targetLang: string) {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  if (targetLang === 'en') {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    if (host.includes('.')) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${host}`;
    }
    return;
  }
  const value = `/en/${targetLang}`;
  document.cookie = `googtrans=${value}; path=/; SameSite=Lax`;
  if (host.includes('.')) {
    document.cookie = `googtrans=${value}; path=/; domain=.${host}; SameSite=Lax`;
  }
}

function triggerGoogleCombo(targetLang: string): boolean {
  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (!combo) return false;
  if (combo.value !== targetLang) {
    combo.value = targetLang;
    combo.dispatchEvent(new Event('change'));
  }
  return true;
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay: boolean },
          elementId: string
        ) => unknown;
      };
    };
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [worldLangCode, setWorldLangCode] = useState<string>(detectInitialWorldLang);
  const [worldTranslateActive, setWorldTranslateActive] = useState<boolean>(false);

  const lang = mapToBuiltinCode(worldLangCode);
  const currentWorldLang =
    WORLD_LANGUAGES.find((w) => w.code === worldLangCode) ?? WORLD_LANGUAGES[0];
  const dir: 'ltr' | 'rtl' = currentWorldLang.rtl ? 'rtl' : 'ltr';

  const loadTranslateScript = useCallback((desiredCode?: string) => {
    setWorldTranslateActive(true);
    if (typeof window === 'undefined') return;

    const applyWhenReady = () => {
      if (!desiredCode || desiredCode === 'en') return;
      let tries = 0;
      const timer = window.setInterval(() => {
        tries += 1;
        if (triggerGoogleCombo(desiredCode) || tries > 20) {
          window.clearInterval(timer);
        }
      }, 250);
    };

    if (document.getElementById('google-translate-script')) {
      applyWhenReady();
      return;
    }

    window.googleTranslateElementInit = () => {
      const target = document.getElementById('satzklar_google_translate_el');
      if (target && window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', autoDisplay: false },
          'satzklar_google_translate_el'
        );
        applyWhenReady();
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(WORLD_LANG_STORAGE_KEY, worldLangCode);
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
    document.documentElement.lang = worldLangCode;
    document.documentElement.dir = dir;
  }, [worldLangCode, lang, dir]);

  const selectWorldLanguage = useCallback(
    (code: string) => {
      setWorldLangCode(code);
      setGoogleTranslateCookie(code);

      if (code === 'en') {
        // Reset Google Translate back to native English if it was active
        const hadWidget = Boolean(document.querySelector('.goog-te-combo'));
        if (hadWidget) {
          triggerGoogleCombo('en');
        }
        return;
      }

      // Automatically load & apply full-page translator so ALL lesson explanations,
      // rule pills, cheat sheets & exam prompts translate into the user's language,
      // while all German sentences remain protected (`translate="no" notranslate`)!
      loadTranslateScript(code);
    },
    [loadTranslateScript]
  );

  const setLang = useCallback(
    (code: UILanguageCode) => {
      const mapped = code === 'zh' ? 'zh-CN' : code;
      selectWorldLanguage(mapped);
    },
    [selectWorldLanguage]
  );

  const enableWorldTranslate = useCallback(() => {
    loadTranslateScript(worldLangCode !== 'en' ? worldLangCode : undefined);
  }, [loadTranslateScript, worldLangCode]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        worldLangCode,
        currentWorldLang,
        setLang,
        selectWorldLanguage,
        t: TRANSLATIONS[lang],
        dir,
        worldTranslateActive,
        enableWorldTranslate,
      }}
    >
      {children}
      {/* Persistent hidden mount point for Google Website Translator so full-page
          translations stay active even after the LanguageSelector dropdown closes */}
      <div
        id="satzklar_google_translate_el"
        className="sr-only"
        aria-hidden="true"
      />
    </LanguageContext.Provider>
  );
}
