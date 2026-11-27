import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  FileCheck2,
  GraduationCap,
  Headphones,
  PenLine,
  Play,
  Sparkles,
} from 'lucide-react';
import { LISTENING_EXAMS } from '../../data/exams/listeningExams';
import { WRITING_EXAMS } from '../../data/exams/writingExams';
import { FULL_LISTENING_B1 } from '../../data/exams/fullListeningB1';
import { FULL_LISTENING_B2 } from '../../data/exams/fullListeningB2';
import { FULL_WRITING_PAPERS } from '../../data/exams/fullWritingPapers';
import type {
  CEFRLevel,
  ExamInstitute,
  ExamResultRecord,
  ListeningExam,
  WritingExam,
} from '../../types/grammar';
import type { FullListeningPaper, FullWritingPaper } from '../../types/fullExam';
import { ListeningExamPlayer } from './ListeningExamPlayer';
import { WritingExamPlayer } from './WritingExamPlayer';
import { FullListeningExamPlayer } from './FullListeningExamPlayer';
import { FullWritingExamPlayer } from './FullWritingExamPlayer';
import { useLanguage } from '../../i18n/useLanguage';

const FULL_LISTENING_PAPERS: FullListeningPaper[] = [
  FULL_LISTENING_B1,
  FULL_LISTENING_B2,
];

interface ExamStudioViewProps {
  examProgress: Record<string, ExamResultRecord>;
  hasGeminiKey: boolean;
  geminiApiKey: string;
  onOpenSettings: () => void;
  onRecordExamResult: (
    examId: string,
    skill: 'hoeren' | 'schreiben',
    cefr: CEFRLevel,
    scorePct: number,
    xpEarned: number
  ) => void;
}

export function ExamStudioView({
  examProgress,
  hasGeminiKey,
  geminiApiKey,
  onOpenSettings,
  onRecordExamResult,
}: ExamStudioViewProps) {
  const { t } = useLanguage();
  const [skillFilter, setSkillFilter] = useState<'all' | 'hoeren' | 'schreiben'>('all');
  const [cefrFilter, setCefrFilter] = useState<'All' | CEFRLevel>('All');
  const [instituteFilter, setInstituteFilter] = useState<'All' | ExamInstitute>('All');

  const [activeFullListening, setActiveFullListening] =
    useState<FullListeningPaper | null>(null);
  const [activeFullWriting, setActiveFullWriting] =
    useState<FullWritingPaper | null>(null);
  const [activeListening, setActiveListening] = useState<ListeningExam | null>(null);
  const [activeWriting, setActiveWriting] = useState<WritingExam | null>(null);

  if (activeFullListening) {
    return (
      <FullListeningExamPlayer
        paper={activeFullListening}
        onComplete={(scorePct, xp) =>
          onRecordExamResult(
            activeFullListening.id,
            'hoeren',
            activeFullListening.cefr,
            scorePct,
            xp
          )
        }
        onExit={() => setActiveFullListening(null)}
      />
    );
  }

  if (activeFullWriting) {
    return (
      <FullWritingExamPlayer
        paper={activeFullWriting}
        onComplete={(scorePct, xp) =>
          onRecordExamResult(
            activeFullWriting.id,
            'schreiben',
            activeFullWriting.cefr,
            scorePct,
            xp
          )
        }
        onExit={() => setActiveFullWriting(null)}
      />
    );
  }

  if (activeListening) {
    return (
      <ListeningExamPlayer
        exam={activeListening}
        onComplete={(scorePct, xp) =>
          onRecordExamResult(
            activeListening.id,
            'hoeren',
            activeListening.cefr,
            scorePct,
            xp
          )
        }
        onExit={() => setActiveListening(null)}
      />
    );
  }

  if (activeWriting) {
    return (
      <WritingExamPlayer
        exam={activeWriting}
        hasGeminiKey={hasGeminiKey}
        geminiApiKey={geminiApiKey}
        onOpenSettings={onOpenSettings}
        onComplete={(scorePct, xp) =>
          onRecordExamResult(
            activeWriting.id,
            'schreiben',
            activeWriting.cefr,
            scorePct,
            xp
          )
        }
        onExit={() => setActiveWriting(null)}
      />
    );
  }

  const visibleFullListening = FULL_LISTENING_PAPERS.filter(
    (p) =>
      (skillFilter === 'all' || skillFilter === 'hoeren') &&
      (cefrFilter === 'All' || p.cefr === cefrFilter) &&
      (instituteFilter === 'All' || p.institute === instituteFilter)
  );

  const visibleFullWriting = FULL_WRITING_PAPERS.filter(
    (p) =>
      (skillFilter === 'all' || skillFilter === 'schreiben') &&
      (cefrFilter === 'All' || p.cefr === cefrFilter) &&
      (instituteFilter === 'All' || p.institute === instituteFilter)
  );

  const filteredListening = LISTENING_EXAMS.filter(
    (e) =>
      (skillFilter === 'all' || skillFilter === 'hoeren') &&
      (cefrFilter === 'All' || e.cefr === cefrFilter) &&
      (instituteFilter === 'All' || e.institute === instituteFilter)
  );

  const filteredWriting = WRITING_EXAMS.filter(
    (e) =>
      (skillFilter === 'all' || skillFilter === 'schreiben') &&
      (cefrFilter === 'All' || e.cefr === cefrFilter) &&
      (instituteFilter === 'All' || e.institute === instituteFilter)
  );

  const totalCatalog =
    FULL_LISTENING_PAPERS.length +
    FULL_WRITING_PAPERS.length +
    LISTENING_EXAMS.length +
    WRITING_EXAMS.length;
  const passedCount = Object.values(examProgress).filter((r) => r.passed).length;

  return (
    <div id="exam-studio-view" className="space-y-9">
      {/* Editorial Exam-Hall Hero */}
      <section className="paper-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#EA580C] dark:text-orange-400">
              <GraduationCap className="w-4 h-4" />
              <span>Goethe-Zertifikat · ÖSD · telc · Prüfungssimulator</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[var(--ink-primary)] tracking-tight leading-tight">
              {t.examHeroTitle}
            </h1>
            <p className="text-sm sm:text-base text-[var(--ink-secondary)] leading-relaxed">
              {t.examHeroDesc}
            </p>
          </div>

          {/* Exam Hall Quick Stats */}
          <div className="grid grid-cols-3 gap-2.5 shrink-0">
            <div className="paper-well rounded-2xl p-3.5 text-center min-w-24">
              <p className="font-mono text-2xl font-extrabold text-[#EA580C] dark:text-orange-400">
                4
              </p>
              <p className="text-[11px] font-medium text-[var(--ink-muted)] mt-0.5">
                Full Papers
              </p>
            </div>
            <div className="paper-well rounded-2xl p-3.5 text-center min-w-24">
              <p className="font-mono text-2xl font-extrabold text-[#2563EB] dark:text-[#60A5FA]">
                16
              </p>
              <p className="text-[11px] font-medium text-[var(--ink-muted)] mt-0.5">
                Skill Drills
              </p>
            </div>
            <div className="paper-well rounded-2xl p-3.5 text-center min-w-24">
              <p className="font-mono text-2xl font-extrabold text-[#059669]">
                {passedCount}/{totalCatalog}
              </p>
              <p className="text-[11px] font-medium text-[var(--ink-muted)] mt-0.5">
                Bestanden
              </p>
            </div>
          </div>
        </div>

        {/* Unified Filter Controls */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]">
            {(
              [
                { id: 'all', label: 'All Skills' },
                { id: 'hoeren', label: 'Hören' },
                { id: 'schreiben', label: 'Schreiben' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                id={`exam-skill-${item.id}`}
                type="button"
                onClick={() => setSkillFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  skillFilter === item.id
                    ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {(['All', 'A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
                <button
                  key={lvl}
                  id={`exam-cefr-${lvl}`}
                  type="button"
                  onClick={() => setCefrFilter(lvl)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                    cefrFilter === lvl
                      ? 'bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {(['All', 'Goethe-Zertifikat', 'ÖSD', 'telc'] as const).map((inst) => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => setInstituteFilter(inst)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    instituteFilter === inst
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  {inst === 'Goethe-Zertifikat' ? 'Goethe' : inst}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: FULL-LENGTH MOCK EXAM PAPERS (VOLLPRÜFUNGEN) */}
      {(visibleFullListening.length > 0 || visibleFullWriting.length > 0) && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-[#EA580C] dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--ink-primary)]">
                  Vollprüfungen — Full-Length Official Mock Papers
                </h2>
                <p className="text-xs sm:text-sm text-[var(--ink-secondary)]">
                  Complete multi-part exam booklets matching real Goethe-Zertifikat & ÖSD item counts, timing, and 100-point grading.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleFullListening.map((paper) => {
              const rec = examProgress[paper.id];
              return (
                <article
                  key={paper.id}
                  id={`full-exam-card-${paper.id}`}
                  className="paper-elevated rounded-2xl overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-0.5"
                  style={{ borderLeft: `5px solid ${paper.badgeColor}` }}
                >
                  <div className="p-5 sm:p-6 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: paper.badgeColor }}
                        >
                          {paper.cefr} · VOLLPRÜFUNG
                        </span>
                        <span className="font-mono text-xs font-semibold text-[var(--ink-muted)]">
                          Goethe / ÖSD Format
                        </span>
                      </div>
                      {rec && (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                            rec.passed
                              ? 'bg-emerald-50 text-[#047857] dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-amber-50 text-[#B45309] dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {rec.passed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {rec.bestScore}/100
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display font-extrabold text-xl text-[var(--ink-primary)] leading-snug">
                        {paper.title}
                      </h3>
                      <p className="text-sm text-[var(--ink-secondary)] mt-1.5 leading-relaxed">
                        {paper.subtitle}
                      </p>
                    </div>

                    {/* Official Blueprint Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {paper.sections.map((s) => (
                        <span
                          key={s.partNumber}
                          className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-well)] border border-[var(--border-subtle)] text-[var(--ink-secondary)]"
                        >
                          {s.title} ({s.items.length} · {s.playsAllowed}×)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 py-4 bg-[var(--bg-well)]/55 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-bold text-[var(--ink-secondary)] inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {paper.durationMinutes} Min · {paper.totalItems} Items
                    </span>
                    <button
                      id={`btn-start-full-${paper.id}`}
                      type="button"
                      onClick={() => setActiveFullListening(paper)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                    >
                      <Headphones className="w-4 h-4" />
                      <span>Start 30-Item Hören</span>
                    </button>
                  </div>
                </article>
              );
            })}

            {visibleFullWriting.map((paper) => {
              const rec = examProgress[paper.id];
              return (
                <article
                  key={paper.id}
                  id={`full-exam-card-${paper.id}`}
                  className="paper-elevated rounded-2xl overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-0.5"
                  style={{ borderLeft: `5px solid ${paper.badgeColor}` }}
                >
                  <div className="p-5 sm:p-6 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: paper.badgeColor }}
                        >
                          {paper.cefr} · VOLLPRÜFUNG
                        </span>
                        <span className="font-mono text-xs font-semibold text-[var(--ink-muted)]">
                          A–E Bewertungsbogen
                        </span>
                      </div>
                      {rec && (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                            rec.passed
                              ? 'bg-emerald-50 text-[#047857] dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-amber-50 text-[#B45309] dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {rec.passed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {rec.bestScore}/100
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display font-extrabold text-xl text-[var(--ink-primary)] leading-snug">
                        {paper.title}
                      </h3>
                      <p className="text-sm text-[var(--ink-secondary)] mt-1.5 leading-relaxed">
                        {paper.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {paper.tasks.map((t) => (
                        <span
                          key={t.id}
                          className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-well)] border border-[var(--border-subtle)] text-[var(--ink-secondary)]"
                        >
                          {t.label} ({t.maxPoints} Pkt. · ~{t.targetWords}w)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 py-4 bg-[var(--bg-well)]/55 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-bold text-[var(--ink-secondary)] inline-flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      {paper.durationMinutes} Min · {paper.tasks.length} Aufgaben
                    </span>
                    <button
                      id={`btn-start-full-${paper.id}`}
                      type="button"
                      onClick={() => setActiveFullWriting(paper)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    >
                      <PenLine className="w-4 h-4" />
                      <span>Start Full Schreiben</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 2: FOCUSED SKILL DRILLS (A1–B2) */}
      {(filteredListening.length > 0 || filteredWriting.length > 0) && (
        <section className="space-y-6 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[var(--bg-well)] text-[var(--ink-primary)] border border-[var(--border-subtle)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
            </span>
            <div>
              <h2 className="font-display font-bold text-xl text-[var(--ink-primary)]">
                Focused Practice Modules (A1–B2 · Quick Single-Part Drills)
              </h2>
              <p className="text-xs sm:text-sm text-[var(--ink-secondary)]">
                Short 5–20 minute targeted drills for A1, A2, B1, and B2 across Goethe-Zertifikat, ÖSD, and telc.
              </p>
            </div>
          </div>

          {filteredListening.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                <span>Hören · Single-Part Practice ({filteredListening.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredListening.map((exam) => {
                  const rec = examProgress[exam.id];
                  return (
                    <article
                      key={exam.id}
                      id={`exam-card-${exam.id}`}
                      className="paper-card rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {exam.cefr} · {exam.institute}
                          </span>
                          {rec && (
                            <span className="font-mono text-xs font-bold text-[#059669]">
                              {rec.bestScore}%
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-[var(--ink-muted)]">
                          {exam.partLabel} · {exam.maxPlaysExamMode}× hören
                        </p>
                        <h4 className="font-display font-bold text-base text-[var(--ink-primary)]">
                          {exam.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
                          {exam.scenario}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                        <span className="font-mono text-xs text-[var(--ink-muted)]">
                          {exam.recommendedMinutes} min · {exam.questions.length} items
                        </span>
                        <button
                          id={`btn-start-exam-${exam.id}`}
                          type="button"
                          onClick={() => setActiveListening(exam)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Practice</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {filteredWriting.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#E11D48] dark:text-[#FB7185] flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5" />
                <span>Schreiben · Single-Task Practice ({filteredWriting.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWriting.map((exam) => {
                  const rec = examProgress[exam.id];
                  return (
                    <article
                      key={exam.id}
                      id={`exam-card-${exam.id}`}
                      className="paper-card rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-[#BE123C] dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            {exam.cefr} · {exam.institute}
                          </span>
                          {rec && (
                            <span className="font-mono text-xs font-bold text-[#059669]">
                              {rec.bestScore}/100
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-[var(--ink-muted)]">
                          {exam.partLabel} · ~{exam.targetWords} words
                        </p>
                        <h4 className="font-display font-bold text-base text-[var(--ink-primary)]">
                          {exam.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
                          {exam.situation}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                        <span className="font-mono text-xs text-[var(--ink-muted)]">
                          {exam.recommendedMinutes} min · {exam.leitpunkte.length} Leitpunkte
                        </span>
                        <button
                          id={`btn-start-exam-${exam.id}`}
                          type="button"
                          onClick={() => setActiveWriting(exam)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold hover:opacity-90 cursor-pointer"
                        >
                          <PenLine className="w-3 h-3" />
                          <span>Practice</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
