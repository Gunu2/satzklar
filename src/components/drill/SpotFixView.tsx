import { useEffect, useState } from 'react';
import { Search, Wrench } from 'lucide-react';
import type { SpotFixExercise } from '../../types/grammar';

interface SpotFixViewProps {
  exercise: SpotFixExercise;
  selectedFix: number | null;
  isAnswered: boolean;
  shakeKey: number;
  onSelectFix: (fixIndex: number) => void;
}

export function SpotFixView({
  exercise,
  selectedFix,
  isAnswered,
  shakeKey,
  onSelectFix,
}: SpotFixViewProps) {
  const [foundErrorToken, setFoundErrorToken] = useState(false);
  const [wrongClickedIndex, setWrongClickedIndex] = useState<number | null>(null);

  const handleTokenClick = (idx: number) => {
    if (isAnswered || foundErrorToken) return;
    if (idx === exercise.errorTokenIndex) {
      setFoundErrorToken(true);
      setWrongClickedIndex(null);
    } else {
      setWrongClickedIndex(idx);
      window.setTimeout(() => {
        setWrongClickedIndex((cur) => (cur === idx ? null : cur));
      }, 900);
    }
  };

  // Keyboard 1-4 once error token is spotted
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!foundErrorToken || isAnswered) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (idx < exercise.fixOptions.length) {
          e.preventDefault();
          onSelectFix(idx);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [foundErrorToken, isAnswered, exercise.fixOptions.length, onSelectFix]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
          Spot & Fix the Mistake · {exercise.ruleTag}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#D97706]">
          {foundErrorToken ? (
            <>
              <Wrench className="w-3.5 h-3.5" />
              Step 2: Pick the fix
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              Step 1: Click the broken word
            </>
          )}
        </span>
      </div>

      <p className="text-sm text-[var(--ink-secondary)]">{exercise.promptHint}</p>

      {/* Interactive Tokenized Sentence */}
      <div className="paper-well rounded-2xl p-5 sm:p-6">
        <div translate="no" className="notranslate flex flex-wrap items-center gap-2 mb-3">
          {exercise.sentenceTokens.map((tok, idx) => {
            const isTarget = idx === exercise.errorTokenIndex;
            const isWrongClick = wrongClickedIndex === idx;

            let tokenStyle =
              'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-primary)] hover:border-[#D97706] hover:bg-amber-50/50 dark:hover:bg-amber-950/30';

            if (isWrongClick) {
              tokenStyle =
                'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-muted)] animate-shake';
            } else if ((foundErrorToken || isAnswered) && isTarget) {
              if (isAnswered && selectedFix === exercise.correctFixIndex) {
                tokenStyle =
                  'border-[#059669] bg-emerald-50 dark:bg-emerald-950/50 text-[#047857] dark:text-emerald-200';
              } else {
                tokenStyle =
                  'border-[#E11D48] bg-rose-50 dark:bg-rose-950/50 text-[#BE123C] dark:text-rose-200 line-through decoration-2';
              }
            }

            const displayWord =
              isAnswered && isTarget && selectedFix === exercise.correctFixIndex
                ? exercise.fixOptions[exercise.correctFixIndex]
                : tok;

            return (
              <button
                key={`${exercise.id}-tok-${idx}`}
                id={`spot-token-${idx}`}
                type="button"
                disabled={foundErrorToken || isAnswered}
                onClick={() => handleTokenClick(idx)}
                className={`px-3 py-2 rounded-xl border-2 font-display font-bold text-lg sm:text-xl transition-all cursor-pointer disabled:cursor-default ${tokenStyle}`}
              >
                {displayWord}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-[var(--ink-muted)]">Target meaning: “{exercise.english}”</p>

        {wrongClickedIndex !== null && (
          <p className="text-xs font-medium text-[#D97706] mt-2 animate-pop-in">
            “{exercise.sentenceTokens[wrongClickedIndex]}” is grammatically fine—check another word!
          </p>
        )}

        {!foundErrorToken && !isAnswered && (
          <button
            id="btn-reveal-error-token"
            type="button"
            onClick={() => setFoundErrorToken(true)}
            className="mt-3 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink-primary)] underline underline-offset-4 cursor-pointer"
          >
            Stuck? Highlight the broken word
          </button>
        )}
      </div>

      {/* Step 2: Fix Choices */}
      {(foundErrorToken || isAnswered) && (
        <div
          key={shakeKey}
          className={`space-y-2.5 animate-slide-up ${
            isAnswered && selectedFix !== exercise.correctFixIndex ? 'animate-shake' : ''
          }`}
        >
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
            Replace “{exercise.sentenceTokens[exercise.errorTokenIndex]}” with:
          </p>
          <div translate="no" className="notranslate grid grid-cols-2 gap-3">
            {exercise.fixOptions.map((opt, idx) => {
              const isSelected = selectedFix === idx;
              const isRight = idx === exercise.correctFixIndex;
              let style =
                'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#2563EB] text-[var(--ink-primary)]';
              if (isAnswered) {
                if (isRight) {
                  style =
                    'border-[#059669] bg-emerald-50 dark:bg-emerald-950/45 text-[#047857] dark:text-emerald-200';
                } else if (isSelected) {
                  style =
                    'border-[#E11D48] bg-rose-50 dark:bg-rose-950/45 text-[#BE123C] dark:text-rose-200';
                } else {
                  style = 'border-[var(--border-subtle)] opacity-45';
                }
              }

              return (
                <button
                  key={`${exercise.id}-fix-${idx}`}
                  id={`drill-option-${idx + 1}`}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => onSelectFix(idx)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 font-semibold text-base transition-all cursor-pointer disabled:cursor-default ${style}`}
                >
                  <span>{opt}</span>
                  <span className="kbd">{idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
