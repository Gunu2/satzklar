import { useState } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import type {
  CaseDrillExercise,
  NounHint,
  VerbConjugationExercise,
} from '../../types/grammar';
import { GenderBadge } from '../layout/GenderBadge';
import { getGenderClasses } from '../../utils/genderStyles';

interface CaseDrillViewProps {
  exercise: CaseDrillExercise | VerbConjugationExercise;
  selectedOption: number | null;
  isAnswered: boolean;
  shakeKey: number;
  onSelectOption: (index: number) => void;
}

export function CaseDrillView({
  exercise,
  selectedOption,
  isAnswered,
  shakeKey,
  onSelectOption,
}: CaseDrillViewProps) {
  const [activeHint, setActiveHint] = useState<NounHint | null>(null);

  const nouns = exercise.type === 'case_drill' ? (exercise.nouns ?? []) : [];
  const nounMap = new Map(nouns.map((n) => [n.word.toLowerCase(), n]));

  // Render prompt with highlighted blank and interactive clickable nouns
  const renderPrompt = () => {
    const parts = exercise.prompt.split(/(_{2,}|[A-Za-zÄÖÜäöüß-]+)/g);
    const chosenWord =
      isAnswered && selectedOption !== null ? exercise.options[selectedOption] : null;
    const isCorrect = isAnswered && selectedOption === exercise.correctIndex;

    return parts.map((segment, i) => {
      if (/^_{2,}$/.test(segment)) {
        return (
          <span
            key={`blank-${i}`}
            className={`inline-flex items-center justify-center min-w-20 px-3 py-0.5 mx-1 rounded-lg border-b-2 font-mono font-bold transition-all ${
              isAnswered
                ? isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-[#059669] text-[#047857] dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-[#E11D48] text-[#BE123C] dark:text-rose-300'
                : 'bg-[var(--bg-well)] border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
            }`}
          >
            {chosenWord ?? '___'}
          </span>
        );
      }

      const matchedNoun = nounMap.get(segment.toLowerCase());
      if (matchedNoun) {
        const isSelectedNoun = activeHint?.word === matchedNoun.word;
        const gStyle = getGenderClasses(matchedNoun.gender);
        return (
          <button
            key={`noun-${i}`}
            type="button"
            onClick={() =>
              setActiveHint(isSelectedNoun ? null : matchedNoun)
            }
            title="Click to inspect noun gender and case trigger"
            className={`inline-flex items-baseline gap-1 px-1 py-0.5 rounded-md border-b-2 border-dashed transition-colors cursor-pointer ${
              isSelectedNoun
                ? `${gStyle.bg} ${gStyle.text} ${gStyle.border}`
                : 'border-[var(--border-strong)] hover:bg-[var(--bg-well)] text-[var(--ink-primary)]'
            }`}
          >
            <span>{segment}</span>
          </button>
        );
      }

      return <span key={`txt-${i}`}>{segment}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode Badge / Verb Header */}
      {exercise.type === 'verb_conjugation' ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#2563EB]/10 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#2563EB]/25">
            {exercise.tense}
          </span>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-well)] text-[var(--ink-primary)] border border-[var(--border-subtle)]">
            Infinitive: <strong>{exercise.infinitive}</strong>
          </span>
          <span className="font-mono text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-well)] text-[var(--ink-secondary)] border border-[var(--border-subtle)]">
            Subject: {exercise.subject}
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            Case & Article Drill · {exercise.ruleTag}
          </span>
          {nouns.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
              <HelpCircle className="w-3.5 h-3.5" />
              Click underlined noun for gender hint
            </span>
          )}
        </div>
      )}

      {/* Main Prompt Sentence */}
      <div className="paper-well rounded-2xl p-5 sm:p-6">
        <p
          translate="no"
          className="notranslate font-display text-2xl sm:text-[26px] font-bold text-[var(--ink-primary)] leading-relaxed"
        >
          {renderPrompt()}
        </p>
        <p className="text-sm text-[var(--ink-muted)] mt-2.5">{exercise.english}</p>

        {/* Interactive Noun Hint Popover */}
        {activeHint && (
          <div
            id="noun-gender-hint-popover"
            className="mt-4 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-sm animate-pop-in"
          >
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span
                translate="no"
                className="notranslate font-display font-bold text-sm text-[var(--ink-primary)]"
              >
                {activeHint.baseForm}
              </span>
              <GenderBadge gender={activeHint.gender} size="xs" />
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-secondary)]">
                {activeHint.activeCase}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-snug">
              {activeHint.caseTrigger}
            </p>
          </div>
        )}
      </div>

      {/* Multiple Choice Grid (1-4) */}
      <div
        key={shakeKey}
        translate="no"
        className={`notranslate grid grid-cols-2 gap-3 ${
          isAnswered && selectedOption !== exercise.correctIndex ? 'animate-shake' : ''
        }`}
      >
        {exercise.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isRight = idx === exercise.correctIndex;

          let cardStyle =
            'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#2563EB] hover:bg-[var(--bg-elevated)] text-[var(--ink-primary)]';

          if (isAnswered) {
            if (isRight) {
              cardStyle =
                'border-[#059669] bg-emerald-50 dark:bg-emerald-950/45 text-[#047857] dark:text-emerald-200 shadow-xs';
            } else if (isSelected) {
              cardStyle =
                'border-[#E11D48] bg-rose-50 dark:bg-rose-950/45 text-[#BE123C] dark:text-rose-200';
            } else {
              cardStyle =
                'border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-45 text-[var(--ink-muted)]';
            }
          }

          return (
            <button
              key={`${exercise.id}-opt-${idx}`}
              id={`drill-option-${idx + 1}`}
              type="button"
              disabled={isAnswered}
              onClick={() => onSelectOption(idx)}
              className={`group flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border-2 font-semibold text-base sm:text-lg transition-all cursor-pointer disabled:cursor-default ${cardStyle}`}
            >
              <span className="truncate">{option}</span>
              <span className="kbd shrink-0">{idx + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
