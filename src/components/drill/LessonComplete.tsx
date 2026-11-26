import { Award, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LessonCompleteProps {
  title: string;
  cefr: string;
  correctCount: number;
  totalCount: number;
  xpEarned: number;
  mistakesSaved: number;
  isReviewMode?: boolean;
  onBackToRoadmap: () => void;
  onRetry: () => void;
  onOpenVault: () => void;
}

const CONFETTI_COLORS = ['#2563EB', '#E11D48', '#059669', '#D97706', '#0EA5E9'];

export function LessonComplete({
  title,
  cefr,
  correctCount,
  totalCount,
  xpEarned,
  mistakesSaved,
  isReviewMode = false,
  onBackToRoadmap,
  onRetry,
  onOpenVault,
}: LessonCompleteProps) {
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;

  return (
    <div
      id="lesson-complete-card"
      className="max-w-xl mx-auto paper-elevated rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden animate-pop-in"
    >
      {/* Tasteful CSS Confetti Burst */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${6 + ((i * 5.3) % 88)}%`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${(i % 6) * 110}ms`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-[#059669]" />
        </div>

        <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669] mb-1">
          {isReviewMode ? 'Weak Spots Session Complete' : `${cefr} Unit Complete`}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)] mb-2">
          {accuracy >= 90 ? 'Hervorragend!' : accuracy >= 70 ? 'Gut gemacht!' : 'Solid Practice!'}
        </h2>
        <p className="text-sm text-[var(--ink-secondary)] mb-6">{title}</p>

        {/* Stats Trio */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="paper-well rounded-2xl p-3.5">
            <p className="font-mono text-2xl font-extrabold text-[#059669]">{accuracy}%</p>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">
              Accuracy ({correctCount}/{totalCount})
            </p>
          </div>
          <div className="paper-well rounded-2xl p-3.5">
            <p className="font-mono text-2xl font-extrabold text-[#2563EB] dark:text-[#60A5FA]">
              +{xpEarned}
            </p>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">XP Earned</p>
          </div>
          <div className="paper-well rounded-2xl p-3.5">
            <p className="font-mono text-2xl font-extrabold text-[#D97706]">{mistakesSaved}</p>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">Saved to Vault</p>
          </div>
        </div>

        {mistakesSaved > 0 ? (
          <div className="rounded-xl p-3.5 mb-6 bg-amber-50/80 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-800/70 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
              <p className="text-xs sm:text-sm text-[var(--ink-primary)]">
                {mistakesSaved} missed {mistakesSaved === 1 ? 'rule' : 'rules'} added to your Weak Spots Vault.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenVault}
              className="shrink-0 text-xs font-bold text-[#B45309] dark:text-amber-300 hover:underline cursor-pointer"
            >
              Review →
            </button>
          </div>
        ) : (
          <div className="rounded-xl p-3.5 mb-6 bg-emerald-50/70 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center gap-2 text-sm text-[#047857] dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero mistakes—every grammar rule locked in!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="btn-retry-lesson"
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--ink-primary)] hover:bg-[var(--bg-well)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again</span>
          </button>
          <button
            id="btn-finish-to-roadmap"
            type="button"
            onClick={onBackToRoadmap}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <span>Back to Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
