import { ArrowRight, Globe, Sparkles, X } from 'lucide-react';
import type { CEFRLevel } from '../../types/grammar';
import { useLanguage } from '../../i18n/useLanguage';
import { GenderBadge } from '../layout/GenderBadge';

interface WelcomeCardProps {
  onSelectLevel: (level: CEFRLevel) => void;
  onStartPlacement: () => void;
  onDismiss: () => void;
}

const LEVELS: Array<{ level: CEFRLevel; label: string; desc: string }> = [
  { level: 'A1', label: 'A1', desc: 'Articles, gender & V2 order' },
  { level: 'A2', label: 'A2', desc: 'Dative, Wo/Wohin & Perfekt' },
  { level: 'B1', label: 'B1', desc: 'Nebensätze & adjective endings' },
  { level: 'B2', label: 'B2', desc: 'Genitive, Konjunktiv II & passive' },
];

const QUICK_WORLD_LANGS = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'id', label: '🇮🇩 Indonesia' },
  { code: 'ar', label: '🇸🇦 العربية' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'tr', label: '🇹🇷 Türkçe' },
  { code: 'zh-CN', label: '🇨🇳 中文' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'ko', label: '🇰🇷 한국어' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'vi', label: '🇻🇳 Tiếng Việt' },
  { code: 'pt', label: '🇧🇷 Português' },
];

export function WelcomeCard({
  onSelectLevel,
  onStartPlacement,
  onDismiss,
}: WelcomeCardProps) {
  const { t, worldLangCode, selectWorldLanguage } = useLanguage();

  return (
    <section
      id="welcome-onboarding-card"
      className="paper-elevated rounded-2xl p-5 sm:p-7 mb-8 relative animate-slide-up"
    >
      <button
        id="btn-dismiss-welcome"
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss welcome card"
        className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-well)] transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="max-w-3xl">
        <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] mb-1.5">
          {t.welcomeTag}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)] tracking-tight mb-2">
          {t.welcomeTitle}
        </h1>
        <p className="text-sm sm:text-base text-[var(--ink-secondary)] leading-relaxed mb-4">
          {t.welcomeDesc}
        </p>

        {/* Native / Learning Language Quick Picker (100+ World Languages) */}
        <div
          translate="no"
          className="notranslate mb-5 p-3 rounded-xl bg-[var(--bg-well)]/75 border border-[var(--border-subtle)] space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[var(--ink-primary)] inline-flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Choose Your Learning Language (100+ World Languages)</span>
            </span>
            <span className="text-[11px] text-[var(--ink-muted)]">
              More languages in top-right 🌐 menu
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_WORLD_LANGS.map((item) => {
              const active = worldLangCode === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => selectWorldLanguage(item.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                      : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:border-[#2563EB] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Gender Legend */}
        <div translate="no" className="notranslate flex flex-wrap items-center gap-2 mb-6">
          <GenderBadge gender="M" showArticle size="md" />
          <GenderBadge gender="F" showArticle size="md" />
          <GenderBadge gender="N" showArticle size="md" />
          <GenderBadge gender="PL" showArticle size="md" />
        </div>

        {/* Starting Level Picker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {LEVELS.map((item) => (
            <button
              key={item.level}
              id={`welcome-level-${item.level}`}
              type="button"
              onClick={() => onSelectLevel(item.level)}
              className="group text-left p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-well)]/60 hover:bg-[var(--bg-surface)] hover:border-[#2563EB] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-sm text-[var(--ink-primary)]">
                  {item.label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--ink-muted)] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="block text-xs text-[var(--ink-secondary)] leading-snug">
                {item.desc}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-start-placement"
            type="button"
            onClick={onStartPlacement}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.takePlacement}</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-well)] transition-colors cursor-pointer"
          >
            {t.browseLessons}
          </button>
        </div>
      </div>
    </section>
  );
}
