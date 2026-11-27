import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';
import { CEFR_SECTIONS, LESSONS, getTotalExerciseCount } from '../../data';
import type { CEFRLevel, Lesson, LessonProgress } from '../../types/grammar';
import { useLanguage } from '../../i18n/useLanguage';
import { GenderBadge } from '../layout/GenderBadge';
import { LessonCard } from './LessonCard';

interface LearningPathProps {
  levelFilter: 'All' | CEFRLevel;
  onChangeLevelFilter: (filter: 'All' | CEFRLevel) => void;
  lessonProgress: Record<string, LessonProgress>;
  onOpenCheatSheet: (lesson: Lesson) => void;
  onStartLesson: (lesson: Lesson) => void;
  onOpenPlacement: () => void;
  onOpenExams: () => void;
}

const FILTER_OPTIONS: Array<'All' | CEFRLevel> = ['All', 'A1', 'A2', 'B1', 'B2'];

export function LearningPath({
  levelFilter,
  onChangeLevelFilter,
  lessonProgress,
  onOpenCheatSheet,
  onStartLesson,
  onOpenPlacement,
  onOpenExams,
}: LearningPathProps) {
  const { t } = useLanguage();
  const completedCount = LESSONS.filter(
    (l) => (lessonProgress[l.id]?.mastery ?? 0) >= 85
  ).length;
  const avgMastery = Math.round(
    LESSONS.reduce((sum, l) => sum + (lessonProgress[l.id]?.mastery ?? 0), 0) /
      LESSONS.length
  );

  const visibleSections =
    levelFilter === 'All'
      ? CEFR_SECTIONS
      : CEFR_SECTIONS.filter((s) => s.level === levelFilter);

  return (
    <div className="space-y-8">
      {/* Exam Studio Callout Banner */}
      <div className="paper-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </span>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
              {t.examBannerTag}
            </p>
            <h2 className="font-display font-bold text-base sm:text-lg text-[var(--ink-primary)]">
              {t.examBannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-secondary)]">
              {t.examBannerDesc}
            </p>
          </div>
        </div>
        <button
          id="btn-banner-open-exams"
          type="button"
          onClick={onOpenExams}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <span>{t.openExamStudio}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Studio Filter & Progress Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)] tracking-tight">
            {t.roadmapTitle}
          </h2>
          <p className="text-sm text-[var(--ink-secondary)] mt-1">
            {LESSONS.length} structured units · {getTotalExerciseCount()} curated drills across A1–B2 ·{' '}
            <span className="font-mono font-semibold text-[var(--ink-primary)]">
              {completedCount}/{LESSONS.length} mastered ({avgMastery}%)
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CEFR Level Filter */}
          <div
            role="group"
            aria-label="Filter by CEFR level"
            className="inline-flex items-center p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]"
          >
            {FILTER_OPTIONS.map((opt) => {
              const active = levelFilter === opt;
              return (
                <button
                  key={opt}
                  id={`filter-cefr-${opt}`}
                  type="button"
                  onClick={() => onChangeLevelFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <button
            id="btn-retake-placement"
            type="button"
            onClick={onOpenPlacement}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Placement Check</span>
          </button>
        </div>
      </div>

      {/* Consistent Gender Key Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-well)]/70 border border-[var(--border-subtle)]">
        <span className="text-xs font-medium text-[var(--ink-secondary)]">
          Visual Gender Key (consistent across every lesson & table):
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <GenderBadge gender="M" showArticle size="xs" />
          <GenderBadge gender="F" showArticle size="xs" />
          <GenderBadge gender="N" showArticle size="xs" />
          <GenderBadge gender="PL" showArticle size="xs" />
        </div>
      </div>

      {/* CEFR Level Sections */}
      <div className="space-y-10">
        {visibleSections.map((section) => {
          const sectionLessons = LESSONS.filter((l) => l.cefr === section.level);
          const sectionMastered = sectionLessons.filter(
            (l) => (lessonProgress[l.id]?.mastery ?? 0) >= 85
          ).length;

          return (
            <section key={section.level} aria-labelledby={`section-${section.level}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-sm font-extrabold px-2.5 py-1 rounded-lg border ${section.badgeClasses}`}
                  >
                    {section.level}
                  </span>
                  <div>
                    <h3
                      id={`section-${section.level}`}
                      className="font-display font-bold text-xl text-[var(--ink-primary)]"
                    >
                      {section.name}
                    </h3>
                    <p className="text-sm text-[var(--ink-secondary)]">{section.tagline}</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-[var(--ink-muted)]">
                  {sectionMastered} / {sectionLessons.length} units mastered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    progress={lessonProgress[lesson.id]}
                    cefrBadgeClass={section.badgeClasses}
                    onOpenCheatSheet={onOpenCheatSheet}
                    onStartLesson={onStartLesson}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
