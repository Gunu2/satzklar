import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Eye,
  EyeOff,
  FileAudio,
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
import type { FullListeningPaper, ListeningClip } from '../../types/fullExam';
import {
  playListeningTrack,
  type TranscriptPlaybackController,
} from '../../utils/examAudio';

interface FullListeningExamPlayerProps {
  paper: FullListeningPaper;
  onComplete: (scorePct: number, xpEarned: number) => void;
  onExit: () => void;
}

export function FullListeningExamPlayer({
  paper,
  onComplete,
  onExit,
}: FullListeningExamPlayerProps) {
  const [mode, setMode] = useState<'exam' | 'practice'>('exam');
  const [activePartIdx, setActivePartIdx] = useState(0);
  const [rate, setRate] = useState<0.75 | 1.0>(1.0);

  const [playsByClip, setPlaysByClip] = useState<Record<string, number>>({});
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
  const [openTranscriptClipId, setOpenTranscriptClipId] = useState<string | null>(null);
  const [showEnglish, setShowEnglish] = useState(false);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(paper.durationMinutes * 60);

  // Optional local MP3 player for learners who have official Goethe/ÖSD CD tracks locally
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controllerRef = useRef<TranscriptPlaybackController | null>(null);

  const stopAudio = () => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setPlayingClipId(null);
    setActiveLineIdx(null);
  };

  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    };
  }, [customAudioUrl]);

  useEffect(() => {
    if (submitted) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [submitted]);

  const currentSection = paper.sections[activePartIdx];
  const allItems = paper.sections.flatMap((s) => s.items);
  const answeredCount = Object.keys(answers).length;
  const correctCount = allItems.filter(
    (item) => answers[item.number] === item.correctIndex
  ).length;
  const scorePct = Math.round((correctCount / allItems.length) * 100);
  const passed = scorePct >= paper.passThreshold;

  const handleTogglePlayClip = (clip: ListeningClip, maxPlays: 1 | 2) => {
    if (playingClipId === clip.id) {
      stopAudio();
      return;
    }

    stopAudio();
    const used = playsByClip[clip.id] ?? 0;
    const canPlay = mode === 'practice' || submitted || used < maxPlays;
    if (!canPlay) return;

    if (mode === 'exam' && !submitted) {
      setPlaysByClip((prev) => ({ ...prev, [clip.id]: used + 1 }));
    }

    const effectiveRate = mode === 'exam' && !submitted ? 1.0 : rate;
    setPlayingClipId(clip.id);

    controllerRef.current = playListeningTrack(clip.lines, effectiveRate, {
      onLineStart: (idx) => setActiveLineIdx(idx),
      onComplete: () => {
        setPlayingClipId(null);
        setActiveLineIdx(null);
        controllerRef.current = null;
      },
    });
  };

  const handlePickAnswer = (itemNumber: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [itemNumber]: optIdx }));
  };

  const handleSubmitExam = () => {
    if (submitted) return;
    stopAudio();
    setSubmitted(true);
    const xp = passed ? 120 : 50;
    onComplete(scorePct, xp);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    stopAudio();
    setPlaysByClip({});
    setAnswers({});
    setSubmitted(false);
    setOpenTranscriptClipId(null);
    setActivePartIdx(0);
    setSecondsLeft(paper.durationMinutes * 60);
  };

  const handleLoadLocalMp3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    setCustomAudioUrl(URL.createObjectURL(file));
    setCustomAudioName(file.name);
    e.target.value = '';
  };

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const transcriptUnlocked = mode === 'practice' || submitted;

  return (
    <div id="full-listening-exam-player" className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Official Exam-Hall Top Header Strip */}
      <div
        className="paper-elevated rounded-2xl overflow-hidden"
        style={{ borderTop: `4px solid ${paper.badgeColor}` }}
      >
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="btn-exit-full-listening"
              type="button"
              onClick={() => {
                stopAudio();
                onExit();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-well)]/70 text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exam Studio</span>
            </button>
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                Kandidatenblätter · {paper.institute} {paper.cefr} · {paper.totalItems} Aufgaben
              </p>
              <h1 className="font-display font-extrabold text-base sm:text-xl text-[var(--ink-primary)]">
                {paper.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]">
              <button
                id="btn-full-mode-exam"
                type="button"
                onClick={() => {
                  setMode('exam');
                  if (!submitted) setOpenTranscriptClipId(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'exam'
                    ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                }`}
              >
                Exam Mode
              </button>
              <button
                id="btn-full-mode-practice"
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

            {/* Optional Local MP3 Loader */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Optionally play your own local Goethe/ÖSD MP3 track"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
            >
              <FileAudio className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="hidden sm:inline">Load MP3</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleLoadLocalMp3}
            />

            {/* Countdown Clock */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] font-mono text-xs font-extrabold text-[var(--ink-primary)]">
              <Timer className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="tabular-nums">{formatClock(secondsLeft)}</span>
            </div>
          </div>
        </div>

        {/* Optional Local MP3 Player Strip */}
        {customAudioUrl && (
          <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-well)]/70 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold text-[var(--ink-primary)] truncate">
              Local Audio: {customAudioName}
            </span>
            <audio controls src={customAudioUrl} className="h-8 max-w-full" />
          </div>
        )}

        {/* 4-Teil Navigation Stepper */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-well)]/50 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {paper.sections.map((sec, idx) => {
            const secAnswered = sec.items.filter(
              (it) => answers[it.number] !== undefined
            ).length;
            const active = activePartIdx === idx;
            return (
              <button
                key={sec.partNumber}
                id={`btn-hoeren-teil-${sec.partNumber}`}
                type="button"
                onClick={() => {
                  stopAudio();
                  setActivePartIdx(idx);
                }}
                className={`text-left px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--bg-surface)] border-[#2563EB] shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-[var(--bg-surface)]/70'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display font-bold text-xs sm:text-sm text-[var(--ink-primary)]">
                    {sec.title}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[var(--ink-muted)]">
                    {secAnswered}/{sec.items.length}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-[var(--ink-muted)] truncate mt-0.5">
                  {sec.playsAllowed}× hören · Items {sec.items[0].number}–
                  {sec.items[sec.items.length - 1].number}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Post-Submission Official Certificate Score Card */}
      {submitted && (
        <section
          id="full-listening-certificate"
          className={`rounded-3xl p-6 border-2 animate-pop-in ${
            passed
              ? 'bg-emerald-50/90 dark:bg-emerald-950/45 border-emerald-300 dark:border-emerald-700'
              : 'bg-amber-50/95 dark:bg-amber-950/45 border-amber-300 dark:border-amber-700'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-white shadow-sm ${
                  passed ? 'bg-[#059669]' : 'bg-[#D97706]'
                }`}
              >
                <span className="text-xl leading-none">{scorePct}</span>
                <span className="text-[10px] opacity-90">/100</span>
              </div>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Prüfungsergebnis · {paper.institute} {paper.cefr} Hören
                </p>
                <h2 className="font-display text-2xl font-extrabold text-[var(--ink-primary)] flex items-center gap-2">
                  <Award className={`w-6 h-6 ${passed ? 'text-[#059669]' : 'text-[#D97706]'}`} />
                  <span>
                    {passed ? 'Bestanden! (≥ 60 Punkte)' : 'Noch nicht bestanden (< 60)'}
                  </span>
                </h2>
                <p className="text-sm text-[var(--ink-secondary)]">
                  Raw score: <strong className="font-mono">{correctCount} / {allItems.length}</strong> items correct · All transcripts & evidence quotes are now unlocked below.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Full Paper</span>
            </button>
          </div>

          {/* Per-Teil Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {paper.sections.map((sec, idx) => {
              const secRight = sec.items.filter(
                (it) => answers[it.number] === it.correctIndex
              ).length;
              return (
                <button
                  key={sec.partNumber}
                  type="button"
                  onClick={() => setActivePartIdx(idx)}
                  className="text-left p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#2563EB] cursor-pointer"
                >
                  <p className="font-mono text-xs font-bold text-[var(--ink-muted)]">
                    {sec.title}
                  </p>
                  <p className="font-mono text-lg font-extrabold text-[var(--ink-primary)]">
                    {secRight} / {sec.items.length}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Layout: Active Exam Sheet (Left) + Live Antwortbogen (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-5">
          {/* Section Instructions Banner */}
          <div className="paper-card rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md text-white"
                  style={{ backgroundColor: paper.badgeColor }}
                >
                  {currentSection.title}
                </span>
                <span className="font-mono text-xs font-semibold text-[var(--ink-secondary)]">
                  {currentSection.subtitle}
                </span>
              </div>

              {(mode === 'practice' || submitted) && (
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRate(1.0)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-bold border cursor-pointer ${
                      rate === 1.0
                        ? 'bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 border-transparent'
                        : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <Volume2 className="w-3 h-3" /> 1.0×
                  </button>
                  <button
                    type="button"
                    onClick={() => setRate(0.75)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-bold border cursor-pointer ${
                      rate === 0.75
                        ? 'bg-[#059669] text-white border-transparent'
                        : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <Turtle className="w-3 h-3" /> 0.75×
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
              {currentSection.instructions}
            </p>
          </div>

          {/* Render Each Clip + Its Paired Exam Items */}
          {currentSection.clips.map((clip) => {
            const clipItems = currentSection.items.filter(
              (item) => item.clipId === clip.id
            );
            const used = playsByClip[clip.id] ?? 0;
            const isPlaying = playingClipId === clip.id;
            const canPlay =
              mode === 'practice' || submitted || used < currentSection.playsAllowed;
            const isTranscriptOpen = openTranscriptClipId === clip.id;

            const isMatrixSection =
              Boolean(currentSection.speakerColumns) &&
              clipItems.every((i) => i.format === 'speaker_matrix');

            return (
              <section key={clip.id} className="paper-card rounded-2xl overflow-hidden">
                {/* Per-Clip Audio Console */}
                <div className="p-4 sm:p-5 bg-[var(--bg-well)]/75 border-b border-[var(--border-subtle)] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display font-bold text-base text-[var(--ink-primary)]">
                        {clip.label}
                      </p>
                      <p className="text-xs text-[var(--ink-muted)]">{clip.intro}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        id={`btn-play-${clip.id}`}
                        type="button"
                        disabled={!isPlaying && !canPlay}
                        onClick={() =>
                          handleTogglePlayClip(clip, currentSection.playsAllowed)
                        }
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed shadow-xs ${
                          isPlaying
                            ? 'bg-[#E11D48] hover:bg-rose-700'
                            : 'bg-[#2563EB] hover:bg-blue-700'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{used === 0 ? 'Play Audio' : 'Replay'}</span>
                          </>
                        )}
                      </button>

                      {mode === 'exam' && !submitted && (
                        <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--ink-secondary)]">
                          {Math.max(0, currentSection.playsAllowed - used)}/
                          {currentSection.playsAllowed} left
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={!transcriptUnlocked}
                        onClick={() =>
                          setOpenTranscriptClipId(isTranscriptOpen ? null : clip.id)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {!transcriptUnlocked ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </>
                        ) : isTranscriptOpen ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hide Text</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Transkript</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Live Speaking Indicator */}
                  {isPlaying && activeLineIdx !== null && (
                    <div className="flex items-center gap-2 text-xs font-mono text-[#2563EB] dark:text-[#60A5FA]">
                      <Headphones className="w-3.5 h-3.5 animate-pulse" />
                      <span>
                        Speaking: {clip.lines[activeLineIdx]?.speaker} (Turn{' '}
                        {activeLineIdx + 1}/{clip.lines.length})
                      </span>
                    </div>
                  )}

                  {/* Transcript Box */}
                  {transcriptUnlocked && isTranscriptOpen && (
                    <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 space-y-2.5 animate-slide-up">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold uppercase text-[var(--ink-muted)]">
                          Transkription (DE)
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowEnglish((e) => !e)}
                          className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
                        >
                          {showEnglish ? 'Hide English' : 'Show English'}
                        </button>
                      </div>
                      {clip.lines.map((line, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-lg border text-xs sm:text-sm ${
                            isPlaying && activeLineIdx === i
                              ? 'border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-well)]/40'
                          }`}
                        >
                          <p className="font-mono text-[11px] font-bold text-[#2563EB] dark:text-[#60A5FA]">
                            {line.speaker}
                          </p>
                          <p className="text-[var(--ink-primary)] leading-relaxed mt-0.5">
                            {line.text}
                          </p>
                          {showEnglish && (
                            <p className="text-xs text-[var(--ink-muted)] italic mt-1">
                              {line.english}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Official Questions Area */}
                <div className="p-4 sm:p-5">
                  {isMatrixSection && currentSection.speakerColumns ? (
                    /* Official Goethe/ÖSD "Wer sagt was?" 3-Column Matrix */
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-[var(--border-subtle)]">
                            <th className="py-2.5 pr-3 text-xs font-mono font-bold uppercase text-[var(--ink-muted)]">
                              Aussage (Wer sagt was?)
                            </th>
                            {currentSection.speakerColumns.map((col, cIdx) => (
                              <th
                                key={col}
                                className="py-2.5 px-2 text-center text-xs font-display font-bold text-[var(--ink-primary)] whitespace-nowrap"
                              >
                                <span className="block font-mono text-[10px] text-[var(--ink-muted)]">
                                  [{String.fromCharCode(97 + cIdx)}]
                                </span>
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                          {clipItems.map((item) => {
                            const picked = answers[item.number];
                            return (
                              <tr key={item.number} className="align-top">
                                <td className="py-3.5 pr-3">
                                  <div className="flex items-start gap-2">
                                    <span className="font-mono text-xs font-extrabold text-[var(--ink-muted)] mt-0.5">
                                      {item.number}
                                    </span>
                                    <div className="space-y-1.5">
                                      <p className="text-sm font-medium text-[var(--ink-primary)] leading-snug">
                                        {item.prompt}
                                      </p>
                                      {submitted && (
                                        <p className="text-xs text-[var(--ink-secondary)] bg-[var(--bg-well)] p-2 rounded-lg">
                                          <strong className="text-[#059669]">
                                            {item.options[item.correctIndex]}:
                                          </strong>{' '}
                                          {item.evidenceQuote}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                {[0, 1, 2].map((colIdx) => {
                                  const selected = picked === colIdx;
                                  const isCorrect = colIdx === item.correctIndex;
                                  let boxStyle =
                                    'border-[var(--border-strong)] bg-[var(--bg-surface)] hover:border-[#2563EB]';
                                  if (!submitted && selected) {
                                    boxStyle =
                                      'border-[#2563EB] bg-[#2563EB] text-white';
                                  } else if (submitted) {
                                    if (isCorrect) {
                                      boxStyle =
                                        'border-[#059669] bg-[#059669] text-white';
                                    } else if (selected) {
                                      boxStyle =
                                        'border-[#E11D48] bg-[#E11D48] text-white';
                                    } else {
                                      boxStyle =
                                        'border-[var(--border-subtle)] opacity-35';
                                    }
                                  }
                                  return (
                                    <td
                                      key={colIdx}
                                      className="py-3.5 px-2 text-center"
                                    >
                                      <button
                                        id={`item-${item.number}-opt-${colIdx + 1}`}
                                        type="button"
                                        disabled={submitted}
                                        onClick={() =>
                                          handlePickAnswer(item.number, colIdx)
                                        }
                                        aria-label={`Item ${item.number}: ${item.options[colIdx]}`}
                                        className={`w-8 h-8 rounded-lg border-2 font-mono text-xs font-bold inline-flex items-center justify-center transition-all cursor-pointer disabled:cursor-default ${boxStyle}`}
                                      >
                                        {selected || (submitted && isCorrect)
                                          ? '✕'
                                          : String.fromCharCode(97 + colIdx)}
                                      </button>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Standard Richtig/Falsch & a/b/c Exam Items */
                    <div className="divide-y divide-[var(--border-subtle)]">
                      {clipItems.map((item) => {
                        const picked = answers[item.number];
                        const isRight = submitted && picked === item.correctIndex;
                        return (
                          <div key={item.number} className="py-4 first:pt-0 last:pb-0 space-y-3">
                            <div className="flex items-start gap-2.5">
                              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-primary)] shrink-0 mt-0.5">
                                {item.number}
                              </span>
                              <p className="font-display font-bold text-sm sm:text-base text-[var(--ink-primary)] leading-snug">
                                {item.prompt}
                              </p>
                            </div>

                            <div
                              className={`grid gap-2 ${
                                item.format === 'rf' ? 'grid-cols-2' : 'grid-cols-1'
                              }`}
                            >
                              {item.options.map((opt, optIdx) => {
                                const selected = picked === optIdx;
                                const isCorrect = optIdx === item.correctIndex;
                                let style =
                                  'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-primary)] hover:border-[#2563EB]';
                                if (!submitted && selected) {
                                  style =
                                    'border-[#2563EB] bg-blue-50/75 dark:bg-blue-950/45 text-[#1D4ED8] dark:text-blue-200';
                                } else if (submitted) {
                                  if (isCorrect) {
                                    style =
                                      'border-[#059669] bg-emerald-50 dark:bg-emerald-950/45 text-[#047857] dark:text-emerald-200';
                                  } else if (selected) {
                                    style =
                                      'border-[#E11D48] bg-rose-50 dark:bg-rose-950/45 text-[#BE123C] dark:text-rose-200';
                                  } else {
                                    style = 'border-[var(--border-subtle)] opacity-50';
                                  }
                                }
                                return (
                                  <button
                                    key={opt}
                                    id={`item-${item.number}-opt-${optIdx + 1}`}
                                    type="button"
                                    disabled={submitted}
                                    onClick={() =>
                                      handlePickAnswer(item.number, optIdx)
                                    }
                                    className={`text-left px-3.5 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${style}`}
                                  >
                                    <span>{opt}</span>
                                    {submitted && isCorrect && (
                                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                                    )}
                                    {submitted && selected && !isCorrect && (
                                      <XCircle className="w-4 h-4 text-[#E11D48] shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {submitted && (
                              <div className="rounded-xl p-3 bg-[var(--bg-well)] border border-[var(--border-subtle)] text-xs space-y-1">
                                <p className="font-semibold text-[var(--ink-primary)] flex items-center gap-1.5">
                                  <Lightbulb
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      isRight ? 'text-[#059669]' : 'text-[#D97706]'
                                    }`}
                                  />
                                  <span>{item.evidenceQuote}</span>
                                </p>
                                <p className="text-[var(--ink-secondary)]">
                                  {item.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {/* Next/Prev Teil Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={activePartIdx === 0}
              onClick={() => {
                stopAudio();
                setActivePartIdx((i) => Math.max(0, i - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] disabled:opacity-40 cursor-pointer disabled:cursor-default"
            >
              ← Previous Teil
            </button>
            {activePartIdx < paper.sections.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  stopAudio();
                  setActivePartIdx((i) => Math.min(paper.sections.length - 1, i + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Next: Teil {activePartIdx + 2} →
              </button>
            ) : (
              !submitted && (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="px-5 py-2.5 rounded-xl bg-[#059669] text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 cursor-pointer shadow-sm"
                >
                  Abgeben & Bewerten ({answeredCount}/{allItems.length})
                </button>
              )
            )}
          </div>
        </div>

        {/* Sticky Live Official Antwortbogen Sidebar (Items 1-30) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div id="live-antwortbogen" className="paper-elevated rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Antwortbogen (Live)
                </p>
                <h2 className="font-display font-bold text-base text-[var(--ink-primary)]">
                  {answeredCount} / {allItems.length} marked
                </h2>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-secondary)]">
                Pass ≥ 60%
              </span>
            </div>

            {/* 30-Item Bubble Grid Grouped by Teil */}
            <div className="space-y-3">
              {paper.sections.map((sec, sIdx) => (
                <div key={sec.partNumber} className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      stopAudio();
                      setActivePartIdx(sIdx);
                    }}
                    className="font-mono text-[11px] font-bold text-[var(--ink-secondary)] hover:text-[#2563EB] cursor-pointer"
                  >
                    {sec.title} ({sec.playsAllowed}× hören)
                  </button>
                  <div className="grid grid-cols-5 gap-1.5">
                    {sec.items.map((item) => {
                      const val = answers[item.number];
                      const isRight = submitted && val === item.correctIndex;
                      const isWrong = submitted && val !== item.correctIndex;
                      let cellStyle =
                        'border-[var(--border-subtle)] bg-[var(--bg-well)]/60 text-[var(--ink-muted)]';
                      if (!submitted && val !== undefined) {
                        cellStyle =
                          'border-[#2563EB] bg-[#2563EB]/15 text-[#1D4ED8] dark:text-[#60A5FA]';
                      } else if (isRight) {
                        cellStyle = 'border-[#059669] bg-[#059669] text-white';
                      } else if (isWrong) {
                        cellStyle = 'border-[#E11D48] bg-[#E11D48] text-white';
                      }

                      const mark =
                        val === undefined
                          ? ''
                          : item.format === 'rf'
                            ? val === 0
                              ? 'R'
                              : 'F'
                            : String.fromCharCode(97 + val);

                      return (
                        <button
                          key={item.number}
                          type="button"
                          onClick={() => {
                            stopAudio();
                            setActivePartIdx(sIdx);
                          }}
                          className={`h-9 rounded-lg border font-mono text-[11px] font-bold flex flex-col items-center justify-center leading-none transition-colors cursor-pointer ${cellStyle}`}
                        >
                          <span>{item.number}</span>
                          {mark && <span className="text-[9px] opacity-90 mt-0.5">{mark}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!submitted && (
              <button
                id="btn-submit-full-listening"
                type="button"
                onClick={handleSubmitExam}
                className="w-full py-2.5 rounded-xl bg-[#059669] text-white font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Abgeben & Bewerten</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
