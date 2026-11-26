import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import type { UserProgress } from '../../types/grammar';
import {
  exportProgressJSON,
  getTodayISO,
  parseImportedProgress,
} from '../../utils/storage';

interface SettingsModalProps {
  open: boolean;
  progress: UserProgress;
  geminiApiKey: string;
  onSaveGeminiKey: (key: string) => void;
  onImportProgress: (imported: UserProgress) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export function SettingsModal({
  open,
  progress,
  geminiApiKey,
  onSaveGeminiKey,
  onImportProgress,
  onResetProgress,
  onClose,
}: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [keySavedFlash, setKeySavedFlash] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSaveKey = () => {
    onSaveGeminiKey(keyInput.trim());
    setKeySavedFlash(true);
    window.setTimeout(() => setKeySavedFlash(false), 1800);
  };

  const handleExport = () => {
    const json = exportProgressJSON(progress);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satzklar-progress-${getTodayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = parseImportedProgress(text);
    if (res.ok && res.progress) {
      onImportProgress(res.progress);
      setImportStatus({
        type: 'success',
        text: `Restored backup (${res.progress.xp} XP, ${Object.keys(res.progress.lessonProgress).length} units).`,
      });
    } else {
      setImportStatus({
        type: 'error',
        text: res.error ?? 'Could not import file.',
      });
    }
    e.target.value = '';
  };

  return (
    <div
      id="settings-modal"
      role="dialog"
      aria-modal="true"
      aria-label="SatzKlar Settings & Data Portability"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="paper-elevated w-full max-w-lg rounded-2xl overflow-hidden animate-pop-in">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="font-display font-extrabold text-lg text-[var(--ink-primary)]">
            Studio Settings & Backup
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* BYOK Gemini API Key */}
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#D97706]" />
              <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">
                Optional Gemini API Key (AI Sentence Doctor)
              </h3>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              SatzKlar works 100% locally without any API key. Optionally paste a free Gemini API key to unlock deep grammar feedback and natural B1/B2 rewrites in the Sentence Doctor.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="input-gemini-key"
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none font-mono text-xs text-[var(--ink-primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                id="btn-save-gemini-key"
                type="button"
                onClick={handleSaveKey}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold cursor-pointer shrink-0"
              >
                {keySavedFlash ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
              Stored strictly in your browser’s localStorage — never sent anywhere except Google’s Gemini API when you check a sentence.
            </p>
          </section>

          {/* JSON Export / Import */}
          <section className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">
              Data Portability (JSON Backup)
            </h3>
            <p className="text-xs text-[var(--ink-secondary)]">
              Back up your XP, streak, unit mastery, and Mistake Vault or transfer progress to another browser.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-export-json"
                type="button"
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-well)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#2563EB]" />
                <span>Export JSON</span>
              </button>

              <button
                id="btn-import-json"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-well)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#059669]" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => void handleImportFile(e)}
              />
            </div>

            {importStatus && (
              <p
                className={`text-xs font-medium px-3 py-2 rounded-lg ${
                  importStatus.type === 'success'
                    ? 'bg-emerald-50 text-[#047857] dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-rose-50 text-[#BE123C] dark:bg-rose-950/50 dark:text-rose-300'
                }`}
              >
                {importStatus.text}
              </p>
            )}
          </section>

          {/* Danger Zone: Reset Progress */}
          <section className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">
                Reset Learning Progress
              </h3>
              <p className="text-xs text-[var(--ink-muted)]">
                Clears XP, mastery rings, and Mistake Vault locally.
              </p>
            </div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-semibold text-[#E11D48] hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--ink-secondary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-reset"
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#E11D48] text-white text-xs font-semibold cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
