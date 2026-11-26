import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Play,
  Trash2,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { EXERCISE_INDEX } from '../../data';
import type { CEFRLevel, MistakeRecord } from '../../types/grammar';
import { getSortedMistakes } from '../../utils/srs';
import { AudioButton } from '../drill/AudioButton';

interface MistakeVaultViewProps {
  mistakes: Record<string, MistakeRecord>;
  onStartReview: (records: MistakeRecord[]) => void;
  onRemoveMistake: (exerciseId: string) => void;
  onGoToRoadmap: () => void;
}

export function MistakeVaultView({
  mistakes,
  onStartReview,
  onRemoveMistake,
  onGoToRoadmap,
}: MistakeVaultViewProps) {
  const [filter, setFilter] = useState<'All' | CEFRLevel>('All');

  const sorted = getSortedMistakes(mistakes);
  const filtered =
    filter === 'All' ? sorted : sorted.filter((m) => m.cefr === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#E11D48] mb-1">
            Spaced Repetition Deck
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)]">
            Smart Mistake Vault
          </h1>
          <p className="text-sm text-[var(--ink-secondary)] mt-1">
            Missed rules appear here automatically. Answer an item correctly twice in review to graduate it.
          </p>
        </div>

        {filtered.length > 0 && (
          <button
            id="btn-start-vault-review"
            type="button"
            onClick={() => onStartReview(filtered)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E11D48] text-white font-semibold text-sm hover:bg-rose-700 transition-colors cursor-pointer shadow-sm shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Review {filtered.length} Weak {filtered.length === 1 ? 'Spot' : 'Spots'}</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                filter === lvl
                  ? 'bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sorted.length === 0 ? (
        <div className="paper-card rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-[#059669]" />
          </div>
          <h2 className="font-display text-xl font-bold text-[var(--ink-primary)] mb-2">
            Your Mistake Vault is spotless!
          </h2>
          <p className="text-sm text-[var(--ink-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
            Whenever you miss a case ending, verb position, or preposition during a drill—or bookmark a tricky rule—it lands here for targeted spaced review.
          </p>
          <button
            type="button"
            onClick={onGoToRoadmap}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-sm font-semibold cursor-pointer"
          >
            <span>Explore Roadmap</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="paper-card rounded-2xl p-8 text-center">
          <p className="text-sm text-[var(--ink-secondary)]">
            No saved weak spots at level <strong>{filter}</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => {
            const entry = EXERCISE_INDEX[record.exerciseId];
            if (!entry) return null;

            return (
              <article
                key={record.exerciseId}
                className="paper-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-primary)] border border-[var(--border-subtle)]">
                      {record.cefr}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#D97706] inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {record.ruleTag}
                    </span>
                    <span className="text-xs text-[var(--ink-muted)]">
                      Missed {record.wrongCount}× · Mastery {record.consecutiveRight}/2
                    </span>
                  </div>

                  <p className="font-display font-bold text-base sm:text-lg text-[var(--ink-primary)]">
                    {entry.exercise.fullGerman}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {entry.exercise.english} · Unit: {entry.lesson.title}
                  </p>

                  <div className="rounded-xl p-3 bg-[var(--bg-well)]/80 border border-[var(--border-subtle)] flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
                      {record.rulePill}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <AudioButton text={entry.exercise.fullGerman} compact />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onStartReview([record])}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Drill</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveMistake(record.exerciseId)}
                      title="Mark mastered & remove from vault"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--ink-muted)] hover:text-[#059669] hover:border-[#059669] cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mastered</span>
                      <Trash2 className="w-3 h-3 sm:hidden" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
