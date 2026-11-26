import { useEffect, useMemo, useState } from 'react';
import { Flame, Play, RotateCcw, Timer, Trophy, Zap, Lightbulb } from 'lucide-react';
import { VERB_SPRINT_BANK, type SprintItem } from '../../data/verbSprintBank';
import { AudioButton } from '../drill/AudioButton';

interface VerbSprintViewProps {
  bestScore: number;
  bestStreak: number;
  onFinishSprint: (score: number, maxStreak: number, xpEarned: number) => void;
}

type CategoryFilter = 'All' | SprintItem['category'];

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Irregular Präsens',
  'Modal Verbs',
  'Perfekt',
  'Präteritum',
  'Konjunktiv II',
];

function shuffleItems<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function VerbSprintView({
  bestScore,
  bestStreak,
  onFinishSprint,
}: VerbSprintViewProps) {
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const [deck, setDeck] = useState<SprintItem[]>([]);
  const [index, setIndex] = useState(0);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean;
    rulePill: string;
    fullGerman: string;
  } | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const pool = useMemo(
    () =>
      category === 'All'
        ? VERB_SPRINT_BANK
        : VERB_SPRINT_BANK.filter((item) => item.category === category),
    [category]
  );

  const multiplier = streak >= 9 ? 4 : streak >= 6 ? 3 : streak >= 3 ? 2 : 1;
  const current = deck[index % Math.max(1, deck.length)];

  const startSprint = () => {
    setDeck(shuffleItems(pool));
    setIndex(0);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setAnsweredCount(0);
    setCorrectCount(0);
    setLastFeedback(null);
    setPhase('running');
  };

  // Countdown timer
  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0);
        setPhase('done');
        const xp = Math.max(15, Math.round(score / 4));
        onFinishSprint(score, maxStreak, xp);
      } else {
        setTimeLeft((t) => t - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [phase, timeLeft, score, maxStreak, onFinishSprint]);

  const handleAnswer = (optIdx: number) => {
    if (phase !== 'running' || !current) return;
    const isRight = optIdx === current.correctIndex;
    setAnsweredCount((c) => c + 1);

    if (isRight) {
      const nextStreak = streak + 1;
      const mult = nextStreak >= 9 ? 4 : nextStreak >= 6 ? 3 : nextStreak >= 3 ? 2 : 1;
      setStreak(nextStreak);
      setMaxStreak((m) => Math.max(m, nextStreak));
      setCorrectCount((c) => c + 1);
      setScore((s) => s + 10 * mult);
      setLastFeedback({
        correct: true,
        rulePill: current.rulePill,
        fullGerman: current.fullGerman,
      });
    } else {
      setStreak(0);
      setShakeKey((k) => k + 1);
      setLastFeedback({
        correct: false,
        rulePill: current.rulePill,
        fullGerman: current.fullGerman,
      });
    }

    setIndex((i) => {
      const next = i + 1;
      if (next >= deck.length) {
        setDeck(shuffleItems(pool));
        return 0;
      }
      return next;
    });
  };

  // Keyboard 1-4 during sprint
  useEffect(() => {
    if (phase !== 'running') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        handleAnswer(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (phase === 'ready') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="paper-elevated rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#D97706]">
              <Zap className="w-4 h-4 fill-current" />
              <span>60-Second Speed Mode</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs font-bold text-[var(--ink-secondary)]">
              <span className="inline-flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
                Best: {bestScore}
              </span>
              <span className="inline-flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#E11D48]" />
                Streak: {bestStreak}
              </span>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)] mb-2">
            Verb Conjugation & Tense Sprint
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-secondary)] leading-relaxed mb-6">
            Race the 60-second clock across irregular verbs, modal verbs, Perfekt auxiliaries, Präteritum, and Konjunktiv II. Chain consecutive hits to unlock up to a <strong className="font-mono text-[#D97706]">4× streak multiplier</strong>.
          </p>

          {/* Category Filter */}
          <div className="mb-6">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2.5">
              Choose Focus ({pool.length} verbs in deck)
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                      : 'bg-[var(--bg-well)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--ink-muted)]">
              Pro tip: Keep your fingers on <span className="kbd">1</span> <span className="kbd">2</span>{' '}
              <span className="kbd">3</span> <span className="kbd">4</span> for blazing speed!
            </p>
            <button
              id="btn-start-verb-sprint"
              type="button"
              onClick={startSprint}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 60s Sprint</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    return (
      <div className="max-w-xl mx-auto paper-elevated rounded-3xl p-6 sm:p-8 text-center animate-pop-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-[#D97706]" />
        </div>
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#D97706] mb-1">
          Time’s Up!
        </p>
        <h2 className="font-display text-3xl font-extrabold text-[var(--ink-primary)] mb-5">
          {score} Points
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="paper-well rounded-2xl p-3.5">
            <p className="font-mono text-xl font-extrabold text-[#059669]">{accuracy}%</p>
            <p className="text-xs text-[var(--ink-muted)]">
              {correctCount}/{answeredCount} right
            </p>
          </div>
          <div className="paper-well rounded-2xl p-3.5">
            <p className="font-mono text-xl font-extrabold text-[#E11D48]">{maxStreak}</p>
            <p className="text-xs text-[var(--ink-muted)]">Max Streak</p>
          </div>
          <div className="paper-well rounded-2xl p-3.5">
            <p className="font-mono text-xl font-extrabold text-[#2563EB] dark:text-[#60A5FA]">
              +{Math.max(15, Math.round(score / 4))}
            </p>
            <p className="text-xs text-[var(--ink-muted)]">XP Earned</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPhase('ready')}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-sm font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            Change Focus
          </button>
          <button
            id="btn-sprint-again"
            type="button"
            onClick={startSprint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sprint Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Live Sprint HUD */}
      <div className="paper-card rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Timer
            className={`w-5 h-5 ${timeLeft <= 10 ? 'text-[#E11D48] animate-pulse' : 'text-[#2563EB]'}`}
          />
          <span
            className={`font-mono text-2xl font-extrabold tabular-nums ${
              timeLeft <= 10 ? 'text-[#E11D48]' : 'text-[var(--ink-primary)]'
            }`}
          >
            {timeLeft}s
          </span>
        </div>

        {/* Timer Bar */}
        <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-well)] overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 linear ${
              timeLeft <= 10 ? 'bg-[#E11D48]' : 'bg-[#2563EB]'
            }`}
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-3 font-mono text-sm font-extrabold">
          <span className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-[#D97706] border border-amber-200 dark:border-amber-800">
            {multiplier}×
          </span>
          <span className="text-[var(--ink-primary)] tabular-nums">{score} pts</span>
        </div>
      </div>

      {/* Active Sprint Card */}
      {current && (
        <div
          key={shakeKey}
          className={`paper-card rounded-3xl p-5 sm:p-7 space-y-5 ${
            lastFeedback && !lastFeedback.correct ? 'animate-shake' : ''
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-primary)]">
                {current.cefr} · {current.category}
              </span>
              <span className="font-mono text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                {current.infinitive} ({current.subject})
              </span>
            </div>
            {streak >= 2 && (
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#D97706]">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {streak} streak
              </span>
            )}
          </div>

          <div>
            <p className="font-display text-xl sm:text-2xl font-bold text-[var(--ink-primary)] leading-snug">
              {current.prompt}
            </p>
            <p className="text-sm text-[var(--ink-muted)] mt-1">{current.english}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {current.options.map((opt, idx) => (
              <button
                key={`${current.id}-${idx}`}
                id={`sprint-option-${idx + 1}`}
                type="button"
                onClick={() => handleAnswer(idx)}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#2563EB] hover:bg-[var(--bg-elevated)] font-semibold text-base text-[var(--ink-primary)] transition-all cursor-pointer"
              >
                <span>{opt}</span>
                <span className="kbd">{idx + 1}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setPhase('done');
                onFinishSprint(score, maxStreak, Math.max(10, Math.round(score / 4)));
              }}
              className="text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
            >
              End Sprint Early
            </button>
          </div>
        </div>
      )}

      {/* Last Answer Mini Rule Flash */}
      {lastFeedback && (
        <div
          className={`rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-3 animate-slide-up ${
            lastFeedback.correct
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50/90 dark:bg-amber-950/45 border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="flex items-start gap-2.5 flex-1 min-w-52">
            <Lightbulb
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                lastFeedback.correct ? 'text-[#059669]' : 'text-[#D97706]'
              }`}
            />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold text-[var(--ink-primary)]">
                {lastFeedback.fullGerman}
              </p>
              <p className="text-[var(--ink-secondary)] mt-0.5">{lastFeedback.rulePill}</p>
            </div>
          </div>
          <AudioButton text={lastFeedback.fullGerman} compact />
        </div>
      )}
    </div>
  );
}
