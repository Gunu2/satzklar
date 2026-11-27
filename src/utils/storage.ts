import type { CEFRLevel, UserProgress } from '../types/grammar';

const PROGRESS_STORAGE_KEY = 'satzklar_progress_v1';
const GEMINI_KEY_STORAGE_KEY = 'satzklar_gemini_api_key';

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDefaultProgress(): UserProgress {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches;

  return {
    xp: 0,
    streakDays: 0,
    lastStudyDate: null,
    selectedStartLevel: null,
    onboardingCompleted: false,
    lessonProgress: {},
    mistakes: {},
    examProgress: {},
    verbSprintBestScore: 0,
    verbSprintBestStreak: 0,
    theme: prefersDark ? 'dark' : 'light',
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return getDefaultProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      ...getDefaultProgress(),
      ...parsed,
      lessonProgress: parsed.lessonProgress ?? {},
      mistakes: parsed.mistakes ?? {},
      examProgress: parsed.examProgress ?? {},
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore quota errors
  }
}

export function touchStudyStreak(progress: UserProgress): UserProgress {
  const today = getTodayISO();
  if (progress.lastStudyDate === today) {
    return progress;
  }

  if (!progress.lastStudyDate) {
    return {
      ...progress,
      streakDays: 1,
      lastStudyDate: today,
    };
  }

  const prev = new Date(`${progress.lastStudyDate}T00:00:00`);
  const curr = new Date(`${today}T00:00:00`);
  const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

  return {
    ...progress,
    streakDays: diffDays === 1 ? progress.streakDays + 1 : 1,
    lastStudyDate: today,
  };
}

export function exportProgressJSON(progress: UserProgress): string {
  return JSON.stringify(
    {
      app: 'SatzKlar',
      version: 1,
      exportedAt: new Date().toISOString(),
      progress,
    },
    null,
    2
  );
}

export function parseImportedProgress(jsonText: string): {
  ok: boolean;
  progress?: UserProgress;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const candidate = (
      parsed && typeof parsed === 'object' && 'progress' in parsed
        ? parsed.progress
        : parsed
    ) as Partial<UserProgress> | null;

    if (!candidate || typeof candidate !== 'object') {
      return { ok: false, error: 'File does not contain a valid SatzKlar progress object.' };
    }

    if (typeof candidate.xp !== 'number' || Number.isNaN(candidate.xp)) {
      return { ok: false, error: 'Missing or invalid XP field in backup file.' };
    }

    const validLevels: Array<CEFRLevel | null> = ['A1', 'A2', 'B1', 'B2', null];
    const startLevel = validLevels.includes(candidate.selectedStartLevel ?? null)
      ? (candidate.selectedStartLevel ?? null)
      : null;

    const merged: UserProgress = {
      ...getDefaultProgress(),
      xp: Math.max(0, Math.floor(candidate.xp)),
      streakDays: Math.max(0, Math.floor(Number(candidate.streakDays) || 0)),
      lastStudyDate:
        typeof candidate.lastStudyDate === 'string' ? candidate.lastStudyDate : null,
      selectedStartLevel: startLevel,
      onboardingCompleted: Boolean(candidate.onboardingCompleted),
      lessonProgress:
        candidate.lessonProgress && typeof candidate.lessonProgress === 'object'
          ? candidate.lessonProgress
          : {},
      mistakes:
        candidate.mistakes && typeof candidate.mistakes === 'object'
          ? candidate.mistakes
          : {},
      examProgress:
        candidate.examProgress && typeof candidate.examProgress === 'object'
          ? candidate.examProgress
          : {},
      verbSprintBestScore: Math.max(0, Math.floor(Number(candidate.verbSprintBestScore) || 0)),
      verbSprintBestStreak: Math.max(0, Math.floor(Number(candidate.verbSprintBestStreak) || 0)),
      theme: candidate.theme === 'dark' ? 'dark' : 'light',
    };

    return { ok: true, progress: merged };
  } catch {
    return { ok: false, error: 'Invalid JSON syntax. Please select a valid SatzKlar backup.' };
  }
}

export function loadGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(GEMINI_KEY_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = key.trim();
    if (!trimmed) {
      window.localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
    } else {
      window.localStorage.setItem(GEMINI_KEY_STORAGE_KEY, trimmed);
    }
  } catch {
    // Ignore storage errors
  }
}
