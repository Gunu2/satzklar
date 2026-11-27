import type { CEFRLevel } from '../types/grammar';
import type { DailyVocabGoal, VocabItem, VocabMemoryState } from '../types/vocab';
import { ALL_VOCAB, VOCAB_BY_LEVEL } from '../data/vocab';
import { getTodayISO } from './storage';

const VOCAB_STORAGE_KEY = 'satzklar_vocab_memory_v1';

export const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

export function getDefaultVocabState(): VocabMemoryState {
  return {
    dailyGoal: 5,
    startDate: getTodayISO(),
    memorizedIds: [],
    reviewIds: [],
    dailyLog: {},
    focusLevel: 'auto',
  };
}

export function loadVocabState(): VocabMemoryState {
  if (typeof window === 'undefined') return getDefaultVocabState();
  try {
    const raw = window.localStorage.getItem(VOCAB_STORAGE_KEY);
    if (!raw) return getDefaultVocabState();
    const parsed = JSON.parse(raw) as Partial<VocabMemoryState>;
    const validGoals: DailyVocabGoal[] = [5, 10, 15, 20];
    const dailyGoal = validGoals.includes(parsed.dailyGoal as DailyVocabGoal)
      ? (parsed.dailyGoal as DailyVocabGoal)
      : 5;
    const validFocus: Array<'auto' | CEFRLevel> = ['auto', 'A1', 'A2', 'B1', 'B2'];
    const focusLevel = validFocus.includes(parsed.focusLevel as 'auto' | CEFRLevel)
      ? (parsed.focusLevel as 'auto' | CEFRLevel)
      : 'auto';

    return {
      dailyGoal,
      startDate: typeof parsed.startDate === 'string' ? parsed.startDate : getTodayISO(),
      memorizedIds: Array.isArray(parsed.memorizedIds)
        ? Array.from(new Set(parsed.memorizedIds.filter((x): x is string => typeof x === 'string')))
        : [],
      reviewIds: Array.isArray(parsed.reviewIds)
        ? Array.from(new Set(parsed.reviewIds.filter((x): x is string => typeof x === 'string')))
        : [],
      dailyLog:
        parsed.dailyLog && typeof parsed.dailyLog === 'object' ? parsed.dailyLog : {},
      focusLevel,
    };
  } catch {
    return getDefaultVocabState();
  }
}

export function saveVocabState(state: VocabMemoryState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function addDaysFormatted(daysFromToday: number): string {
  const target = new Date();
  target.setDate(target.getDate() + Math.max(0, daysFromToday));
  return target.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export interface StageMilestone {
  level: CEFRLevel;
  label: string;
  memorized: number;
  total: number;
  pct: number;
  dayStart: number;
  dayEnd: number;
  targetDate: string;
  status: 'done' | 'active' | 'upcoming';
}

export interface TimelineProjection {
  totalWords: number;
  memorizedCount: number;
  remainingCount: number;
  overallPct: number;
  todayCount: number;
  daysLeftAtGoal: number;
  totalPlanDays: number;
  projectedFinishDate: string;
  baseline90SavedDays: number;
  currentAutoLevel: CEFRLevel;
  milestones: StageMilestone[];
}

const STAGE_LABELS: Record<CEFRLevel, string> = {
  A1: 'Foundation & Alltag',
  A2: 'Travel, Health & Routine',
  B1: 'Goethe / ÖSD B1 Core',
  B2: 'Debate, Career & Academic',
};

export function computeTimelineProjection(state: VocabMemoryState): TimelineProjection {
  const memSet = new Set(state.memorizedIds);
  const totalWords = ALL_VOCAB.length;
  const memorizedCount = ALL_VOCAB.filter((v) => memSet.has(v.id)).length;
  const remainingCount = Math.max(0, totalWords - memorizedCount);
  const overallPct = totalWords > 0 ? Math.round((memorizedCount / totalWords) * 100) : 0;

  const today = getTodayISO();
  const todayCount = state.dailyLog[today] ?? 0;

  const totalPlanDays = Math.ceil(totalWords / state.dailyGoal);
  const daysLeftAtGoal = Math.ceil(remainingCount / state.dailyGoal);
  const projectedFinishDate = addDaysFormatted(daysLeftAtGoal);
  const baseline90SavedDays = Math.max(0, 90 - daysLeftAtGoal);

  let currentAutoLevel: CEFRLevel = 'B2';
  for (const lvl of CEFR_ORDER) {
    const levelItems = VOCAB_BY_LEVEL[lvl];
    if (levelItems.some((v) => !memSet.has(v.id))) {
      currentAutoLevel = lvl;
      break;
    }
  }

  let cumulativeDay = 0;
  let cumulativeRemaining = 0;
  const milestones: StageMilestone[] = CEFR_ORDER.map((level) => {
    const items = VOCAB_BY_LEVEL[level];
    const total = items.length;
    const memorized = items.filter((v) => memSet.has(v.id)).length;
    const rem = Math.max(0, total - memorized);
    const pct = total > 0 ? Math.round((memorized / total) * 100) : 0;

    const daysForStage = Math.max(1, Math.ceil(total / state.dailyGoal));
    const dayStart = cumulativeDay + 1;
    const dayEnd = cumulativeDay + daysForStage;
    cumulativeDay = dayEnd;

    cumulativeRemaining += rem;
    const daysUntilStageDone = Math.ceil(cumulativeRemaining / state.dailyGoal);
    const targetDate = rem === 0 ? 'Completed' : addDaysFormatted(daysUntilStageDone);

    const status: 'done' | 'active' | 'upcoming' =
      memorized >= total
        ? 'done'
        : level === currentAutoLevel
          ? 'active'
          : 'upcoming';

    return {
      level,
      label: STAGE_LABELS[level],
      memorized,
      total,
      pct,
      dayStart,
      dayEnd,
      targetDate,
      status,
    };
  });

  return {
    totalWords,
    memorizedCount,
    remainingCount,
    overallPct,
    todayCount,
    daysLeftAtGoal,
    totalPlanDays,
    projectedFinishDate,
    baseline90SavedDays,
    currentAutoLevel,
    milestones,
  };
}

/**
 * Returns strictly UN-MEMORIZED words in progressive CEFR order (A1 -> A2 -> B1 -> B2),
 * guaranteeing already-memorized words NEVER repeat in the new-word queue.
 */
export function getUnmemorizedQueue(
  state: VocabMemoryState,
  excludeIds: Set<string> = new Set()
): VocabItem[] {
  const memSet = new Set(state.memorizedIds);
  const pool =
    state.focusLevel === 'auto'
      ? ALL_VOCAB
      : [
          ...VOCAB_BY_LEVEL[state.focusLevel],
          ...ALL_VOCAB.filter((v) => v.cefr !== state.focusLevel),
        ];

  return pool.filter((item) => !memSet.has(item.id) && !excludeIds.has(item.id));
}
