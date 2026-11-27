import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  GraduationCap,
  Headphones,
  PenLine,
  Play,
} from 'lucide-react';
import { LISTENING_EXAMS } from '../../data/exams/listeningExams';
import { WRITING_EXAMS } from '../../data/exams/writingExams';
import type {
  CEFRLevel,
  ExamInstitute,
  ExamResultRecord,
  ListeningExam,
  WritingExam,
} from '../../types/grammar';
import { ListeningExamPlayer } from './ListeningExamPlayer';
import { WritingExamPlayer } from './WritingExamPlayer';

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
  const [skillFilter, setSkillFilter] = useState<'all' | 'hoeren' | 'schreiben'>('all');
  const [cefrFilter, setCefrFilter] = useState<'All' | CEFRLevel>('All');
  const [instituteFilter, setInstituteFilter] = useState<'All' | ExamInstitute>('All');

  const [activeListening, setActiveListening] = useState<ListeningExam | null>(null);
  const [activeWriting, setActiveWriting] = useState<WritingExam | null>(null);

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

  const totalExams = LISTENING_EXAMS.length + WRITING_EXAMS.length;
  const passedCount = Object.values(examProgress).filter((r) => r.passed).length;

  return (
    <div id="exam-studio-view" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Goethe-Zertifikat · ÖSD · telc Simulator</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)] tracking-tight">
            Prüfungstraining: Hören & Schreiben
          </h1>
          <p className="text-sm text-[var(--ink-secondary)] mt-1">
            {LISTENING_EXAMS.length} Listening tracks + {WRITING_EXAMS.length} Writing mock exams across A1–B2 with official 60% pass grading ·{' '}
            <span className="font-mono font-bold text-[var(--ink-primary)]">
              {passedCount}/{totalExams} passed
            </span>
          </p>
        </div>

        {/* Skill Filter Pills */}
        <div className="inline-flex p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] self-start lg:self-auto">
          {(
            [
              { id: 'all', label: 'All Skills' },
              { id: 'hoeren', label: 'Hören (Listening)' },
              { id: 'schreiben', label: 'Schreiben (Writing)' },
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
      </div>

      {/* Secondary Filter Bar: CEFR + Institute */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono font-bold text-[var(--ink-muted)] mr-1">
            CEFR:
          </span>
          {(['All', 'A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
            <button
              key={lvl}
              id={`exam-cefr-${lvl}`}
              type="button"
              onClick={() => setCefrFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                cefrFilter === lvl
                  ? 'bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono font-bold text-[var(--ink-muted)] mr-1">
            Institute:
          </span>
          {(['All', 'Goethe-Zertifikat', 'ÖSD', 'telc'] as const).map((inst) => (
            <button
              key={inst}
              type="button"
              onClick={() => setInstituteFilter(inst)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                instituteFilter === inst
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {inst}
            </button>
          ))}
        </div>
      </div>

      {/* HÖREN SECTION */}
      {filteredListening.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-display font-bold text-xl text-[var(--ink-primary)]">
                Hören — Listening Mock Exams
              </h2>
              <p className="text-xs sm:text-sm text-[var(--ink-secondary)]">
                Authentic announcements, voicemails, dialogues & debates with real 1×/2× replay limits and transcript evidence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredListening.map((exam) => {
              const rec = examProgress[exam.id];
              return (
                <article
                  key={exam.id}
                  id={`exam-card-${exam.id}`}
                  className="paper-card rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {exam.cefr} · {exam.institute}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--ink-muted)]">
                          {exam.maxPlaysExamMode}× hören
                        </span>
                      </div>

                      {rec && (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                            rec.passed
                              ? 'bg-emerald-50 text-[#047857] dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-amber-50 text-[#B45309] dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {rec.passed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {rec.bestScore}%
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-mono text-[11px] font-semibold text-[var(--ink-muted)]">
                        {exam.partLabel}
                      </p>
                      <h3 className="font-display font-bold text-lg text-[var(--ink-primary)]">
                        {exam.title}
                      </h3>
                    </div>

                    <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                      {exam.scenario}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.recommendedMinutes} min · {exam.questions.length} items
                    </span>
                    <button
                      id={`btn-start-exam-${exam.id}`}
                      type="button"
                      onClick={() => setActiveListening(exam)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Hören</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* SCHREIBEN SECTION */}
      {filteredWriting.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#E11D48]/10 text-[#E11D48] dark:text-[#FB7185] flex items-center justify-center">
              <PenLine className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-display font-bold text-xl text-[var(--ink-primary)]">
                Schreiben — Writing Mock Exams
              </h2>
              <p className="text-xs sm:text-sm text-[var(--ink-secondary)]">
                Official Leitpunkte checklists, clickable Redemittel phrases, 4-criterion rubric grading (0–100 Punkte), and Band-100 Musterlösungen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWriting.map((exam) => {
              const rec = examProgress[exam.id];
              return (
                <article
                  key={exam.id}
                  id={`exam-card-${exam.id}`}
                  className="paper-card rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-[#BE123C] dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          {exam.cefr} · {exam.institute}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--ink-muted)]">
                          ~{exam.targetWords} words
                        </span>
                      </div>

                      {rec && (
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
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
                      <p className="font-mono text-[11px] font-semibold text-[var(--ink-muted)]">
                        {exam.partLabel}
                      </p>
                      <h3 className="font-display font-bold text-lg text-[var(--ink-primary)]">
                        {exam.title}
                      </h3>
                    </div>

                    <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                      {exam.situation}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.recommendedMinutes} min · {exam.leitpunkte.length} Leitpunkte
                    </span>
                    <button
                      id={`btn-start-exam-${exam.id}`}
                      type="button"
                      onClick={() => setActiveWriting(exam)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>Start Schreiben</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
