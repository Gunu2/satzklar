import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lightbulb,
  Loader2,
  Sparkles,
  Stethoscope,
  Wand2,
} from 'lucide-react';
import type { SentenceAnalysisResult } from '../../types/grammar';
import {
  analyzeSentenceLocally,
  analyzeSentenceWithGemini,
} from '../../utils/sentenceDoctor';
import { AudioButton } from '../drill/AudioButton';

interface SentenceDoctorViewProps {
  hasGeminiKey: boolean;
  geminiApiKey: string;
  onOpenSettings: () => void;
}

const SAMPLE_SENTENCES = [
  {
    label: 'Dative + Lowercase Noun',
    text: 'Ich fahre mit der bus zur arbeit.',
  },
  {
    label: 'V2 Inversion + Perfekt',
    text: 'Heute ich habe nach Berlin gefahren.',
  },
  {
    label: 'Subordinate Clause (weil)',
    text: 'Ich bleibe zu Hause weil ich habe keine Zeit.',
  },
  {
    label: 'Accusative Preposition',
    text: 'Das Geschenk ist für dem Freund.',
  },
];

export function SentenceDoctorView({
  hasGeminiKey,
  geminiApiKey,
  onOpenSettings,
}: SentenceDoctorViewProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorNote, setErrorNote] = useState<string | null>(null);
  const [result, setResult] = useState<SentenceAnalysisResult | null>(null);

  const handleAnalyze = async (textOverride?: string) => {
    const targetText = (textOverride ?? input).trim();
    if (!targetText) return;

    setErrorNote(null);

    if (hasGeminiKey && geminiApiKey) {
      setLoading(true);
      try {
        const aiResult = await analyzeSentenceWithGemini(targetText, geminiApiKey);
        setResult(aiResult);
        setLoading(false);
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gemini request failed';
        setErrorNote(
          `Gemini API unavailable (${msg}) — showing instant offline heuristic check instead.`
        );
      } finally {
        setLoading(false);
      }
    }

    setResult(analyzeSentenceLocally(targetText));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-4 h-4 text-[#2563EB]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
              {hasGeminiKey ? 'Gemini AI + Offline Engine' : 'Zero-Key Offline Heuristic Engine'}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--ink-primary)]">
            German Sentence Doctor
          </h1>
          <p className="text-sm text-[var(--ink-secondary)] mt-1">
            Write any German sentence for instant case, preposition, capitalization, and word-order diagnostics.
          </p>
        </div>

        <button
          id="btn-doctor-byok"
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#D97706]" />
          <span>{hasGeminiKey ? 'Manage Gemini Key' : 'Unlock Gemini AI (BYOK)'}</span>
        </button>
      </div>

      {/* Input Card */}
      <div className="paper-card rounded-3xl p-5 sm:p-6 space-y-4">
        <label
          htmlFor="sentence-doctor-input"
          className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)]"
        >
          Your German Sentence
        </label>
        <textarea
          id="sentence-doctor-input"
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              void handleAnalyze();
            }
          }}
          placeholder="e.g., Heute ich fahre mit der Bus, weil ich habe keine Zeit..."
          className="w-full rounded-2xl p-4 bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-base sm:text-lg font-medium text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] resize-none"
        />

        {/* Sample Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[var(--ink-muted)]">Try an example:</span>
          {SAMPLE_SENTENCES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => {
                setInput(s.text);
                void handleAnalyze(s.text);
              }}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-well)] border border-[var(--border-subtle)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
          <span className="text-xs text-[var(--ink-muted)]">
            {hasGeminiKey
              ? 'Using your local Gemini API key for deep grammar + B1/B2 rewrites.'
              : 'Works 100% offline with built-in German grammar rules. No API key required.'}
          </span>
          <button
            id="btn-analyze-sentence"
            type="button"
            disabled={!input.trim() || loading}
            onClick={() => void handleAnalyze()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-45 transition-colors cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Check Sentence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorNote && (
        <div className="rounded-xl p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-[#B45309] dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNote}</span>
        </div>
      )}

      {/* Analysis Result */}
      {result && (
        <div id="sentence-doctor-result" className="space-y-4 animate-slide-up">
          {/* Corrected Sentence Card */}
          <div className="paper-elevated rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {result.issues.length === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                ) : (
                  <Sparkles className="w-5 h-5 text-[#2563EB]" />
                )}
                <h2 className="font-display font-bold text-base text-[var(--ink-primary)]">
                  {result.issues.length === 0
                    ? 'Clean Sentence!'
                    : `Suggested Correction (${result.issues.length} ${
                        result.issues.length === 1 ? 'finding' : 'findings'
                      })`}
                </h2>
              </div>
              <AudioButton text={result.corrected} compact />
            </div>

            <p className="font-display text-xl sm:text-2xl font-bold text-[#047857] dark:text-emerald-300 leading-snug mb-2">
              {result.corrected}
            </p>

            {result.praise && (
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                {result.praise}
              </p>
            )}
          </div>

          {/* Issue Rule Pills */}
          {result.issues.length > 0 && (
            <div className="space-y-2.5">
              {result.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="paper-card rounded-2xl p-4 flex items-start gap-3"
                >
                  <Lightbulb
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      issue.severity === 'error'
                        ? 'text-[#E11D48]'
                        : issue.severity === 'warning'
                          ? 'text-[#D97706]'
                          : 'text-[#2563EB]'
                    }`}
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-primary)]">
                        {issue.category}
                      </span>
                      <span className="font-mono text-xs line-through text-[#E11D48]">
                        {issue.fragment}
                      </span>
                      <span className="text-xs text-[var(--ink-muted)]">→</span>
                      <span className="font-mono text-xs font-bold text-[#059669]">
                        {issue.suggestion}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                      {issue.rulePill}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Optional Gemini B1 / B2 Natural Rewrites */}
          {(result.b1Rewrite || result.b2Rewrite) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {result.b1Rewrite && (
                <div className="paper-card rounded-2xl p-4 space-y-2">
                  <span className="font-mono text-xs font-bold text-[#D97706]">
                    Natural B1 Rewrite
                  </span>
                  <p className="font-semibold text-sm text-[var(--ink-primary)]">
                    {result.b1Rewrite}
                  </p>
                  <AudioButton text={result.b1Rewrite} compact />
                </div>
              )}
              {result.b2Rewrite && (
                <div className="paper-card rounded-2xl p-4 space-y-2">
                  <span className="font-mono text-xs font-bold text-[#E11D48]">
                    Polished B2 Rewrite
                  </span>
                  <p className="font-semibold text-sm text-[var(--ink-primary)]">
                    {result.b2Rewrite}
                  </p>
                  <AudioButton text={result.b2Rewrite} compact />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
