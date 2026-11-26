import type { Exercise, MistakeRecord } from '../types/grammar';

const HOUR_MS = 60 * 60 * 1000;

export function recordMistake(
  existing: Record<string, MistakeRecord>,
  exercise: Exercise,
  lessonId: string
): Record<string, MistakeRecord> {
  const now = new Date();
  const prev = existing[exercise.id];
  const nextReview = new Date(now.getTime() + 4 * HOUR_MS);

  return {
    ...existing,
    [exercise.id]: {
      exerciseId: exercise.id,
      lessonId,
      cefr: exercise.cefr,
      ruleTag: exercise.ruleTag,
      rulePill: exercise.rulePill,
      wrongCount: (prev?.wrongCount ?? 0) + 1,
      consecutiveRight: 0,
      lastMissedAt: now.toISOString(),
      nextReviewAt: nextReview.toISOString(),
    },
  };
}

export function removeMistake(
  existing: Record<string, MistakeRecord>,
  exerciseId: string
): Record<string, MistakeRecord> {
  const next = { ...existing };
  delete next[exerciseId];
  return next;
}

/**
 * Marks a weak spot answered correctly during a review drill.
 * Graduates (removes) the item once answered correctly twice in a row.
 */
export function recordReviewSuccess(
  existing: Record<string, MistakeRecord>,
  exerciseId: string
): { mistakes: Record<string, MistakeRecord>; graduated: boolean } {
  const prev = existing[exerciseId];
  if (!prev) {
    return { mistakes: existing, graduated: false };
  }

  const nextStreak = prev.consecutiveRight + 1;
  if (nextStreak >= 2) {
    return {
      mistakes: removeMistake(existing, exerciseId),
      graduated: true,
    };
  }

  const nextReview = new Date(Date.now() + 24 * HOUR_MS);
  return {
    graduated: false,
    mistakes: {
      ...existing,
      [exerciseId]: {
        ...prev,
        consecutiveRight: nextStreak,
        nextReviewAt: nextReview.toISOString(),
      },
    },
  };
}

export function getSortedMistakes(
  mistakes: Record<string, MistakeRecord>
): MistakeRecord[] {
  return Object.values(mistakes).sort((a, b) => {
    if (b.wrongCount !== a.wrongCount) return b.wrongCount - a.wrongCount;
    return new Date(b.lastMissedAt).getTime() - new Date(a.lastMissedAt).getTime();
  });
}
