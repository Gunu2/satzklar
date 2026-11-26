import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Flame,
  Lightbulb,
  XCircle,
} from 'lucide-react';
import type { Exercise } from '../../types/grammar';
import { speakGerman } from '../../utils/speech';
import { AudioButton } from './AudioButton';
import { CaseDrillView } from './CaseDrillView';
import { LessonComplete } from './LessonComplete';
import { SatzklammerView } from './SatzklammerView';
import { SpotFixView } from './SpotFixView';
import { WechselSimView } from './WechselSimView';

export interface DrillSessionItem {
  exercise: Exercise;
  lessonId: string;
}

interface DrillPlayerProps {
  sessionTitle: string;
  cefrLabel: string;
  items: DrillSessionItem[];
  isReviewMode?: boolean;
  savedMistakeIds: Set<string>;
  onRecordAnswer: (
    item: DrillSessionItem,
    isCorrect: boolean
  ) => void;
  onToggleWeakSpot: (item: DrillSessionItem, shouldSave: boolean) => void;
  onCompleteSession: (summary: {
    correctCount: number;
    totalCount: number;
    xpEarned: number;
  }) => void;
  onExit: () => void;
  onOpenVault: () => void;
  onOpenGrammarDrawer: () => void;
}

export function DrillPlayer({
  sessionTitle,
  cefrLabel,
  items,
  isReviewMode = false,
  savedMistakeIds,
  onRecordAnswer,
  onToggleWeakSpot,
  onCompleteSession,
  onExit,
  onOpenVault,
  onOpenGrammarDrawer,
}: DrillPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const [sessionStreak, setSessionStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [mistakesSavedInSession, setMistakesSavedInSession] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentItem = items[currentIndex];
  const exercise = currentItem?.exercise;
  const isSavedToVault = exercise ? savedMistakeIds.has(exercise.id) : false;

  const finalizeAnswer = (correct: boolean) => {
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      const nextStreak = sessionStreak + 1;
      setSessionStreak(nextStreak);
      setCorrectCount((c) => c + 1);
      setXpEarned((x) => x + 15 + (nextStreak >= 3 ? 5 : 0));
    } else {
      setSessionStreak(0);
      setShakeKey((k) => k + 1);
      setMistakesSavedInSession((m) => m + 1);
    }

    onRecordAnswer(currentItem, correct);
  };

  const handleSelectChoice = (optIdx: number) => {
    if (isAnswered || !exercise) return;
    setSelectedOption(optIdx);

    if (
      exercise.type === 'case_drill' ||
      exercise.type === 'verb_conjugation' ||
      exercise.type === 'wechsel_sim'
    ) {
      finalizeAnswer(optIdx === exercise.correctIndex);
    } else if (exercise.type === 'spot_fix') {
      finalizeAnswer(optIdx === exercise.correctFixIndex);
    }
  };

  const handleSubmitSatzklammer = (assembledTexts: string[]) => {
    if (isAnswered || !exercise || exercise.type !== 'satzklammer') return;
    const correct =
      assembledTexts.length === exercise.correctOrder.length &&
      assembledTexts.every((txt, idx) => txt === exercise.correctOrder[idx]);
    finalizeAnswer(correct);
  };

  const handleNext = () => {
    if (!isAnswered) return;
    if (currentIndex + 1 >= items.length) {
      setFinished(true);
      onCompleteSession({
        correctCount,
        totalCount: items.length,
        xpEarned,
      });
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setSessionStreak(0);
    setCorrectCount(0);
    setXpEarned(0);
    setMistakesSavedInSession(0);
    setFinished(false);
  };

  // Global keyboard shortcuts for the drill player
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (finished || !exercise) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      // Space replays German audio
      if (e.code === 'Space') {
        e.preventDefault();
        speakGerman(exercise.fullGerman, 1.0);
        return;
      }

      // 1-4 selects options for multiple-choice modes
      if (
        !isAnswered &&
        ['1', '2', '3', '4'].includes(e.key) &&
        (exercise.type === 'case_drill' ||
          exercise.type === 'verb_conjugation' ||
          exercise.type === 'wechsel_sim')
      ) {
        const idx = Number(e.key) - 1;
        if (idx < exercise.options.length) {
          e.preventDefault();
          handleSelectChoice(idx);
        }
        return;
      }

      // Enter advances once answered
      if (isAnswered && e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (finished) {
    return (
      <div className="py-6">
        <LessonComplete
          title={sessionTitle}
          cefr={cefrLabel}
          correctCount={correctCount}
          totalCount={items.length}
          xpEarned={xpEarned}
          mistakesSaved={mistakesSavedInSession}
          isReviewMode={isReviewMode}
          onBackToRoadmap={onExit}
          onRetry={handleRetry}
          onOpenVault={onOpenVault}
        />
      </div>
    );
  }

  if (!exercise) return null;

  const progressPct = ((currentIndex + (isAnswered ? 1 : 0)) / items.length) * 100;

  return (
    <div id="drill-player-container" className="max-w-2xl mx-auto pb-8">
      {/* Top Bar: Exit, Progress Bar, Streak, Mid-Lesson Grammar Drawer Trigger */}
      <div className="flex items-center gap-3 mb-5">
        <button
          id="btn-exit-drill"
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-[var(--ink-muted)] mb-1">
            <span className="truncate pr-2">
              {cefrLabel} · {sessionTitle}
            </span>
            <span className="shrink-0">
              {currentIndex + 1} / {items.length}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--bg-well)] overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Streak Indicator */}
        {sessionStreak >= 2 && (
          <div
            key={sessionStreak}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[#D97706] font-mono text-xs font-bold animate-streak-pulse shrink-0"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{sessionStreak}</span>
          </div>
        )}

        {/* Mid-Lesson Cheat Sheet Button (Preserves Quiz State!) */}
        <button
          id="btn-drill-open-drawer"
          type="button"
          onClick={onOpenGrammarDrawer}
          title="Open Quick-Reference Grammar Drawer without losing progress"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-primary)] hover:border-[var(--border-strong)] cursor-pointer shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="hidden sm:inline">Tables</span>
        </button>
      </div>

      {/* Main Centered Drill Card */}
      <div className="paper-card rounded-3xl p-5 sm:p-7">
        {(exercise.type === 'case_drill' || exercise.type === 'verb_conjugation') && (
          <CaseDrillView
            key={exercise.id}
            exercise={exercise}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            shakeKey={shakeKey}
            onSelectOption={handleSelectChoice}
          />
        )}

        {exercise.type === 'satzklammer' && (
          <SatzklammerView
            key={exercise.id}
            exercise={exercise}
            isAnswered={isAnswered}
            isCorrect={isCorrect}
            shakeKey={shakeKey}
            onSubmitOrder={handleSubmitSatzklammer}
          />
        )}

        {exercise.type === 'wechsel_sim' && (
          <WechselSimView
            key={exercise.id}
            exercise={exercise}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            shakeKey={shakeKey}
            onSelectOption={handleSelectChoice}
          />
        )}

        {exercise.type === 'spot_fix' && (
          <SpotFixView
            key={exercise.id}
            exercise={exercise}
            selectedFix={selectedOption}
            isAnswered={isAnswered}
            shakeKey={shakeKey}
            onSelectFix={handleSelectChoice}
          />
        )}

        {/* Subtle Keyboard Shortcut Footer (before answering) */}
        {!isAnswered && (
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1">
                <span className="kbd">1</span>–<span className="kbd">4</span> Choose
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <span className="kbd">Space</span> Listen
              </span>
            </div>
            <AudioButton text={exercise.fullGerman} compact />
          </div>
        )}
      </div>

      {/* Slide-Up Feedback Banner (Show "Why", Not Just "Wrong"!) */}
      {isAnswered && (
        <div
          id="drill-feedback-banner"
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-2xl p-5 border-2 shadow-md animate-slide-up ${
            isCorrect
              ? 'bg-emerald-50/95 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700'
              : 'bg-amber-50/95 dark:bg-amber-950/55 border-amber-300 dark:border-amber-700'
          }`}
        >
          {/* Banner Top Row */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-2.5">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-[#E11D48] shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-display font-extrabold text-base sm:text-lg ${
                    isCorrect
                      ? 'text-[#047857] dark:text-emerald-300'
                      : 'text-[#BE123C] dark:text-rose-300'
                  }`}
                >
                  {isCorrect ? 'Richtig! (+15 XP)' : 'Not quite — here is why:'}
                </p>
                <p className="font-semibold text-sm sm:text-base text-[var(--ink-primary)] mt-0.5">
                  {exercise.fullGerman}
                </p>
                <p className="text-xs text-[var(--ink-secondary)]">{exercise.english}</p>
              </div>
            </div>

            <AudioButton text={exercise.fullGerman} showShortcut />
          </div>

          {/* Bite-Sized Rule Pill */}
          <div
            id="feedback-rule-pill"
            className="rounded-xl p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-2.5 mb-4"
          >
            <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[var(--ink-primary)] leading-relaxed">
              <span className="font-mono font-bold text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-secondary)] mr-2">
                {exercise.ruleTag}
              </span>
              <span>{exercise.rulePill}</span>
            </div>
          </div>

          {/* Bottom Controls: Save to Weak Spots Toggle + Continue */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              id="btn-toggle-weak-spot"
              type="button"
              onClick={() => onToggleWeakSpot(currentItem, !isSavedToVault)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isSavedToVault
                  ? 'bg-amber-100/90 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-[#B45309] dark:text-amber-200'
                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {isSavedToVault ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved to Weak Spots</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save to Weak Spots</span>
                </>
              )}
            </button>

            <button
              id="btn-drill-continue"
              type="button"
              onClick={handleNext}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all cursor-pointer shadow-sm ${
                isCorrect
                  ? 'bg-[#059669] hover:bg-emerald-700'
                  : 'bg-[#1C1917] dark:bg-slate-100 dark:text-slate-900 hover:opacity-90'
              }`}
            >
              <span>
                {currentIndex + 1 === items.length ? 'Finish Unit' : 'Continue'}
              </span>
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-black/15 dark:bg-black/10 font-mono text-[10px]">
                Enter
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
