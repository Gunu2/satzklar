import { useEffect } from 'react';
import { X, Play, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import type { Lesson } from '../../types/grammar';
import { GenderBadge } from '../layout/GenderBadge';
import { AudioButton } from '../drill/AudioButton';

interface CheatSheetModalProps {
  lesson: Lesson;
  onClose: () => void;
  onStartDrill: (lesson: Lesson) => void;
}

export function CheatSheetModal({
  lesson,
  onClose,
  onStartDrill,
}: CheatSheetModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`1-Minute Cheat Sheet: ${lesson.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="paper-elevated w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-[#2563EB]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
                1-Minute Cheat Sheet · {lesson.cefr}
              </span>
            </div>
            <h2 className="font-display font-extrabold text-xl text-[var(--ink-primary)]">
              {lesson.title}
            </h2>
            <p translate="no" className="notranslate font-mono text-xs text-[var(--ink-muted)]">
              {lesson.germanTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cheat sheet"
            className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <p className="text-sm sm:text-base text-[var(--ink-primary)] leading-relaxed">
            {lesson.cheatSheet.summary}
          </p>

          {/* Key Takeaways */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Key Rules to Spot
            </h3>
            <ul className="space-y-2">
              {lesson.cheatSheet.keyTakeaways.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-[var(--ink-secondary)] leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Patterns */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Pattern Formulas & Audio
            </h3>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {lesson.cheatSheet.patterns.map((p) => (
                <div
                  key={p.formula + p.example}
                  className="paper-well rounded-xl p-3.5 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      translate="no"
                      className="notranslate font-mono text-xs font-bold text-[var(--ink-primary)]"
                    >
                      {p.formula}
                    </span>
                    {p.gender && <GenderBadge gender={p.gender} size="xs" />}
                  </div>
                  <div>
                    <p
                      translate="no"
                      className="notranslate font-semibold text-sm text-[var(--ink-primary)]"
                    >
                      {p.example}
                    </p>
                    <p className="text-xs text-[var(--ink-muted)]">{p.translation}</p>
                  </div>
                  <div>
                    <AudioButton text={p.example} compact />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Watch Out Callout */}
          <div className="rounded-xl p-4 bg-amber-50/90 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/70 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#B45309] dark:text-amber-300 mb-0.5">
                Common Trap
              </p>
              <p className="text-sm text-[var(--ink-primary)] leading-relaxed">
                {lesson.cheatSheet.watchOut}
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-well)]/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            Back to Roadmap
          </button>
          <button
            id="btn-cheatsheet-start-drill"
            type="button"
            onClick={() => onStartDrill(lesson)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start {lesson.exercises.length} Drills</span>
          </button>
        </div>
      </div>
    </div>
  );
}
