import { useState } from 'react';
import { MapPin, MoveRight } from 'lucide-react';
import type { WechselSimExercise } from '../../types/grammar';
import { GenderBadge } from '../layout/GenderBadge';
import { AudioButton } from './AudioButton';

interface WechselSimViewProps {
  exercise: WechselSimExercise;
  selectedOption: number | null;
  isAnswered: boolean;
  shakeKey: number;
  onSelectOption: (index: number) => void;
}

export function WechselSimView({
  exercise,
  selectedOption,
  isAnswered,
  shakeKey,
  onSelectOption,
}: WechselSimViewProps) {
  const [simMode, setSimMode] = useState<'wo' | 'wohin'>('wo');

  const activeExample =
    simMode === 'wo' ? exercise.staticExample : exercise.motionExample;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
          Wechselpräposition Simulator · “{exercise.preposition}”
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--ink-secondary)]">
            {exercise.noun.baseArticle} <strong>{exercise.noun.word}</strong> ({exercise.noun.meaning})
          </span>
          <GenderBadge gender={exercise.noun.gender} size="xs" />
        </div>
      </div>

      {/* Interactive Wo? vs Wohin? Visual Simulator */}
      <div className="paper-well rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <button
            id="sim-toggle-wo"
            type="button"
            onClick={() => setSimMode('wo')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              simMode === 'wo'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Wo? · Static (Dativ)</span>
          </button>
          <button
            id="sim-toggle-wohin"
            type="button"
            onClick={() => setSimMode('wohin')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              simMode === 'wohin'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <MoveRight className="w-4 h-4 shrink-0" />
            <span>Wohin? · Motion (Akk)</span>
          </button>
        </div>

        {/* Visual Schematic + Live Paired Example */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
          {/* Minimalist Editorial SVG Diagram */}
          <div className="w-28 h-20 shrink-0 rounded-lg bg-[var(--bg-well)] flex items-center justify-center border border-[var(--border-subtle)]">
            {simMode === 'wo' ? (
              <svg viewBox="0 0 110 76" className="w-24 h-16" aria-label="Static location diagram">
                <rect
                  x="22"
                  y="38"
                  width="66"
                  height="26"
                  rx="6"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                />
                <circle cx="55" cy="28" r="10" fill="#059669" />
                <text
                  x="55"
                  y="55"
                  textAnchor="middle"
                  className="fill-[var(--ink-secondary)] text-[10px] font-mono font-bold"
                >
                  RESTING
                </text>
              </svg>
            ) : (
              <svg viewBox="0 0 110 76" className="w-24 h-16" aria-label="Directional movement diagram">
                <rect
                  x="54"
                  y="24"
                  width="44"
                  height="34"
                  rx="6"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                <circle cx="20" cy="41" r="8" fill="#2563EB" opacity="0.45" />
                <path
                  d="M30 41 H68 M62 35 L69 41 L62 47"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text
                  x="76"
                  y="70"
                  textAnchor="middle"
                  className="fill-[var(--ink-secondary)] text-[9px] font-mono font-bold"
                >
                  MOVING IN
                </text>
              </svg>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 mb-1">
              <span
                className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                  simMode === 'wo'
                    ? 'bg-emerald-50 text-[#047857] dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/50 dark:text-blue-300'
                }`}
              >
                {activeExample.highlight}
              </span>
            </div>
            <p
              translate="no"
              className="notranslate font-display font-bold text-base text-[var(--ink-primary)]"
            >
              {activeExample.german}
            </p>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5 mb-2">
              {activeExample.english}
            </p>
            <AudioButton text={activeExample.german} compact />
          </div>
        </div>
      </div>

      {/* Challenge Prompt */}
      <div className="rounded-2xl p-4 sm:p-5 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
          Now decide: Is this Wo? (Dativ) or Wohin? (Akkusativ)?
        </p>
        <p
          translate="no"
          className="notranslate font-display text-xl sm:text-2xl font-bold text-[var(--ink-primary)] leading-snug"
        >
          {exercise.prompt}
        </p>
        <p className="text-sm text-[var(--ink-muted)] mt-1">{exercise.english}</p>
      </div>

      {/* 4 Options */}
      <div
        key={shakeKey}
        translate="no"
        className={`notranslate grid grid-cols-2 gap-3 ${
          isAnswered && selectedOption !== exercise.correctIndex ? 'animate-shake' : ''
        }`}
      >
        {exercise.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isRight = idx === exercise.correctIndex;

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
              key={`${exercise.id}-wopt-${idx}`}
              id={`drill-option-${idx + 1}`}
              type="button"
              disabled={isAnswered}
              onClick={() => onSelectOption(idx)}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl border-2 font-semibold text-base transition-all cursor-pointer disabled:cursor-default ${style}`}
            >
              <span>{opt}</span>
              <span className="kbd">{idx + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
