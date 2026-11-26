import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X, ArrowRight, Sparkles } from 'lucide-react';
import {
  PLACEMENT_QUESTIONS,
  computeRecommendedLevel,
} from '../../data/placementQuestions';
import type { CEFRLevel } from '../../types/grammar';

interface PlacementModalProps {
  onComplete: (recommendedLevel: CEFRLevel) => void;
  onClose: () => void;
}

export function PlacementModal({ onComplete, onClose }: PlacementModalProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = PLACEMENT_QUESTIONS[index];
  const isAnswered = selected !== null;
  const isCorrect = isAnswered && selected === current.correctIndex;

  const handleSelect = (optIdx: number) => {
    if (isAnswered) return;
    setSelected(optIdx);
    if (optIdx === current.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (!isAnswered) return;
    if (index + 1 >= PLACEMENT_QUESTIONS.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (finished) return;
      if (!isAnswered && ['1', '2', '3', '4'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (idx < current.options.length) {
          e.preventDefault();
          handleSelect(idx);
        }
      } else if (isAnswered && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const recommendation = computeRecommendedLevel(score);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick Placement Check"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="paper-elevated w-full max-w-xl rounded-2xl overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <h2 className="font-display font-bold text-base text-[var(--ink-primary)]">
              Quick Placement Check
            </h2>
            {!finished && (
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[var(--bg-well)] text-[var(--ink-secondary)]">
                {index + 1} / {PLACEMENT_QUESTIONS.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close placement check"
            className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {!finished && (
          <div className="h-1.5 bg-[var(--bg-well)]">
            <div
              className="h-full bg-[#2563EB] transition-all duration-300"
              style={{
                width: `${((index + (isAnswered ? 1 : 0)) / PLACEMENT_QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        )}

        <div className="p-5 sm:p-6">
          {!finished ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-secondary)]">
                  Testing {current.cefr}
                </span>
                <span className="text-xs text-[var(--ink-muted)] hidden sm:inline">
                  Press <span className="kbd">1</span>–<span className="kbd">4</span>
                </span>
              </div>

              <p className="font-display text-xl sm:text-2xl font-bold text-[var(--ink-primary)] leading-snug mb-1.5">
                {current.prompt}
              </p>
              <p className="text-sm text-[var(--ink-muted)] mb-5">{current.english}</p>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {current.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isRight = idx === current.correctIndex;
                  let style =
                    'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#2563EB] text-[var(--ink-primary)]';
                  if (isAnswered) {
                    if (isRight) {
                      style =
                        'border-[#059669] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200';
                    } else if (isSelected) {
                      style =
                        'border-[#E11D48] bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200';
                    } else {
                      style = 'border-[var(--border-subtle)] opacity-50';
                    }
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelect(idx)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 font-semibold text-sm sm:text-base transition-all cursor-pointer disabled:cursor-default ${style}`}
                    >
                      <span>{opt}</span>
                      <span className="kbd">{idx + 1}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div
                  className={`rounded-xl p-4 border animate-slide-up ${
                    isCorrect
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-[var(--ink-primary)] leading-snug">
                      {current.rulePill}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-2.5 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {index + 1 === PLACEMENT_QUESTIONS.length
                        ? 'See My Level'
                        : 'Next Question'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 animate-pop-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] font-mono font-extrabold text-2xl mb-4 border border-[#2563EB]/25">
                {recommendation.level}
              </div>
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                Score: {score} / {PLACEMENT_QUESTIONS.length}
              </p>
              <h3 className="font-display text-2xl font-extrabold text-[var(--ink-primary)] mb-2">
                {recommendation.headline}
              </h3>
              <p className="text-sm text-[var(--ink-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
                {recommendation.advice}
              </p>
              <button
                id="btn-apply-placement"
                type="button"
                onClick={() => onComplete(recommendation.level)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
              >
                <span>Open {recommendation.level} Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
