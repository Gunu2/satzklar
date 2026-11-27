import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  KeyRound,
  Lightbulb,
  Loader2,
  PenLine,
  Plus,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react';
import type { WritingEvaluation, WritingExam } from '../../types/grammar';
import {
  countGermanWords,
  detectCoveredBullets,
  evaluateWritingLocally,
  evaluateWritingWithGemini,
} from '../../utils/writingGrader';
import { AudioButton } from '../drill/AudioButton';

interface WritingExamPlayerProps {
  exam: WritingExam;
  hasGeminiKey: boolean;
  geminiApiKey: string;
  onOpenSettings: () => void;
  onComplete: (scorePct: number, xpEarned: number) => void;
  onExit: () => void;
}

export function WritingExamPlayer({
  exam,
  hasGeminiKey,
  geminiApiKey,
  onOpenSettings,
  onComplete,
  onExit,
}: WritingExamPlayerProps) {
  const [draft, setDraft] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(exam.recommendedMinutes * 60);
  const [loading, setLoading] = useState(false);
  const [errorNote, setErrorNote] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const wordCount = countGermanWords(draft);
  const coveredBulletIds = detectCoveredBullets(exam, draft);

  useEffect(() => {
    if (evaluation) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [evaluation]);

  const insertPhrase = (phrase: string) => {
    setDraft((prev) => {
      const trimmed = prev.trimEnd();
      if (!trimmed) return `${phrase} `;
      const sep = phrase.endsWith(',') ? '\n\n' : ' ';
      return `${trimmed}${sep}${phrase} `;
    });
  };

  const handleGrade = async () => {
    if (wordCount < 5) return;
    setErrorNote(null);

    if (hasGeminiKey && geminiApiKey) {
      setLoading(true);
      try {
        const aiEval = await evaluateWritingWithGemini(exam, draft, geminiApiKey);
        setEvaluation(aiEval);
        onComplete(aiEval.totalScore, aiEval.passed ? 50 : 25);
        setLoading(false);
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gemini request failed';
        setErrorNote(
          `Gemini Examiner unavailable (${msg}) — graded with offline Goethe/ÖSD rubric engine instead.`
        );
      } finally {
        setLoading(false);
      }
    }

    const localEval = evaluateWritingLocally(exam, draft);
    setEvaluation(localEval);
    onComplete(localEval.totalScore, localEval.passed ? 50 : 25);
  };

  const formatClock = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const wordProgressPct = Math.min(100, Math.round((wordCount / exam.targetWords) * 100));
  const registerLabel =
    exam.register === 'formal'
      ? 'Formal (Sie)'
      : exam.register === 'informal'
        ? 'Informal (du)'
        : 'Semi-Formal (Forum)';

  return (
    <div id="writing-exam-player" className="max-w-5xl mx-auto space-y-5 pb-10">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="btn-exit-writing-exam"
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Exam Studio</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--ink-secondary)]">
            Register: <strong className="text-[var(--ink-primary)]">{registerLabel}</strong>
          </span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs font-bold text-[var(--ink-primary)]">
            <Timer className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="tabular-nums">{formatClock(secondsLeft)}</span>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-primary)] hover:border-[var(--border-strong)] cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="hidden sm:inline">
              {hasGeminiKey ? 'Gemini Examiner Active' : 'BYOK AI Examiner'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Official Prompt, Leitpunkte Checklist & Redemittel */}
        <div className="lg:col-span-5 space-y-4">
          <section className="paper-elevated rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#E11D48]/10 text-[#BE123C] dark:text-[#FB7185] border border-[#E11D48]/25">
                  {exam.institute} · {exam.cefr}
                </span>
                <span className="font-mono text-xs text-[var(--ink-muted)]">
                  {exam.partLabel}
                </span>
              </div>
              <h1 className="font-display text-xl font-extrabold text-[var(--ink-primary)] leading-snug">
                {exam.title}
              </h1>
              <p className="text-sm text-[var(--ink-secondary)] mt-2 leading-relaxed">
                {exam.situation}
              </p>
            </div>

            {/* Leitpunkte Live Checklist */}
            <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Mandatory Leitpunkte
                </h2>
                <span className="font-mono text-xs font-bold text-[#059669]">
                  {coveredBulletIds.length} / {exam.leitpunkte.length} detected
                </span>
              </div>

              <ul className="space-y-2">
                {exam.leitpunkte.map((lp) => {
                  const covered = coveredBulletIds.includes(lp.id);
                  return (
                    <li
                      key={lp.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        covered
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800'
                          : 'bg-[var(--bg-well)]/60 border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {covered ? (
                          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-[var(--ink-muted)] shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)] leading-snug">
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

          {/* Click-to-Insert Redemittel Phrase Bank */}
          <section className="paper-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-sm text-[var(--ink-primary)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <span>Exam Redemittel (Click to Insert)</span>
              </h2>
            </div>

            <div className="space-y-3">
              {exam.redemittel.map((group) => (
                <div key={group.category} className="space-y-1.5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                    {group.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.phrases.map((phrase) => (
                      <button
                        key={phrase}
                        type="button"
                        onClick={() => insertPhrase(phrase)}
                        className="text-left inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-well)] border border-[var(--border-subtle)] hover:border-[#2563EB] text-xs font-medium text-[var(--ink-primary)] transition-colors cursor-pointer"
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
        </div>

        {/* Right Column: Writing Sheet, Live Word Count, Rubric Evaluation & Model Answer */}
        <div className="lg:col-span-7 space-y-4">
          <section className="paper-card rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="writing-exam-textarea"
                className="font-display font-bold text-sm text-[var(--ink-primary)] flex items-center gap-1.5"
              >
                <PenLine className="w-4 h-4 text-[#2563EB]" />
                <span>Your German Response</span>
              </label>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span
                  className={`font-bold ${
                    wordCount >= exam.minWords
                      ? 'text-[#059669]'
                      : 'text-[var(--ink-secondary)]'
                  }`}
                >
                  {wordCount} / {exam.targetWords} words
                </span>
                <span className="text-[var(--ink-muted)]">(min {exam.minWords})</span>
              </div>
            </div>

            {/* Word Target Progress Bar */}
            <div className="h-1.5 rounded-full bg-[var(--bg-well)] overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  wordCount >= exam.minWords ? 'bg-[#059669]' : 'bg-[#2563EB]'
                }`}
                style={{ width: `${wordProgressPct}%` }}
              />
            </div>

            <textarea
              id="writing-exam-textarea"
              rows={11}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Write your ${exam.cefr} German response here (${registerLabel})... Click any Redemittel chip on the left if you need an authentic exam phrase!`}
              className="w-full rounded-2xl p-4 bg-[var(--bg-well)]/75 border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-sm sm:text-base text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] leading-relaxed resize-y"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                id="btn-toggle-model-answer"
                type="button"
                onClick={() => setShowModelAnswer((s) => !s)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{showModelAnswer ? 'Hide Musterlösung' : 'View Musterlösung'}</span>
              </button>

              <button
                id="btn-grade-writing"
                type="button"
                disabled={wordCount < 5 || loading}
                onClick={() => void handleGrade()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-45 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Examiner Grading…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {hasGeminiKey
                        ? 'Grade with Gemini Examiner'
                        : 'Grade with Official Rubric'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </section>

          {errorNote && (
            <div className="rounded-xl p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-[#B45309] dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorNote}</span>
            </div>
          )}

          {/* Official 4-Criterion Rubric Evaluation Card */}
          {evaluation && (
            <section
              id="writing-evaluation-report"
              className="paper-elevated rounded-2xl p-5 sm:p-6 space-y-5 animate-slide-up"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-white ${
                      evaluation.passed ? 'bg-[#059669]' : 'bg-[#D97706]'
                    }`}
                  >
                    <span className="text-lg leading-none">{evaluation.totalScore}</span>
                    <span className="text-[10px] opacity-85">/100</span>
                  </div>
                  <div>
                    <p className="font-display font-extrabold text-lg text-[var(--ink-primary)]">
                      {evaluation.passed
                        ? 'Bestanden! (Pass ≥ 60)'
                        : 'Noch nicht bestanden (< 60)'}
                    </p>
                    <p className="text-xs text-[var(--ink-secondary)]">
                      {evaluation.source === 'gemini'
                        ? `${exam.institute} AI Examiner Report`
                        : `${exam.institute} Offline Rubric Evaluation`}{' '}
                      · {evaluation.wordCount} words
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--ink-primary)] leading-relaxed">
                {evaluation.overallFeedback}
              </p>

              {/* 4 Official Criteria Breakdown */}
              <div className="grid sm:grid-cols-2 gap-3">
                {evaluation.criteria.map((c) => {
                  const pct = Math.round((c.score / c.maxScore) * 100);
                  return (
                    <div
                      key={c.germanName}
                      className="paper-well rounded-xl p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-xs text-[var(--ink-primary)]">
                          {c.germanName}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-[#2563EB] dark:text-[#60A5FA]">
                          {c.score}/{c.maxScore}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 60 ? 'bg-[#059669]' : 'bg-[#D97706]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[var(--ink-secondary)] leading-snug">
                        {c.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Grammar / Capitalization Rule Pills */}
              {evaluation.issues.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                    Grammar & Style Rule Pills ({evaluation.issues.length})
                  </h3>
                  <div className="space-y-2">
                    {evaluation.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="rounded-xl p-3 bg-[var(--bg-well)]/70 border border-[var(--border-subtle)] flex items-start gap-2.5"
                      >
                        <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono font-bold text-[var(--ink-primary)]">
                              {issue.category}:
                            </span>
                            <span className="font-mono line-through text-[#E11D48]">
                              {issue.fragment}
                            </span>
                            <span>→</span>
                            <span className="font-mono font-bold text-[#059669]">
                              {issue.suggestion}
                            </span>
                          </div>
                          <p className="text-[var(--ink-secondary)]">{issue.rulePill}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Gemini Improved Draft */}
              {evaluation.improvedDraft && (
                <div className="rounded-xl p-4 bg-emerald-50/60 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#047857] dark:text-emerald-300">
                      Polished {exam.cefr} Revision (AI Examiner)
                    </span>
                    <AudioButton text={evaluation.improvedDraft} compact />
                  </div>
                  <p className="text-sm text-[var(--ink-primary)] whitespace-pre-line leading-relaxed">
                    {evaluation.improvedDraft}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Band-100 Musterlösung (Model Answer) */}
          {showModelAnswer && (
            <section
              id="writing-model-answer"
              className="paper-card rounded-2xl p-5 space-y-3 animate-slide-up"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#059669]">
                    Band-100 Musterlösung ({exam.institute} {exam.cefr})
                  </span>
                </div>
                <AudioButton text={exam.modelAnswer.text} compact />
              </div>

              <div
                translate="no"
                className="notranslate p-4 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-sm text-[var(--ink-primary)] whitespace-pre-line leading-relaxed"
              >
                {exam.modelAnswer.text}
              </div>

              <div translate="no" className="notranslate flex flex-wrap gap-1.5">
                {exam.modelAnswer.highlightedPhrases.map((p) => (
                  <span
                    key={p}
                    className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                <strong>Examiner Note:</strong> {exam.modelAnswer.examinerNote}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
