import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { EXERCISE_INDEX } from './data';
import type {
  ActiveTab,
  CEFRLevel,
  Lesson,
  MistakeRecord,
  UserProgress,
} from './types/grammar';
import {
  getDefaultProgress,
  loadGeminiApiKey,
  loadProgress,
  saveGeminiApiKey,
  saveProgress,
  touchStudyStreak,
} from './utils/storage';
import {
  recordMistake,
  recordReviewSuccess,
  removeMistake,
} from './utils/srs';
import { TopNav } from './components/layout/TopNav';
import { WelcomeCard } from './components/onboarding/WelcomeCard';
import { PlacementModal } from './components/onboarding/PlacementModal';
import { LearningPath } from './components/roadmap/LearningPath';
import { CheatSheetModal } from './components/roadmap/CheatSheetModal';
import {
  DrillPlayer,
  type DrillSessionItem,
} from './components/drill/DrillPlayer';
import { VerbSprintView } from './components/sprint/VerbSprintView';
import { MistakeVaultView } from './components/vault/MistakeVaultView';
import { SentenceDoctorView } from './components/doctor/SentenceDoctorView';
import { GrammarDrawer } from './components/reference/GrammarDrawer';
import { SettingsModal } from './components/settings/SettingsModal';

const ExamStudioView = lazy(() =>
  import('./components/exam/ExamStudioView').then((m) => ({
    default: m.ExamStudioView,
  }))
);

const VirtualChatRoom = lazy(() =>
  import('./components/chat/VirtualChatRoom').then((m) => ({
    default: m.VirtualChatRoom,
  }))
);

const VocabMemorizerView = lazy(() =>
  import('./components/vocab/VocabMemorizerView').then((m) => ({
    default: m.VocabMemorizerView,
  }))
);

interface ActiveDrillSession {
  id: string;
  title: string;
  cefrLabel: string;
  lessonId?: string;
  isReviewMode: boolean;
  items: DrillSessionItem[];
}

export function App() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => loadGeminiApiKey());
  const [supabaseVersion, setSupabaseVersion] = useState(0);

  const [activeTab, setActiveTab] = useState<ActiveTab>('roadmap');
  const [levelFilter, setLevelFilter] = useState<'All' | CEFRLevel>(
    () => progress.selectedStartLevel ?? 'All'
  );

  const [showPlacement, setShowPlacement] = useState(false);
  const [cheatSheetLesson, setCheatSheetLesson] = useState<Lesson | null>(null);
  const [activeDrill, setActiveDrill] = useState<ActiveDrillSession | null>(null);
  const [grammarDrawerOpen, setGrammarDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Persist progress & apply theme class to <html>
  useEffect(() => {
    saveProgress(progress);
    const root = document.documentElement;
    if (progress.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [progress]);

  const savedMistakeIds = useMemo(
    () => new Set(Object.keys(progress.mistakes)),
    [progress.mistakes]
  );

  const handleToggleTheme = () => {
    setProgress((p) => ({
      ...p,
      theme: p.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleSelectStartLevel = (level: CEFRLevel) => {
    setLevelFilter(level);
    setProgress((p) => ({
      ...p,
      selectedStartLevel: level,
      onboardingCompleted: true,
    }));
  };

  const handlePlacementComplete = (recommended: CEFRLevel) => {
    setShowPlacement(false);
    setLevelFilter(recommended);
    setProgress((p) => ({
      ...p,
      selectedStartLevel: recommended,
      onboardingCompleted: true,
    }));
  };

  const handleDismissWelcome = () => {
    setProgress((p) => ({ ...p, onboardingCompleted: true }));
  };

  const handleStartLesson = (lesson: Lesson) => {
    setCheatSheetLesson(null);
    setActiveDrill({
      id: `lesson-${lesson.id}-${Date.now()}`,
      title: lesson.title,
      cefrLabel: lesson.cefr,
      lessonId: lesson.id,
      isReviewMode: false,
      items: lesson.exercises.map((exercise) => ({
        exercise,
        lessonId: lesson.id,
      })),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartVaultReview = (records: MistakeRecord[]) => {
    const items: DrillSessionItem[] = records
      .map((rec) => {
        const entry = EXERCISE_INDEX[rec.exerciseId];
        return entry ? { exercise: entry.exercise, lessonId: rec.lessonId } : null;
      })
      .filter((x): x is DrillSessionItem => Boolean(x));

    if (items.length === 0) return;

    setActiveDrill({
      id: `vault-${Date.now()}`,
      title: 'Weak Spots Review',
      cefrLabel: 'SRS',
      isReviewMode: true,
      items,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecordAnswer = useCallback(
    (item: DrillSessionItem, isCorrect: boolean) => {
      setProgress((prev) => {
        const touched = touchStudyStreak(prev);
        if (!isCorrect) {
          return {
            ...touched,
            mistakes: recordMistake(touched.mistakes, item.exercise, item.lessonId),
          };
        }

        // In review mode, answering correctly advances spaced-repetition graduation
        if (activeDrill?.isReviewMode) {
          const { mistakes } = recordReviewSuccess(touched.mistakes, item.exercise.id);
          return {
            ...touched,
            mistakes,
          };
        }

        return touched;
      });
    },
    [activeDrill?.isReviewMode]
  );

  const handleToggleWeakSpot = useCallback(
    (item: DrillSessionItem, shouldSave: boolean) => {
      setProgress((prev) => ({
        ...prev,
        mistakes: shouldSave
          ? recordMistake(prev.mistakes, item.exercise, item.lessonId)
          : removeMistake(prev.mistakes, item.exercise.id),
      }));
    },
    []
  );

  const handleCompleteSession = useCallback(
    (summary: { correctCount: number; totalCount: number; xpEarned: number }) => {
      const accuracy =
        summary.totalCount > 0
          ? Math.round((summary.correctCount / summary.totalCount) * 100)
          : 100;

      setProgress((prev) => {
        const touched = touchStudyStreak(prev);
        const nextLessonProgress = { ...touched.lessonProgress };

        if (activeDrill?.lessonId) {
          const existing = nextLessonProgress[activeDrill.lessonId];
          const bestAccuracy = Math.max(existing?.bestAccuracy ?? 0, accuracy);
          const nextMastery = Math.min(
            100,
            Math.max(existing?.mastery ?? 0, accuracy)
          );
          nextLessonProgress[activeDrill.lessonId] = {
            lessonId: activeDrill.lessonId,
            mastery: nextMastery,
            bestAccuracy,
            attempts: (existing?.attempts ?? 0) + 1,
            completedAt: new Date().toISOString(),
          };
        }

        return {
          ...touched,
          xp: touched.xp + summary.xpEarned,
          lessonProgress: nextLessonProgress,
        };
      });
    },
    [activeDrill]
  );

  const handleFinishSprint = useCallback(
    (score: number, maxStreak: number, xpEarned: number) => {
      setProgress((prev) => {
        const touched = touchStudyStreak(prev);
        return {
          ...touched,
          xp: touched.xp + xpEarned,
          verbSprintBestScore: Math.max(touched.verbSprintBestScore, score),
          verbSprintBestStreak: Math.max(touched.verbSprintBestStreak, maxStreak),
        };
      });
    },
    []
  );

  const handleRecordExamResult = useCallback(
    (
      examId: string,
      skill: 'hoeren' | 'schreiben',
      cefr: CEFRLevel,
      scorePct: number,
      xpEarned: number
    ) => {
      setProgress((prev) => {
        const touched = touchStudyStreak(prev);
        const existing = touched.examProgress[examId];
        const bestScore = Math.max(existing?.bestScore ?? 0, scorePct);
        return {
          ...touched,
          xp: touched.xp + xpEarned,
          examProgress: {
            ...touched.examProgress,
            [examId]: {
              examId,
              skill,
              cefr,
              bestScore,
              passed: bestScore >= 60,
              attempts: (existing?.attempts ?? 0) + 1,
              completedAt: new Date().toISOString(),
            },
          },
        };
      });
    },
    []
  );

  const handleEarnVocabXp = useCallback((amount: number) => {
    setProgress((prev) => {
      const touched = touchStudyStreak(prev);
      return {
        ...touched,
        xp: touched.xp + amount,
      };
    });
  }, []);

  const handleSaveKey = (key: string) => {
    saveGeminiApiKey(key);
    setGeminiApiKey(key);
  };

  const handleResetProgress = () => {
    const fresh = getDefaultProgress();
    setProgress({ ...fresh, theme: progress.theme });
    setLevelFilter('All');
    setActiveDrill(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--ink-primary)]">
      <TopNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveDrill(null);
          setActiveTab(tab);
        }}
        streakDays={progress.streakDays}
        xp={progress.xp}
        mistakeCount={Object.keys(progress.mistakes).length}
        theme={progress.theme}
        onToggleTheme={handleToggleTheme}
        onOpenGrammarDrawer={() => setGrammarDrawerOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        inActiveDrill={Boolean(activeDrill)}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeDrill ? (
          <DrillPlayer
            key={activeDrill.id}
            sessionTitle={activeDrill.title}
            cefrLabel={activeDrill.cefrLabel}
            items={activeDrill.items}
            isReviewMode={activeDrill.isReviewMode}
            savedMistakeIds={savedMistakeIds}
            onRecordAnswer={handleRecordAnswer}
            onToggleWeakSpot={handleToggleWeakSpot}
            onCompleteSession={handleCompleteSession}
            onExit={() => setActiveDrill(null)}
            onOpenVault={() => {
              setActiveDrill(null);
              setActiveTab('vault');
            }}
            onOpenGrammarDrawer={() => setGrammarDrawerOpen(true)}
          />
        ) : activeTab === 'roadmap' ? (
          <>
            {!progress.onboardingCompleted && (
              <WelcomeCard
                onSelectLevel={handleSelectStartLevel}
                onStartPlacement={() => setShowPlacement(true)}
                onDismiss={handleDismissWelcome}
              />
            )}
            <LearningPath
              levelFilter={levelFilter}
              onChangeLevelFilter={setLevelFilter}
              lessonProgress={progress.lessonProgress}
              onOpenCheatSheet={(lesson) => setCheatSheetLesson(lesson)}
              onStartLesson={handleStartLesson}
              onOpenPlacement={() => setShowPlacement(true)}
              onOpenExams={() => setActiveTab('exam')}
            />
          </>
        ) : activeTab === 'vocab' ? (
          <Suspense
            fallback={
              <div className="paper-card rounded-2xl p-8 text-center text-sm text-[var(--ink-muted)]">
                Loading A1–B2 Wortschatz Memorization Studio…
              </div>
            }
          >
            <VocabMemorizerView
              onEarnXp={handleEarnVocabXp}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </Suspense>
        ) : activeTab === 'exam' ? (
          <Suspense
            fallback={
              <div className="paper-card rounded-2xl p-8 text-center text-sm text-[var(--ink-muted)]">
                Loading Goethe / ÖSD / telc Exam Studio…
              </div>
            }
          >
            <ExamStudioView
              examProgress={progress.examProgress}
              hasGeminiKey={Boolean(geminiApiKey)}
              geminiApiKey={geminiApiKey}
              onOpenSettings={() => setSettingsOpen(true)}
              onRecordExamResult={handleRecordExamResult}
            />
          </Suspense>
        ) : activeTab === 'chat' ? (
          <Suspense
            fallback={
              <div className="paper-card rounded-2xl p-8 text-center text-sm text-[var(--ink-muted)]">
                Loading Virtual German Study Lounge…
              </div>
            }
          >
            <VirtualChatRoom
              onOpenSettings={() => setSettingsOpen(true)}
              supabaseVersion={supabaseVersion}
            />
          </Suspense>
        ) : activeTab === 'sprint' ? (
          <VerbSprintView
            bestScore={progress.verbSprintBestScore}
            bestStreak={progress.verbSprintBestStreak}
            onFinishSprint={handleFinishSprint}
          />
        ) : activeTab === 'vault' ? (
          <MistakeVaultView
            mistakes={progress.mistakes}
            onStartReview={handleStartVaultReview}
            onRemoveMistake={(id) =>
              setProgress((p) => ({
                ...p,
                mistakes: removeMistake(p.mistakes, id),
              }))
            }
            onGoToRoadmap={() => setActiveTab('roadmap')}
          />
        ) : (
          <SentenceDoctorView
            hasGeminiKey={Boolean(geminiApiKey)}
            geminiApiKey={geminiApiKey}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
      </main>

      <footer className="border-t border-[var(--border-subtle)] py-5 px-4 sm:px-6 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
          <p>
            <strong className="text-[var(--ink-secondary)]">SatzKlar</strong> — Open-Source German Grammar Studio (A1–B2). 100% browser-local · MIT License.
          </p>
          <p className="font-mono">
            Add lessons via <code className="text-[var(--ink-secondary)]">src/data/lessons/*.json</code>
          </p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {showPlacement && (
        <PlacementModal
          onComplete={handlePlacementComplete}
          onClose={() => setShowPlacement(false)}
        />
      )}

      {cheatSheetLesson && (
        <CheatSheetModal
          lesson={cheatSheetLesson}
          onClose={() => setCheatSheetLesson(null)}
          onStartDrill={handleStartLesson}
        />
      )}

      <GrammarDrawer
        open={grammarDrawerOpen}
        onClose={() => setGrammarDrawerOpen(false)}
      />

      {settingsOpen && (
        <SettingsModal
          open={settingsOpen}
          progress={progress}
          geminiApiKey={geminiApiKey}
          onSaveGeminiKey={handleSaveKey}
          onSupabaseUpdated={() => setSupabaseVersion((v) => v + 1)}
          onImportProgress={(imported) => setProgress(imported)}
          onResetProgress={handleResetProgress}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
