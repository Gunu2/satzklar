import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import type {
  SatzklammerExercise,
  SatzklammerToken,
  SentenceField,
} from '../../types/grammar';
import { GenderBadge } from '../layout/GenderBadge';

interface SatzklammerViewProps {
  exercise: SatzklammerExercise;
  isAnswered: boolean;
  isCorrect: boolean;
  shakeKey: number;
  onSubmitOrder: (assembledTexts: string[]) => void;
}

const FIELD_META: Record<
  SentenceField,
  { label: string; short: string; colorClass: string; activeRing: string }
> = {
  vorfeld: {
    label: 'Pos 1 · Vorfeld',
    short: 'Pos 1',
    colorClass:
      'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
    activeRing: 'border-slate-500 bg-slate-100 dark:bg-slate-800',
  },
  verb2: {
    label: 'Pos 2 · Finite Verb',
    short: 'Verb (Pos 2)',
    colorClass:
      'bg-blue-50 text-[#1D4ED8] border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700',
    activeRing: 'border-[#2563EB] bg-blue-50/80 dark:bg-blue-950/50',
  },
  nebensatz_conj: {
    label: 'Conjunction',
    short: 'Conj.',
    colorClass:
      'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700',
    activeRing: 'border-[#D97706] bg-amber-50/80 dark:bg-amber-950/50',
  },
  mittelfeld: {
    label: 'Middle Field (TeKaMoLo)',
    short: 'Middle',
    colorClass:
      'bg-stone-100 text-stone-700 border-stone-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-600',
    activeRing: 'border-stone-500 bg-stone-100 dark:bg-slate-800',
  },
  endklammer: {
    label: 'End Bracket',
    short: 'End Bracket',
    colorClass:
      'bg-emerald-50 text-[#047857] border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
    activeRing: 'border-[#059669] bg-emerald-50/80 dark:bg-emerald-950/50',
  },
};

function deterministicShuffle(tokens: SatzklammerToken[], seedStr: string): SatzklammerToken[] {
  const arr = [...tokens];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) % 100000;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure it's not identical to original order
  if (arr.length > 1 && arr.every((t, idx) => t.id === tokens[idx].id)) {
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
  }
  return arr;
}

export function SatzklammerView({
  exercise,
  isAnswered,
  isCorrect,
  shakeKey,
  onSubmitOrder,
}: SatzklammerViewProps) {
  const shuffledTokens = useMemo(
    () => deterministicShuffle(exercise.tokens, exercise.id),
    [exercise.tokens, exercise.id]
  );

  const [placedIds, setPlacedIds] = useState<string[]>([]);

  const placedTokens = placedIds
    .map((id) => shuffledTokens.find((t) => t.id === id))
    .filter((t): t is SatzklammerToken => Boolean(t));

  const availableTokens = shuffledTokens.filter((t) => !placedIds.includes(t.id));

  const activeFields = new Set(placedTokens.map((t) => t.field));
  const hasConjunction = exercise.tokens.some((t) => t.field === 'nebensatz_conj');
  const hasEndBracket = exercise.tokens.some((t) => t.field === 'endklammer');

  const bracketLegend: SentenceField[] = [
    ...(hasConjunction ? (['vorfeld', 'nebensatz_conj'] as SentenceField[]) : (['vorfeld'] as SentenceField[])),
    'verb2',
    'mittelfeld',
    ...(hasEndBracket ? (['endklammer'] as SentenceField[]) : []),
  ];

  const handleAddTile = (id: string) => {
    if (isAnswered) return;
    setPlacedIds((prev) => [...prev, id]);
  };

  const handleRemoveTile = (id: string) => {
    if (isAnswered) return;
    setPlacedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleReset = () => {
    if (isAnswered) return;
    setPlacedIds([]);
  };

  const handleCheck = () => {
    if (isAnswered || placedTokens.length !== exercise.tokens.length) return;
    onSubmitOrder(placedTokens.map((t) => t.text));
  };

  // Keyboard support: 1-9 place available tiles, Backspace undo, Enter submit
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if (e.key >= '1' && e.key <= '9') {
        const idx = Number(e.key) - 1;
        if (idx < availableTokens.length) {
          e.preventDefault();
          handleAddTile(availableTokens[idx].id);
        }
      } else if (e.key === 'Backspace' && placedIds.length > 0) {
        e.preventDefault();
        setPlacedIds((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter' && placedIds.length === exercise.tokens.length) {
        e.preventDefault();
        handleCheck();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const allPlaced = placedTokens.length === exercise.tokens.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
          Satzklammer Builder · {exercise.ruleTag}
        </span>
        <span className="hidden sm:inline text-xs text-[var(--ink-muted)]">
          Keys <span className="kbd">1</span>–<span className="kbd">{exercise.tokens.length}</span> place ·{' '}
          <span className="kbd">⌫</span> undo
        </span>
      </div>

      {/* Prompt + Translation */}
      <div>
        <p className="font-display font-bold text-lg sm:text-xl text-[var(--ink-primary)] mb-1">
          {exercise.instruction}
        </p>
        <p className="text-sm text-[var(--ink-secondary)]">“{exercise.english}”</p>
      </div>

      {/* Real-Time Satzklammer Topological Field Highlight Strip */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
        {bracketLegend.map((field) => {
          const meta = FIELD_META[field];
          const lit = activeFields.has(field);
          return (
            <div
              key={field}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all ${
                lit
                  ? `${meta.colorClass} shadow-xs scale-[1.02]`
                  : 'border-[var(--border-subtle)] bg-[var(--bg-well)]/50 text-[var(--ink-muted)]'
              }`}
            >
              {meta.label}
            </div>
          );
        })}
      </div>

      {/* Sentence Construction Tray */}
      <div
        key={shakeKey}
        translate="no"
        className={`notranslate min-h-24 p-4 rounded-2xl border-2 border-dashed transition-all flex flex-wrap items-center gap-2 ${
          isAnswered
            ? isCorrect
              ? 'border-[#059669] bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-[#E11D48] bg-rose-50/50 dark:bg-rose-950/30 animate-shake'
            : 'border-[var(--border-strong)] bg-[var(--bg-well)]/60'
        }`}
      >
        {placedTokens.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)] w-full text-center py-3">
            Click word tiles below in order to construct the German sentence bracket…
          </p>
        ) : (
          placedTokens.map((token) => {
            const meta = FIELD_META[token.field];
            return (
              <button
                key={token.id}
                type="button"
                disabled={isAnswered}
                onClick={() => handleRemoveTile(token.id)}
                className={`group flex flex-col items-start px-3 py-2 rounded-xl border-2 transition-all cursor-pointer disabled:cursor-default animate-pop-in ${meta.colorClass}`}
              >
                <span className="text-[10px] font-mono uppercase opacity-75 leading-none mb-1">
                  {meta.short}
                </span>
                <span className="font-semibold text-sm sm:text-base flex items-center gap-1.5">
                  <span>{token.text}</span>
                  {token.gender && <GenderBadge gender={token.gender} size="xs" />}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Available Word Tile Bank */}
      <div translate="no" className="notranslate flex flex-wrap gap-2.5 min-h-14">
        {availableTokens.map((token, idx) => (
          <button
            key={token.id}
            id={`satz-tile-${idx + 1}`}
            type="button"
            disabled={isAnswered}
            onClick={() => handleAddTile(token.id)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#2563EB] hover:-translate-y-0.5 text-sm sm:text-base font-semibold text-[var(--ink-primary)] transition-all cursor-pointer shadow-xs"
          >
            <span className="kbd">{idx + 1}</span>
            <span>{token.text}</span>
            {token.gender && <GenderBadge gender={token.gender} size="xs" />}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      {!isAnswered && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleReset}
            disabled={placedIds.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] text-xs sm:text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            id="btn-check-satzklammer"
            type="button"
            disabled={!allPlaced}
            onClick={handleCheck}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-default shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Check Bracket</span>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white/20 font-mono text-[10px]">
              Enter
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
