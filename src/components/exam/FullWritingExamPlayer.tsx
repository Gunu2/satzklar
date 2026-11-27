import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Globe,
  Lightbulb,
  PenLine,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react';
import type {
  FullWritingPaper,
  FullWritingPaperEvaluation,
  GradeBand,
} from '../../types/fullExam';
import { evaluateFullWritingPaperLocally } from '../../utils/fullWritingGrader';
import { countGermanWords } from '../../utils/writingGrader';
import { AudioButton } from '../drill/AudioButton';

interface FullWritingExamPlayerProps {
  paper: FullWritingPaper;
  onComplete: (scorePct: number, xpEarned: number) => void;
  onExit: () => void;
}

const BAND_COLORS: Record<GradeBand, string> = {
  A: 'bg-[#059669] text-white',
  B: 'bg-[#2563EB] text-white',
  C: 'bg-[#D97706] text-white',
  D: 'bg-orange-600 text-white',
  E: 'bg-[#E11D48] text-white',
};

export function FullWritingExamPlayer({
  paper,
  onComplete,
  onExit,
}: FullWritingExamPlayerProps) {
  const [activeTaskIdx, setActiveTaskIdx] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(paper.durationMinutes * 60);
  const [showRedemittel, setShowRedemittel] = useState(true);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [evaluation, setEvaluation] = useState<FullWritingPaperEvaluation | null>(null);

  useEffect(() => {
    if (evaluation) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [evaluation]);

  const activeTask = paper.tasks[activeTaskIdx];
  const activeDraft = drafts[activeTask.id] ?? '';
  const activeWords = countGermanWords(activeDraft);

  const getCoveredBullets = (taskId: string, text: string) => {
    const task = paper.tasks.find((t) => t.id === taskId);
    if (!task) return [];
    const lower = text.toLowerCase();
    return task.leitpunkte
      .filter((lp) => lp.detectionKeywords.some((kw) => lower.includes(kw.toLowerCase())))
      .map((lp) => lp.id);
  };

  const activeCovered = getCoveredBullets(activeTask.id, activeDraft);

  const handleInsertPhrase = (phrase: string) => {
    setDrafts((prev) => {
      const cur = (prev[activeTask.id] ?? '').trimEnd();
      const sep = !cur ? '' : phrase.endsWith(',') ? '\n\n' : ' ';
      return {
        ...prev,
        [activeTask.id]: `${cur}${sep}${phrase} `,
      };
    });
  };

  const handleSubmitPaper = () => {
    const res = evaluateFullWritingPaperLocally(paper, drafts);
    setEvaluation(res);
    const xp = res.passed ? 130 : 55;
    onComplete(Math.round(res.totalPoints), xp);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setDrafts({});
    setEvaluation(null);
    setShowModelAnswer(false);
    setActiveTaskIdx(0);
    setSecondsLeft(paper.durationMinutes * 60);
  };

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalDraftWords = paper.tasks.reduce(
    (sum, t) => sum + countGermanWords(drafts[t.id] ?? ''),
    0
  );

  return (
    <div id="full-writing-exam-player" className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Official Kandidatenblätter Top Header */}
      <div
        className="paper-elevated rounded-2xl overflow-hidden"
        style={{ borderTop: `4px solid ${paper.badgeColor}` }}
      >
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="btn-exit-full-writing"
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-well)]/70 text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exam Studio</span>
            </button>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                Kandidatenblätter · {paper.institute} {paper.cefr} · {paper.durationMinutes} Minuten
              </p>
              <h1 className="font-display font-extrabold text-base sm:text-xl text-[var(--ink-primary)]">
                {paper.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRedemittel((s) => !s)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-primary)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{showRedemittel ? 'Hide Redemittel' : 'Show Redemittel'}</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] font-mono text-xs font-extrabold text-[var(--ink-primary)]">
              <Timer className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="tabular-nums">{formatClock(secondsLeft)}</span>
            </div>
            <button
              id="btn-submit-full-writing"
              type="button"
              disabled={totalDraftWords < 10}
              onClick={handleSubmitPaper}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 disabled:opacity-45 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Bewertungsbogen (Grade All)</span>
            </button>
          </div>
        </div>

        {/* Multi-Aufgabe Tab Strip */}
        <div
          className={`px-4 sm:px-5 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-well)]/50 grid gap-2 ${
            paper.tasks.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {paper.tasks.map((task, idx) => {
            const w = countGermanWords(drafts[task.id] ?? '');
            const cov = getCoveredBullets(task.id, drafts[task.id] ?? '').length;
            const active = activeTaskIdx === idx;
            return (
              <button
                key={task.id}
                id={`btn-writing-task-${task.partNumber}`}
                type="button"
                onClick={() => {
                  setActiveTaskIdx(idx);
                  setShowModelAnswer(false);
                }}
                className={`text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--bg-surface)] border-[#2563EB] shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-[var(--bg-surface)]/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm text-[var(--ink-primary)]">
                    {task.label} · {task.maxPoints} Pkt.
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      w >= task.minWords ? 'text-[#059669]' : 'text-[var(--ink-muted)]'
                    }`}
                  >
                    {w}/{task.targetWords}w
                  </span>
                </div>
                <p className="text-xs text-[var(--ink-muted)] truncate mt-0.5">
                  {task.recommendedMinutes} Min · {cov}/{task.leitpunkte.length} Leitpunkte
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Official Goethe / ÖSD A–E Bewertungsbogen Report */}
      {evaluation && (
        <section
          id="full-writing-bewertungsbogen"
          className="paper-elevated rounded-3xl p-5 sm:p-6 space-y-5 animate-pop-in"
          style={{
            borderColor: evaluation.passed ? '#059669' : '#D97706',
            borderWidth: '2px',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-white shadow-sm ${
                  evaluation.passed ? 'bg-[#059669]' : 'bg-[#D97706]'
                }`}
              >
                <span className="text-xl leading-none">{evaluation.totalPoints}</span>
                <span className="text-[10px] opacity-90">/100</span>
              </div>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Offizieller Bewertungsbogen · {paper.institute} {paper.cefr}
                </p>
                <h2 className="font-display text-2xl font-extrabold text-[var(--ink-primary)] flex items-center gap-2">
                  <Award
                    className={`w-6 h-6 ${
                      evaluation.passed ? 'text-[#059669]' : 'text-[#D97706]'
                    }`}
                  />
                  <span>
                    {evaluation.passed
                      ? 'Bestanden! (≥ 60 Punkte)'
                      : 'Noch nicht bestanden (< 60 Punkte)'}
                  </span>
                </h2>
                <p className="text-sm text-[var(--ink-secondary)]">
                  {evaluation.overallVerdict}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Fresh Paper</span>
            </button>
          </div>

          {/* Official A-E Table per Aufgabe */}
          <div className="space-y-4">
            {evaluation.taskGrades.map((tg) => (
              <div
                key={tg.taskId}
                className="paper-well rounded-2xl p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
                      {tg.label}: {tg.title}
                    </h3>
                    <p className="font-mono text-xs text-[var(--ink-muted)]">
                      {tg.wordCount} words
                      {tg.zeroedByErfuellungE &&
                        ' · Official Rule Applied: Erfüllung = E → 0 Punkte for this task'}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-extrabold px-3 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--ink-primary)]">
                    {tg.totalPoints} / {tg.maxPoints} Pkt.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {tg.criteria.map((c) => (
                    <div
                      key={c.criterion}
                      className="rounded-xl p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-xs text-[var(--ink-primary)]">
                          {c.criterion}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-6 h-6 rounded-md font-mono text-xs font-extrabold inline-flex items-center justify-center ${BAND_COLORS[c.band]}`}
                          >
                            {c.band}
                          </span>
                          <span className="font-mono text-xs font-bold text-[var(--ink-secondary)]">
                            {c.points}/{c.maxPoints}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[var(--ink-secondary)] leading-snug">
                        {c.note}
                      </p>
                    </div>
                  ))}
                </div>

                {tg.issues.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {tg.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-lg p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-start gap-2 text-xs"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono font-bold text-[var(--ink-primary)]">
                            {issue.category}:{' '}
                          </span>
                          <span className="font-mono line-through text-[#E11D48]">
                            {issue.fragment}
                          </span>{' '}
                          →{' '}
                          <span className="font-mono font-bold text-[#059669]">
                            {issue.suggestion}
                          </span>{' '}
                          <span className="text-[var(--ink-secondary)]">
                            — {issue.rulePill}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Aufgabe Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Prompt Sheet, Online-Gästebuch Stimulus & Leitpunkte */}
        <div className="lg:col-span-5 space-y-4">
          <section className="paper-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span
                className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md text-white"
                style={{ backgroundColor: paper.badgeColor }}
              >
                {activeTask.label} · {activeTask.maxPoints} Punkte
              </span>
              <span className="font-mono text-xs text-[var(--ink-muted)]">
                Arbeitszeit: ca. {activeTask.recommendedMinutes} Min.
              </span>
            </div>

            <div>
              <h2 className="font-display font-bold text-lg text-[var(--ink-primary)]">
                {activeTask.title}
              </h2>
              <p className="text-sm text-[var(--ink-secondary)] mt-2 leading-relaxed">
                {activeTask.situation}
              </p>
            </div>

            {/* Authentic Online-Gästebuch Card (for Aufgabe 2) */}
            {activeTask.guestbookStimulus && (
              <div className="rounded-xl border border-[var(--border-strong)] overflow-hidden bg-[var(--bg-surface)] shadow-xs">
                <div className="px-3 py-2 bg-[var(--bg-well)] border-b border-[var(--border-subtle)] flex items-center gap-2 font-mono text-[11px] text-[var(--ink-muted)]">
                  <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{activeTask.guestbookStimulus.siteUrl} · Gästebuch</span>
                </div>
                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="font-display text-[var(--ink-primary)]">
                      {activeTask.guestbookStimulus.author}
                    </strong>
                    <span className="font-mono text-[10px] text-[var(--ink-muted)]">
                      {activeTask.guestbookStimulus.timestamp}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--ink-primary)] italic leading-relaxed">
                    „{activeTask.guestbookStimulus.quote}“
                  </p>
                </div>
              </div>
            )}

            {/* Leitpunkte Checklist */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-[var(--ink-muted)]">
                  Inhaltspunkte (Leitpunkte)
                </span>
                <span className="font-mono text-xs font-bold text-[#059669]">
                  {activeCovered.length}/{activeTask.leitpunkte.length} ✓
                </span>
              </div>
              <ul className="space-y-2">
                {activeTask.leitpunkte.map((lp) => {
                  const done = activeCovered.includes(lp.id);
                  return (
                    <li
                      key={lp.id}
                      className={`p-3 rounded-xl border text-xs sm:text-sm transition-colors ${
                        done
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800'
                          : 'bg-[var(--bg-well)]/60 border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-[var(--ink-muted)] shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold text-[var(--ink-primary)] leading-snug">
                            {lp.label}
                          </p>
                          <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                            {lp.hint}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {/* Official Konnektoren Cheat Strip */}
          <section className="paper-card rounded-2xl p-4 space-y-2.5">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Konnektoren (Syntax Guide)
            </h3>
            <div className="space-y-2">
              {paper.konnektoren.map((k) => (
                <div key={k.group} className="paper-well rounded-xl p-2.5 space-y-1">
                  <p className="font-mono text-[11px] font-bold text-[var(--ink-primary)]">
                    {k.group}
                  </p>
                  <p className="text-[11px] text-[var(--ink-muted)]">{k.rule}</p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {k.words.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleInsertPhrase(w)}
                        className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#2563EB] text-[var(--ink-primary)] cursor-pointer"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Answer Sheet Editor + Redemittel + Musterlösung */}
        <div className="lg:col-span-7 space-y-4">
          <section className="paper-card rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="full-writing-textarea"
                className="font-display font-bold text-sm text-[var(--ink-primary)] flex items-center gap-1.5"
              >
                <PenLine className="w-4 h-4 text-[#2563EB]" />
                <span>Antwortbogen · {activeTask.label}</span>
              </label>
              <span
                className={`font-mono text-xs font-bold ${
                  activeWords >= activeTask.minWords
                    ? 'text-[#059669]'
                    : 'text-[var(--ink-secondary)]'
                }`}
              >
                {activeWords} / {activeTask.targetWords} Wörter (min {activeTask.minWords})
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-[var(--bg-well)] overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  activeWords >= activeTask.minWords ? 'bg-[#059669]' : 'bg-[#2563EB]'
                }`}
                style={{
                  width: `${Math.min(100, Math.round((activeWords / activeTask.targetWords) * 100))}%`,
                }}
              />
            </div>

            <textarea
              id="full-writing-textarea"
              rows={12}
              value={activeDraft}
              onChange={(e) =>
                setDrafts((prev) => ({ ...prev, [activeTask.id]: e.target.value }))
              }
              placeholder={`Schreiben Sie hier Ihren Text für ${activeTask.label} (ca. ${activeTask.targetWords} Wörter)...`}
              className="w-full rounded-2xl p-4 bg-[var(--bg-well)]/75 border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-sm sm:text-base text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] leading-relaxed resize-y"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                id="btn-full-writing-model"
                type="button"
                onClick={() => setShowModelAnswer((s) => !s)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>
                  {showModelAnswer ? 'Hide Musterlösung' : `Musterlösung (${activeTask.label})`}
                </span>
              </button>

              {activeTaskIdx < paper.tasks.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTaskIdx((i) => i + 1);
                    setShowModelAnswer(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Next: {paper.tasks[activeTaskIdx + 1].label} →
                </button>
              ) : (
                <button
                  type="button"
                  disabled={totalDraftWords < 10}
                  onClick={handleSubmitPaper}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#059669] text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 disabled:opacity-45 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Complete Paper</span>
                </button>
              )}
            </div>
          </section>

          {/* Official Redemittel Bank (Click to Insert) */}
          {showRedemittel && (
            <section className="paper-card rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-bold text-sm text-[var(--ink-primary)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <span>Offizielle {paper.cefr} Redemittel (Click to Insert)</span>
              </h3>
              <div className="space-y-3">
                {paper.redemittelBank.map((group) => (
                  <div key={group.section + group.category} className="space-y-1.5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                      {group.section} · {group.category}
                    </p>
                    <div translate="no" className="notranslate flex flex-wrap gap-1.5">
                      {group.phrases.map((phrase) => (
                        <button
                          key={phrase}
                          type="button"
                          onClick={() => handleInsertPhrase(phrase)}
                          className="text-left inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-well)] border border-[var(--border-subtle)] hover:border-[#2563EB] text-xs font-medium text-[var(--ink-primary)] cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-[#2563EB] shrink-0" />
                          <span>{phrase}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Band-A Musterlösung */}
          {showModelAnswer && (
            <section
              id="full-writing-model-box"
              className="paper-card rounded-2xl p-5 space-y-3 animate-slide-up"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold uppercase text-[#059669]">
                  Band-A Musterlösung · {activeTask.label} ({activeTask.maxPoints} Pkt.)
                </span>
                <AudioButton text={activeTask.modelAnswer.text} compact />
              </div>
              <div
                translate="no"
                className="notranslate p-4 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-sm text-[var(--ink-primary)] whitespace-pre-line leading-relaxed"
              >
                {activeTask.modelAnswer.text}
              </div>
              <p className="text-xs text-[var(--ink-secondary)]">
                <strong>Examiner Note:</strong> {activeTask.modelAnswer.examinerNote}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
