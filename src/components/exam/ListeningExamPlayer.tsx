import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Headphones,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
  Timer,
  Turtle,
  Volume2,
  XCircle,
} from 'lucide-react';
import type { ListeningExam } from '../../types/grammar';
import {
  playListeningTrack,
  type TranscriptPlaybackController,
} from '../../utils/examAudio';

interface ListeningExamPlayerProps {
  exam: ListeningExam;
  onComplete: (scorePct: number, xpEarned: number) => void;
  onExit: () => void;
}

export function ListeningExamPlayer({
  exam,
  onComplete,
  onExit,
}: ListeningExamPlayerProps) {
  const [mode, setMode] = useState<'exam' | 'practice'>('exam');
  const [rate, setRate] = useState<0.75 | 1.0>(1.0);
  const [playsUsed, setPlaysUsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(exam.recommendedMinutes * 60);

  const controllerRef = useRef<TranscriptPlaybackController | null>(null);

  const stopAudio = () => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setIsPlaying(false);
    setActiveLineIdx(null);
  };

  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (submitted) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [submitted]);

  const canPlayAgain =
    mode === 'practice' || submitted || playsUsed < exam.maxPlaysExamMode;

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }
    if (!canPlayAgain) return;

    if (mode === 'exam' && !submitted) {
      setPlaysUsed((c) => c + 1);
    }

    const effectiveRate = mode === 'exam' && !submitted ? 1.0 : rate;
    setIsPlaying(true);

    controllerRef.current = playListeningTrack(
      exam.transcript,
      effectiveRate,
      {
        onLineStart: (idx) => setActiveLineIdx(idx),
        onComplete: () => {
          setIsPlaying(false);
          setActiveLineIdx(null);
          controllerRef.current = null;
        },
      }
    );
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const allAnswered = exam.questions.every((q) => answers[q.id] !== undefined);
  const correctCount = exam.questions.filter(
    (q) => answers[q.id] === q.correctIndex
  ).length;
  const scorePct = Math.round((correctCount / exam.questions.length) * 100);
  const passed = scorePct >= 60;

  const handleSubmit = () => {
    if (!allAnswered || submitted) return;
    stopAudio();
    setSubmitted(true);
    setShowTranscript(true);
    const xp = passed ? 45 : 20;
    onComplete(scorePct, xp);
  };

  const handleReset = () => {
    stopAudio();
    setPlaysUsed(0);
    setAnswers({});
    setSubmitted(false);
    setShowTranscript(false);
    setSecondsLeft(exam.recommendedMinutes * 60);
  };

  const formatClock = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const transcriptUnlocked = mode === 'practice' || submitted;

  return (
    <div id="listening-exam-player" className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="btn-exit-listening-exam"
          type="button"
          onClick={() => {
            stopAudio();
            onExit();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Exam Studio</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Exam vs Practice Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]">
            <button
              id="btn-mode-exam"
              type="button"
              onClick={() => {
                setMode('exam');
                if (!submitted) setShowTranscript(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'exam'
                  ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              Exam Mode ({exam.maxPlaysExamMode}×)
            </button>
            <button
              id="btn-mode-practice"
              type="button"
              onClick={() => setMode('practice')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'practice'
                  ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              Practice Mode
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs font-bold text-[var(--ink-primary)]">
            <Timer className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="tabular-nums">{formatClock(secondsLeft)}</span>
          </div>
        </div>
      </div>

      {/* Exam Header & Audio Console */}
      <section className="paper-elevated rounded-3xl p-5 sm:p-7 space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#2563EB]/10 text-[#1D4ED8] dark:text-[#60A5FA] border border-[#2563EB]/25">
              {exam.institute} · {exam.cefr}
            </span>
            <span className="font-mono text-xs font-semibold text-[var(--ink-muted)]">
              {exam.partLabel}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)]">
            {exam.title}
          </h1>
          <p className="text-sm text-[var(--ink-secondary)] mt-1.5 leading-relaxed">
            {exam.scenario}
          </p>
        </div>

        {/* Audio Deck */}
        <div className="paper-well rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                id="btn-play-listening-track"
                type="button"
                disabled={!isPlaying && !canPlayAgain}
                onClick={handleTogglePlay}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed shadow-sm ${
                  isPlaying
                    ? 'bg-[#E11D48] hover:bg-rose-700'
                    : 'bg-[#2563EB] hover:bg-blue-700'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {playsUsed === 0 ? 'Play Exam Audio (de-DE)' : 'Replay Audio'}
                    </span>
                  </>
                )}
              </button>

              {mode === 'exam' && !submitted ? (
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--ink-secondary)]">
                  Listens left: {Math.max(0, exam.maxPlaysExamMode - playsUsed)} /{' '}
                  {exam.maxPlaysExamMode}
                </span>
              ) : (
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRate(1.0)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                      rate === 1.0
                        ? 'bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 border-transparent'
                        : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    1.0×
                  </button>
                  <button
                    type="button"
                    onClick={() => setRate(0.75)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                      rate === 0.75
                        ? 'bg-[#059669] text-white border-transparent'
                        : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <Turtle className="w-3.5 h-3.5" />
                    0.75×
                  </button>
                </div>
              )}
            </div>

            {/* Transcript Toggle */}
            <button
              id="btn-toggle-transcript"
              type="button"
              disabled={!transcriptUnlocked}
              onClick={() => setShowTranscript((s) => !s)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {!transcriptUnlocked ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Transcript Locked (Exam Mode)</span>
                </>
              ) : showTranscript ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Transcript</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show Transcript</span>
                </>
              )}
            </button>
          </div>

          {/* Live Playback Progress Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
              <span className="inline-flex items-center gap-1.5">
                <Headphones className={`w-3.5 h-3.5 ${isPlaying ? 'text-[#2563EB] animate-pulse' : ''}`} />
                {isPlaying && activeLineIdx !== null
                  ? `Speaking: ${exam.transcript[activeLineIdx]?.speaker} (Turn ${activeLineIdx + 1}/${exam.transcript.length})`
                  : `${exam.transcript.length} audio segments · Web Speech de-DE`}
              </span>
              {!canPlayAgain && !isPlaying && (
                <span className="text-[#D97706] font-semibold">
                  Exam listens used — switch to Practice Mode to replay
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden">
              <div
                className="h-full bg-[#2563EB] transition-all duration-300"
                style={{
                  width:
                    isPlaying && activeLineIdx !== null
                      ? `${((activeLineIdx + 1) / exam.transcript.length) * 100}%`
                      : playsUsed > 0
                        ? '100%'
                        : '0%',
                }}
              />
            </div>
          </div>

          {/* Transcript Drawer (when unlocked & visible) */}
          {transcriptUnlocked && showTranscript && (
            <div
              id="listening-transcript-box"
              className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 space-y-3 animate-slide-up"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Hörtext / Transkript
                </span>
                <button
                  type="button"
                  onClick={() => setShowEnglish((e) => !e)}
                  className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
                >
                  {showEnglish ? 'Hide English Translation' : 'Show English Translation'}
                </button>
              </div>
              <div className="space-y-2.5">
                {exam.transcript.map((line, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border transition-colors ${
                      activeLineIdx === i
                        ? 'border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-well)]/40'
                    }`}
                  >
                    <p className="font-mono text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA] mb-0.5">
                      {line.speaker}
                    </p>
                    <p className="text-sm text-[var(--ink-primary)] leading-relaxed">
                      {line.text}
                    </p>
                    {showEnglish && (
                      <p className="text-xs text-[var(--ink-muted)] mt-1 italic">
                        {line.english}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Key Exam Vocabulary */}
              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2">
                  Key Exam Vocabulary
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {exam.keyVocabulary.map((v) => (
                    <span
                      key={v.german}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-well)] border border-[var(--border-subtle)] text-[var(--ink-primary)]"
                    >
                      <strong>{v.german}</strong> — {v.english}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Post-Submission Result Banner */}
      {submitted && (
        <section
          id="listening-exam-result"
          className={`rounded-3xl p-5 sm:p-6 border-2 animate-pop-in ${
            passed
              ? 'bg-emerald-50/90 dark:bg-emerald-950/45 border-emerald-300 dark:border-emerald-700'
              : 'bg-amber-50/95 dark:bg-amber-950/45 border-amber-300 dark:border-amber-700'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-extrabold text-lg ${
                  passed
                    ? 'bg-[#059669] text-white'
                    : 'bg-[#D97706] text-white'
                }`}
              >
                {scorePct}%
              </div>
              <div>
                <p className="font-display font-extrabold text-xl text-[var(--ink-primary)] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#059669]" />
                  <span>
                    {passed ? 'Bestanden! (Passed ≥ 60%)' : 'Noch nicht bestanden (< 60%)'}
                  </span>
                </p>
                <p className="text-sm text-[var(--ink-secondary)]">
                  {correctCount} of {exam.questions.length} exam items correct · Official pass threshold is 60%. Review the transcript evidence below!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </button>
          </div>
        </section>
      )}

      {/* Official Question Sheet */}
      <section className="space-y-4">
        {exam.questions.map((q, qIdx) => {
          const picked = answers[q.id];
          const isRight = submitted && picked === q.correctIndex;

          return (
            <article
              key={q.id}
              id={`listening-q-${qIdx + 1}`}
              className="paper-card rounded-2xl p-5 space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-[var(--bg-well)] text-[var(--ink-primary)] shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <h2 className="font-display font-bold text-base sm:text-lg text-[var(--ink-primary)] leading-snug">
                    {q.prompt}
                  </h2>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-muted)] shrink-0">
                  {q.format === 'rf' ? 'Richtig / Falsch' : 'a / b / c'}
                </span>
              </div>

              <div
                className={`grid gap-2.5 ${
                  q.format === 'rf' ? 'grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {q.options.map((opt, optIdx) => {
                  const selected = picked === optIdx;
                  const correctOpt = optIdx === q.correctIndex;

                  let style =
                    'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-primary)] hover:border-[#2563EB]';
                  if (!submitted && selected) {
                    style =
                      'border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/45 text-[#1D4ED8] dark:text-blue-200';
                  } else if (submitted) {
                    if (correctOpt) {
                      style =
                        'border-[#059669] bg-emerald-50 dark:bg-emerald-950/45 text-[#047857] dark:text-emerald-200';
                    } else if (selected) {
                      style =
                        'border-[#E11D48] bg-rose-50 dark:bg-rose-950/45 text-[#BE123C] dark:text-rose-200';
                    } else {
                      style = 'border-[var(--border-subtle)] opacity-55';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      id={`listening-q-${qIdx + 1}-opt-${optIdx + 1}`}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${style}`}
                    >
                      <span>{opt}</span>
                      {submitted && correctOpt && (
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                      )}
                      {submitted && selected && !correctOpt && (
                        <XCircle className="w-4 h-4 text-[#E11D48] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Post-Submission Evidence Box */}
              {submitted && (
                <div className="rounded-xl p-3.5 bg-[var(--bg-well)] border border-[var(--border-subtle)] space-y-1 animate-slide-up">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--ink-primary)]">
                    <Lightbulb
                      className={`w-3.5 h-3.5 ${isRight ? 'text-[#059669]' : 'text-[#D97706]'}`}
                    />
                    <span>Transcript Evidence:</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)]">
                    {q.evidenceQuote}
                  </p>
                  <p className="text-xs text-[var(--ink-secondary)]">{q.explanation}</p>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Submit Bar */}
      {!submitted && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-[var(--ink-muted)] font-mono">
            Answered {Object.keys(answers).length} / {exam.questions.length} items
          </p>
          <button
            id="btn-submit-listening-exam"
            type="button"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#059669] text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit & Grade Hören Test</span>
          </button>
        </div>
      )}
    </div>
  );
}
