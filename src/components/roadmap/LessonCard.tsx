import { BookOpen, Clock, Play, CheckCircle2 } from 'lucide-react';
import type { Lesson, LessonProgress } from '../../types/grammar';

interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
  cefrBadgeClass: string;
  onOpenCheatSheet: (lesson: Lesson) => void;
  onStartLesson: (lesson: Lesson) => void;
}

export function LessonCard({
  lesson,
  progress,
  cefrBadgeClass,
  onOpenCheatSheet,
  onStartLesson,
}: LessonCardProps) {
  const mastery = progress?.mastery ?? 0;
  const isMastered = mastery >= 85;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (mastery / 100) * circumference;

  return (
    <article
      id={`lesson-card-${lesson.id}`}
      className="paper-card rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-[var(--border-strong)] hover:-translate-y-0.5"
    >
      <div>
        {/* Top Row: CEFR + Duration + Mastery Ring */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${cefrBadgeClass}`}
            >
              {lesson.cefr} · Unit {lesson.order}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ink-muted)]">
              <Clock className="w-3.5 h-3.5" />
              {lesson.estimatedMinutes} min
            </span>
          </div>

          {/* Animated SVG Mastery Ring */}
          <div
            className="relative w-12 h-12 shrink-0 flex items-center justify-center"
            title={`Mastery: ${mastery}%`}
          >
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke={isMastered ? '#059669' : '#2563EB'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute font-mono text-[11px] font-bold text-[var(--ink-primary)]">
              {isMastered ? (
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              ) : (
                `${mastery}%`
              )}
            </span>
          </div>
        </div>

        {/* Titles */}
        <h3 className="font-display font-bold text-lg text-[var(--ink-primary)] leading-snug mb-0.5">
          {lesson.title}
        </h3>
        <p translate="no" className="notranslate font-mono text-xs text-[var(--ink-muted)] mb-2.5">
          {lesson.germanTitle}
        </p>
        <p className="text-sm text-[var(--ink-secondary)] leading-relaxed mb-4">
          {lesson.subtitle}
        </p>

        {/* Focus Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {lesson.grammarFocus.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-[var(--bg-well)] text-[var(--ink-secondary)] border border-[var(--border-subtle)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
        <button
          id={`btn-cheatsheet-${lesson.id}`}
          type="button"
          onClick={() => onOpenCheatSheet(lesson)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-well)]/60 hover:bg-[var(--bg-well)] text-xs font-semibold text-[var(--ink-primary)] transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1-Min Sheet</span>
        </button>

        <button
          id={`btn-start-${lesson.id}`}
          type="button"
          onClick={() => onStartLesson(lesson)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{mastery > 0 ? 'Practice Again' : `Start (${lesson.exercises.length})`}</span>
        </button>
      </div>
    </article>
  );
}
