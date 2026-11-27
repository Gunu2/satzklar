import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Languages, Search, ShieldCheck } from 'lucide-react';
import { WORLD_LANGUAGES } from '../../i18n/worldLanguages';
import { useLanguage } from '../../i18n/useLanguage';

export function LanguageSelector() {
  const {
    worldLangCode,
    currentWorldLang,
    selectWorldLanguage,
    t,
  } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const filteredLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WORLD_LANGUAGES;
    return WORLD_LANGUAGES.filter(
      (item) =>
        item.nativeName.toLowerCase().includes(q) ||
        item.englishName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q)
    );
  }, [query]);

  const instantList = filteredLanguages.filter((l) => l.instant);
  const moreWorldList = filteredLanguages.filter((l) => !l.instant);

  return (
    <div ref={containerRef} className="relative notranslate" translate="no">
      <button
        id="btn-language-selector"
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setQuery('');
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Choose your native language (100+ world languages)"
        className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
        <span aria-hidden="true">{currentWorldLang.flag}</span>
        <span className="hidden sm:inline uppercase font-mono text-[11px]">
          {currentWorldLang.code.split('-')[0]}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[var(--ink-muted)] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          id="language-dropdown"
          role="dialog"
          aria-label="World language selector"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl paper-elevated p-3 z-50 animate-pop-in"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-display font-bold text-[var(--ink-primary)] flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Learning Language (All World Languages)</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-[#059669]">
              {WORLD_LANGUAGES.length}+
            </span>
          </div>

          {/* Search across all 100+ world languages */}
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 text-[var(--ink-muted)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchRef}
              id="input-search-language"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language (e.g. Indonesia, Thai, Russian, Swahili...)"
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-xs text-[var(--ink-primary)]"
            />
          </div>

          <div className="max-h-72 overflow-y-auto pr-0.5 space-y-2.5">
            {instantList.length > 0 && (
              <div>
                <p className="px-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Popular &amp; Instant UI
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {instantList.map((option) => {
                    const selected = option.code === worldLangCode;
                    const optId = option.code === 'zh-CN' ? 'zh' : option.code;
                    return (
                      <button
                        key={option.code}
                        id={`lang-opt-${optId}`}
                        type="button"
                        onClick={() => {
                          selectWorldLanguage(option.code);
                          setOpen(false);
                        }}
                        className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          selected
                            ? 'bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] font-semibold'
                            : 'text-[var(--ink-secondary)] hover:bg-[var(--bg-well)] hover:text-[var(--ink-primary)]'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <span aria-hidden="true">{option.flag}</span>
                          <span className="truncate">{option.nativeName}</span>
                        </span>
                        {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {moreWorldList.length > 0 && (
              <div>
                <p className="px-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  All World Languages (Auto-Translate Explanations)
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {moreWorldList.map((option) => {
                    const selected = option.code === worldLangCode;
                    return (
                      <button
                        key={option.code}
                        id={`lang-opt-${option.code}`}
                        type="button"
                        onClick={() => {
                          selectWorldLanguage(option.code);
                          setOpen(false);
                        }}
                        className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          selected
                            ? 'bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] font-semibold'
                            : 'text-[var(--ink-secondary)] hover:bg-[var(--bg-well)] hover:text-[var(--ink-primary)]'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <span aria-hidden="true">{option.flag}</span>
                          <span className="truncate">{option.nativeName}</span>
                        </span>
                        {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredLanguages.length === 0 && (
              <p className="text-xs text-center text-[var(--ink-muted)] py-4">
                No matching language found for “{query}”.
              </p>
            )}
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-[var(--border-subtle)]">
            <p className="flex items-start gap-1.5 text-[10px] leading-snug text-[var(--ink-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
              <span>{t.germanProtectedNote}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
