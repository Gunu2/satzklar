import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookMarked,
  Brain,
  Calendar,
  CheckCircle2,
  Eye,
  Flame,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { CEFRLevel } from '../../types/grammar';
import type { DailyVocabGoal, VocabItem, VocabMemoryState } from '../../types/vocab';
import { ALL_VOCAB, VOCAB_INDEX } from '../../data/vocab';
import {
  CEFR_ORDER,
  computeTimelineProjection,
  getUnmemorizedQueue,
  loadVocabState,
  saveVocabState,
} from '../../utils/vocabStorage';
import { getTodayISO } from '../../utils/storage';
import { GenderBadge } from '../layout/GenderBadge';
import { AudioButton } from '../drill/AudioButton';

interface VocabMemorizerViewProps {
  onEarnXp: (amount: number) => void;
  onOpenSettings: () => void;
}

const PACE_OPTIONS: Array<{
  goal: DailyVocabGoal;
  label: string;
  durationHint: string;
  tag: string;
}> = [
  { goal: 5, label: '5 / day', durationHint: '~3 Months (96d)', tag: 'Steady' },
  { goal: 10, label: '10 / day', durationHint: '~1.5 Months (48d)', tag: '2× Faster' },
  { goal: 15, label: '15 / day', durationHint: '~1 Month (32d)', tag: '3× Faster' },
  { goal: 20, label: '20 / day', durationHint: '~24 Days', tag: 'Turbo' },
];

const LEVEL_STYLES: Record<CEFRLevel, string> = {
  A1: 'text-[#059669] bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
  A2: 'text-[#2563EB] bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300',
  B1: 'text-[#D97706] bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
  B2: 'text-[#0D9488] bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300',
};

function buildQuizChoices(target: VocabItem, allItems: VocabItem[]): VocabItem[] {
  const sameLevel = allItems.filter(
    (v) => v.id !== target.id && v.cefr === target.cefr && v.meaning !== target.meaning
  );
  const distractors: VocabItem[] = [];
  let seed = target.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0) * 17, 13);
  const pool = [...sameLevel];
  while (distractors.length < 3 && pool.length > 0) {
    seed = (seed * 1103515245 + 12345) % 2147483647;
    const idx = seed % pool.length;
    distractors.push(pool.splice(idx, 1)[0]);
  }
  const combined = [target, ...distractors];
  // Deterministic shuffle based on target ID
  for (let i = combined.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2147483647;
    const j = seed % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined;
}

export function VocabMemorizerView({
  onEarnXp,
  onOpenSettings,
}: VocabMemorizerViewProps) {
  const [state, setState] = useState<VocabMemoryState>(() => loadVocabState());
  const [activeMode, setActiveMode] = useState<'memorize' | 'review' | 'quiz' | 'bank'>(
    'memorize'
  );
  const [revealed, setRevealed] = useState(false);
  const [skippedInSession, setSkippedInSession] = useState<string[]>([]);
  const [extraBatchUnlocked, setExtraBatchUnlocked] = useState(0);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedId, setQuizSelectedId] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Saved Bank filters
  const [bankLevelFilter, setBankLevelFilter] = useState<'All' | CEFRLevel>('All');
  const [bankStatusFilter, setBankStatusFilter] = useState<
    'all' | 'memorized' | 'review' | 'unseen'
  >('all');
  const [bankSearch, setBankSearch] = useState('');

  // Persist immediately whenever memorization state updates
  useEffect(() => {
    saveVocabState(state);
  }, [state]);

  const projection = useMemo(() => computeTimelineProjection(state), [state]);
  const memSet = useMemo(() => new Set(state.memorizedIds), [state.memorizedIds]);
  const reviewSet = useMemo(() => new Set(state.reviewIds), [state.reviewIds]);

  const skipSet = useMemo(() => new Set(skippedInSession), [skippedInSession]);
  const unmemorizedQueue = useMemo(
    () => getUnmemorizedQueue(state, skipSet),
    [state, skipSet]
  );

  const reviewItems = useMemo(
    () =>
      state.reviewIds
        .map((id) => VOCAB_INDEX[id])
        .filter((v): v is VocabItem => Boolean(v) && !memSet.has(v.id)),
    [state.reviewIds, memSet]
  );

  // Effective daily target includes any "+5 Extra Words" bonus sessions the learner unlocked today
  const effectiveTodayTarget = state.dailyGoal + extraBatchUnlocked;
  const dailyGoalReached =
    projection.todayCount >= effectiveTodayTarget && projection.remainingCount > 0;

  const currentCard: VocabItem | null =
    activeMode === 'review'
      ? (reviewItems[0] ?? null)
      : (unmemorizedQueue[0] ?? null);

  // Quiz deck draws from memorized + review words (or upcoming words if brand new)
  const quizDeck = useMemo(() => {
    const learned = state.memorizedIds
      .slice(-20)
      .reverse()
      .map((id) => VOCAB_INDEX[id])
      .filter((v): v is VocabItem => Boolean(v));
    if (learned.length >= 4) return learned;
    return ALL_VOCAB.slice(0, 12);
  }, [state.memorizedIds]);

  const activeQuizItem = quizDeck[quizIndex % quizDeck.length] ?? ALL_VOCAB[0];
  const quizChoices = useMemo(
    () => buildQuizChoices(activeQuizItem, ALL_VOCAB),
    [activeQuizItem]
  );

  const filteredBank = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    return ALL_VOCAB.filter((item) => {
      if (bankLevelFilter !== 'All' && item.cefr !== bankLevelFilter) return false;
      if (bankStatusFilter === 'memorized' && !memSet.has(item.id)) return false;
      if (bankStatusFilter === 'review' && !reviewSet.has(item.id)) return false;
      if (bankStatusFilter === 'unseen' && (memSet.has(item.id) || reviewSet.has(item.id))) {
        return false;
      }
      if (
        q &&
        !item.word.toLowerCase().includes(q) &&
        !item.meaning.toLowerCase().includes(q) &&
        !item.topic.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [bankLevelFilter, bankStatusFilter, bankSearch, memSet, reviewSet]);

  const flashSaved = (msg: string) => {
    setSaveToast(msg);
    window.setTimeout(() => setSaveToast(null), 2200);
  };

  const handleSetDailyGoal = (goal: DailyVocabGoal) => {
    setState((prev) => ({ ...prev, dailyGoal: goal }));
    setExtraBatchUnlocked(0);
    flashSaved(`Daily goal saved: ${goal} new words/day`);
  };

  const handleSetFocusLevel = (focus: 'auto' | CEFRLevel) => {
    setState((prev) => ({ ...prev, focusLevel: focus }));
    setSkippedInSession([]);
    setRevealed(false);
  };

  const handleMarkMemorized = (item: VocabItem) => {
    const today = getTodayISO();
    setState((prev) => {
      if (prev.memorizedIds.includes(item.id)) return prev;
      return {
        ...prev,
        memorizedIds: [...prev.memorizedIds, item.id],
        reviewIds: prev.reviewIds.filter((id) => id !== item.id),
        dailyLog: {
          ...prev.dailyLog,
          [today]: (prev.dailyLog[today] ?? 0) + 1,
        },
      };
    });
    setRevealed(false);
    onEarnXp(5);
    flashSaved(`Saved “${item.word}” to memorized bank (+5 XP)`);
  };

  const handleMarkStillLearning = (item: VocabItem) => {
    setState((prev) => ({
      ...prev,
      reviewIds: prev.reviewIds.includes(item.id)
        ? prev.reviewIds
        : [...prev.reviewIds, item.id],
    }));
    setSkippedInSession((prev) => [...prev, item.id]);
    setRevealed(false);
  };

  const handleToggleBankMemorized = (item: VocabItem) => {
    const today = getTodayISO();
    setState((prev) => {
      const already = prev.memorizedIds.includes(item.id);
      if (already) {
        return {
          ...prev,
          memorizedIds: prev.memorizedIds.filter((id) => id !== item.id),
        };
      }
      return {
        ...prev,
        memorizedIds: [...prev.memorizedIds, item.id],
        reviewIds: prev.reviewIds.filter((id) => id !== item.id),
        dailyLog: {
          ...prev.dailyLog,
          [today]: (prev.dailyLog[today] ?? 0) + 1,
        },
      };
    });
  };

  const handleAnswerQuiz = (chosenId: string) => {
    if (quizSelectedId) return;
    setQuizSelectedId(chosenId);
    if (chosenId === activeQuizItem.id) {
      setQuizScore((s) => s + 1);
      onEarnXp(5);
    }
  };

  const handleNextQuiz = () => {
    setQuizSelectedId(null);
    setQuizIndex((i) => i + 1);
  };

  // Keyboard shortcut: Space reveals card in Memorize/Review mode
  useEffect(() => {
    if (activeMode !== 'memorize' && activeMode !== 'review') return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.code === 'Space' && currentCard && !revealed && !dailyGoalReached) {
        e.preventDefault();
        setRevealed(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeMode, currentCard, revealed, dailyGoalReached]);

  const todayPct = Math.min(
    100,
    Math.round((projection.todayCount / Math.max(1, state.dailyGoal)) * 100)
  );

  return (
    <div id="vocab-memorizer-view" className="space-y-6 animate-slide-up">
      {/* HERO: 3-Month A1 -> B2 Goal Dashboard */}
      <section className="paper-elevated rounded-3xl p-5 sm:p-7 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">
              <Brain className="w-4 h-4" />
              <span>A1 → B2 Wortschatz Memorization · 3-Month Roadmap</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)] tracking-tight">
              Master {projection.totalWords} Unique German Words from A1 to B2
            </h1>
            <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
              Every word is strictly unique (zero duplicates across A1–B2) and automatically saved in your browser so you can leave anytime and resume right where you stopped. Memorize more words per day to finish faster!
            </p>
          </div>

          {/* Live Goal & Persistence Card */}
          <div className="paper-well rounded-2xl p-4 min-w-[250px] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--ink-secondary)] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Today’s New Words</span>
              </span>
              <span className="font-mono text-xs font-extrabold text-[#2563EB] dark:text-[#60A5FA]">
                {projection.todayCount} / {state.dailyGoal}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full rounded-full bg-[#059669] transition-all duration-300"
                style={{ width: `${todayPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)] pt-0.5">
              <span className="inline-flex items-center gap-1 text-[#059669] font-medium">
                <Save className="w-3 h-3" />
                <span>Auto-saved</span>
              </span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="underline hover:text-[var(--ink-primary)] cursor-pointer"
              >
                Backup JSON
              </button>
            </div>
          </div>
        </div>

        {/* Daily Pace Selector (5 / 10 / 15 / 20 words per day) */}
        <div className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-display font-bold text-[var(--ink-primary)] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#D97706]" />
              <span>Choose Your Daily Pace (More words/day = Faster to B2!)</span>
            </span>
            <span
              id="vocab-eta-summary"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#059669]"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Est. B2 Finish: {projection.projectedFinishDate} ({projection.daysLeftAtGoal}d left)
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PACE_OPTIONS.map((opt) => {
              const selected = state.dailyGoal === opt.goal;
              return (
                <button
                  key={opt.goal}
                  id={`btn-pace-${opt.goal}`}
                  type="button"
                  onClick={() => handleSetDailyGoal(opt.goal)}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selected
                      ? 'border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-extrabold text-xs sm:text-sm text-[var(--ink-primary)] whitespace-nowrap">
                      {opt.label}
                    </span>
                    <span
                      className={`text-[9.5px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                        selected
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[var(--bg-well)] text-[var(--ink-muted)]'
                      }`}
                    >
                      {opt.tag}
                    </span>
                  </div>
                  <span className="block text-[11px] text-[var(--ink-secondary)] mt-1">
                    {opt.durationHint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual 3-Month CEFR Milestone Timeline (A1 -> A2 -> B1 -> B2) */}
        <div className="space-y-2.5 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              3-Month Progressive Timeline ({projection.memorizedCount} / {projection.totalWords} memorized · {projection.overallPct}%)
            </span>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => handleSetFocusLevel('auto')}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold cursor-pointer ${
                  state.focusLevel === 'auto'
                    ? 'bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-[var(--bg-well)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                }`}
              >
                Auto A1→B2
              </button>
              {CEFR_ORDER.map((lvl) => (
                <button
                  key={lvl}
                  id={`vocab-focus-${lvl}`}
                  type="button"
                  onClick={() => handleSetFocusLevel(lvl)}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold cursor-pointer ${
                    state.focusLevel === lvl
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[var(--bg-well)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {projection.milestones.map((m, idx) => {
              const isFocused =
                state.focusLevel === m.level ||
                (state.focusLevel === 'auto' && m.status === 'active');
              return (
                <button
                  key={m.level}
                  type="button"
                  onClick={() => handleSetFocusLevel(m.level)}
                  className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isFocused
                      ? 'border-[#2563EB] bg-[var(--bg-surface)] shadow-xs'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-well)]/50 hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded-md border ${LEVEL_STYLES[m.level]}`}
                    >
                      Stage {idx + 1} · {m.level}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-[var(--ink-muted)]">
                      Day {m.dayStart}–{m.dayEnd}
                    </span>
                  </div>
                  <p className="font-display font-bold text-xs text-[var(--ink-primary)] truncate">
                    {m.label}
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-well)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#059669] transition-all duration-300"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-[var(--ink-secondary)]">
                      {m.memorized}/{m.total}
                    </span>
                    <span className="text-[10px] text-[var(--ink-muted)] truncate">
                      {m.targetDate}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Auto-save feedback toast */}
      {saveToast && (
        <div
          id="vocab-save-toast"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-[#047857] dark:text-emerald-300 animate-pop-in"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-well)] border border-[var(--border-subtle)]">
        <button
          id="vocab-tab-memorize"
          type="button"
          onClick={() => {
            setActiveMode('memorize');
            setRevealed(false);
          }}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeMode === 'memorize'
              ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
              : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#2563EB]" />
          <span>New Words</span>
        </button>

        <button
          id="vocab-tab-review"
          type="button"
          onClick={() => {
            setActiveMode('review');
            setRevealed(false);
          }}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeMode === 'review'
              ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
              : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-[#D97706]" />
          <span>Review ({reviewItems.length})</span>
        </button>

        <button
          id="vocab-tab-quiz"
          type="button"
          onClick={() => {
            setActiveMode('quiz');
            setQuizSelectedId(null);
          }}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeMode === 'quiz'
              ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
              : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          <Zap className="w-4 h-4 text-[#059669]" />
          <span>Recall Quiz</span>
        </button>

        <button
          id="vocab-tab-bank"
          type="button"
          onClick={() => setActiveMode('bank')}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeMode === 'bank'
              ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
              : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          <BookMarked className="w-4 h-4 text-[#0D9488]" />
          <span>Saved Bank ({projection.memorizedCount}/{projection.totalWords})</span>
        </button>
      </div>

      {/* MODE 1 & 2: ACTIVE RECALL FLASHCARD MEMORIZER */}
      {(activeMode === 'memorize' || activeMode === 'review') && (
        <section className="max-w-2xl mx-auto">
          {activeMode === 'memorize' && dailyGoalReached ? (
            <div
              id="vocab-daily-complete-card"
              className="paper-elevated rounded-3xl p-6 sm:p-8 text-center space-y-4 animate-pop-in"
            >
              <span className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] flex items-center justify-center">
                <Award className="w-8 h-8" />
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[var(--ink-primary)]">
                Daily Memorization Goal Reached!
              </h2>
              <p className="text-sm text-[var(--ink-secondary)] max-w-md mx-auto">
                You memorized <strong>{projection.todayCount} new German words</strong> today — all progress is saved! Want to reach B2 even faster? Unlock an extra batch right now!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  id="btn-unlock-extra-5"
                  type="button"
                  onClick={() => {
                    setExtraBatchUnlocked((n) => n + 5);
                    setRevealed(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+5 Extra Words (Finish Faster!)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('quiz')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#059669]" />
                  <span>Test Recall Quiz</span>
                </button>
              </div>
            </div>
          ) : !currentCard ? (
            <div className="paper-card rounded-3xl p-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-[#059669]" />
              <h2 className="font-display font-bold text-xl text-[var(--ink-primary)]">
                {activeMode === 'review'
                  ? 'Your Review Pile is Clear!'
                  : 'Incredible! You Memorized All 480 A1–B2 Words!'}
              </h2>
              <p className="text-sm text-[var(--ink-secondary)]">
                {activeMode === 'review'
                  ? 'Every word you marked “Still Learning” has been mastered. Switch back to New Words to keep advancing!'
                  : 'Test yourself in the Recall Quiz or explore your full Saved Bank below.'}
              </p>
              {activeMode === 'review' && (
                <button
                  type="button"
                  onClick={() => setActiveMode('memorize')}
                  className="px-4 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Back to New Words
                </button>
              )}
            </div>
          ) : (
            <div
              id="vocab-flashcard"
              className="paper-elevated rounded-3xl p-6 sm:p-8 space-y-6"
            >
              {/* Card Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg border ${LEVEL_STYLES[currentCard.cefr]}`}
                  >
                    {currentCard.cefr} Wortschatz
                  </span>
                  <span className="font-mono text-[11px] font-semibold px-2 py-1 rounded-lg bg-[var(--bg-well)] text-[var(--ink-secondary)]">
                    {currentCard.pos} · {currentCard.topic}
                  </span>
                </div>
                <span className="font-mono text-xs text-[var(--ink-muted)]">
                  {activeMode === 'review'
                    ? `${reviewItems.length} left to review`
                    : `${unmemorizedQueue.length} unseen words left`}
                </span>
              </div>

              {/* German Headword (Strictly Protected from Auto-Translation) */}
              <div className="paper-well rounded-2xl p-6 sm:p-8 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  {currentCard.gender && (
                    <span translate="no" className="notranslate">
                      <GenderBadge gender={currentCard.gender} size="sm" />
                    </span>
                  )}
                </div>
                <h2
                  id="vocab-card-word"
                  translate="no"
                  className="notranslate font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink-primary)] tracking-tight"
                >
                  {currentCard.word}
                </h2>
                {currentCard.extraForm && currentCard.extraForm !== '—' && (
                  <p
                    translate="no"
                    className="notranslate font-mono text-xs sm:text-sm text-[var(--ink-muted)]"
                  >
                    {currentCard.extraForm}
                  </p>
                )}
                <div className="pt-1 flex justify-center">
                  <AudioButton text={currentCard.word} />
                </div>
              </div>

              {/* Reveal Meaning & Context Sentence */}
              {!revealed ? (
                <button
                  id="btn-reveal-vocab"
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="w-full py-3.5 rounded-2xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Reveal Meaning &amp; Example Sentence</span>
                  <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white/15 dark:bg-slate-900/15 font-mono text-[10px]">
                    Space
                  </span>
                </button>
              ) : (
                <div className="space-y-5 animate-slide-up">
                  <div className="rounded-2xl p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                        Meaning
                      </span>
                      <p className="font-display font-bold text-xl text-[#2563EB] dark:text-[#60A5FA] mt-0.5">
                        {currentCard.meaning}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                          Contextual Example ({currentCard.cefr})
                        </span>
                        <AudioButton text={currentCard.example} compact />
                      </div>
                      <p
                        translate="no"
                        className="notranslate font-semibold text-sm sm:text-base text-[var(--ink-primary)] leading-relaxed"
                      >
                        “{currentCard.example}”
                      </p>
                      <p className="text-xs sm:text-sm text-[var(--ink-secondary)]">
                        {currentCard.exampleMeaning}
                      </p>
                    </div>
                  </div>

                  {/* Active Recall Decision Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      id="btn-vocab-still-learning"
                      type="button"
                      onClick={() => handleMarkStillLearning(currentCard)}
                      className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/35 text-[#B45309] dark:text-amber-300 font-semibold text-sm hover:opacity-90 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Still Learning (Review Later)</span>
                    </button>

                    <button
                      id="btn-vocab-memorized"
                      type="button"
                      onClick={() => handleMarkMemorized(currentCard)}
                      className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#059669] text-white font-semibold text-sm hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Memorized! Save &amp; Next (+5 XP)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* MODE 3: 4-CHOICE RECALL QUIZ */}
      {activeMode === 'quiz' && (
        <section className="max-w-2xl mx-auto paper-elevated rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669] flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              <span>Quick Wortschatz Recall Quiz · Score: {quizScore}</span>
            </span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${LEVEL_STYLES[activeQuizItem.cefr]}`}
            >
              {activeQuizItem.cefr}
            </span>
          </div>

          <div className="paper-well rounded-2xl p-6 text-center space-y-2">
            <p className="text-xs text-[var(--ink-muted)]">
              What does this German word mean?
            </p>
            <h2
              translate="no"
              className="notranslate font-display text-3xl font-extrabold text-[var(--ink-primary)]"
            >
              {activeQuizItem.word}
            </h2>
            <div className="flex justify-center pt-1">
              <AudioButton text={activeQuizItem.word} compact />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quizChoices.map((choice, idx) => {
              const isSelected = quizSelectedId === choice.id;
              const isRight = choice.id === activeQuizItem.id;
              let style =
                'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#2563EB] text-[var(--ink-primary)]';
              if (quizSelectedId) {
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
                  key={choice.id}
                  id={`vocab-quiz-opt-${idx + 1}`}
                  type="button"
                  disabled={Boolean(quizSelectedId)}
                  onClick={() => handleAnswerQuiz(choice.id)}
                  className={`p-3.5 rounded-xl border-2 text-left text-sm font-semibold transition-all cursor-pointer disabled:cursor-default ${style}`}
                >
                  {choice.meaning}
                </button>
              );
            })}
          </div>

          {quizSelectedId && (
            <div className="rounded-2xl p-4 bg-[var(--bg-well)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
              <div className="text-xs space-y-0.5">
                <p
                  translate="no"
                  className="notranslate font-semibold text-[var(--ink-primary)]"
                >
                  {activeQuizItem.example}
                </p>
                <p className="text-[var(--ink-secondary)]">
                  {activeQuizItem.exampleMeaning}
                </p>
              </div>
              <button
                id="btn-vocab-quiz-next"
                type="button"
                onClick={handleNextQuiz}
                className="px-4 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold cursor-pointer shrink-0"
              >
                Next Word →
              </button>
            </div>
          )}
        </section>
      )}

      {/* MODE 4: SAVED VOCABULARY BANK (ALL 480 UNIQUE WORDS) */}
      {activeMode === 'bank' && (
        <section className="paper-card rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-vocab-bank-search"
                type="text"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Search German word, meaning, or topic..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-xs sm:text-sm text-[var(--ink-primary)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]">
                {(['All', 'A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setBankLevelFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold cursor-pointer ${
                      bankLevelFilter === lvl
                        ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                        : 'text-[var(--ink-muted)]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <select
                value={bankStatusFilter}
                onChange={(e) =>
                  setBankStatusFilter(
                    e.target.value as 'all' | 'memorized' | 'review' | 'unseen'
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--ink-primary)]"
              >
                <option value="all">All Status ({ALL_VOCAB.length})</option>
                <option value="memorized">Memorized ({projection.memorizedCount})</option>
                <option value="review">Review ({reviewItems.length})</option>
                <option value="unseen">Not Yet Learned ({projection.remainingCount})</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredBank.map((item) => {
              const isDone = memSet.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
                    isDone
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${LEVEL_STYLES[item.cefr]}`}
                        >
                          {item.cefr}
                        </span>
                        {item.gender && (
                          <span translate="no" className="notranslate">
                            <GenderBadge gender={item.gender} size="xs" />
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[var(--ink-muted)]">
                          {item.topic}
                        </span>
                      </div>
                      <p
                        translate="no"
                        className="notranslate font-display font-bold text-base text-[var(--ink-primary)] mt-1"
                      >
                        {item.word}
                      </p>
                      <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                        {item.meaning}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleBankMemorized(item)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer shrink-0 ${
                        isDone
                          ? 'bg-[#059669] text-white border-[#059669]'
                          : 'bg-[var(--bg-well)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:border-[#059669]'
                      }`}
                    >
                      {isDone ? '✓ Memorized' : 'Mark Saved'}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <p
                      translate="no"
                      className="notranslate text-xs text-[var(--ink-secondary)] truncate"
                      title={item.example}
                    >
                      {item.example}
                    </p>
                    <AudioButton text={item.word} compact />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
