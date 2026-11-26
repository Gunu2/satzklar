import { ArrowRight, Sparkles, X } from 'lucide-react';
import type { CEFRLevel } from '../../types/grammar';
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

export function WelcomeCard({
  onSelectLevel,
  onStartPlacement,
  onDismiss,
}: WelcomeCardProps) {
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
          Zero-Signup · 100% Local · Visual German Grammar
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)] tracking-tight mb-2">
          See the pattern behind every German sentence.
        </h1>
        <p className="text-sm sm:text-base text-[var(--ink-secondary)] leading-relaxed mb-5">
          Pick your starting CEFR level below, or take a 2-minute Quick Placement Check to find your exact spot. Every noun gender stays consistently color-coded across the studio:
        </p>

        {/* Visual Gender Legend */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
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
            <span>Take 2-Minute Quick Placement Check</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-well)] transition-colors cursor-pointer"
          >
            Browse all 12 lessons
          </button>
        </div>
      </div>
    </section>
  );
}
