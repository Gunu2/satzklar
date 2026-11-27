import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Database,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
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
import {
  loadSupabaseConnection,
  saveSupabaseConnection,
} from '../../utils/chatBackend';

const OWNER_SESSION_KEY = 'satzklar_owner_panel_unlocked_v1';

function detectInitialOwnerAccess(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('owner') === 'satzklar') {
      window.sessionStorage.setItem(OWNER_SESSION_KEY, 'true');
      return true;
    }
    return window.sessionStorage.getItem(OWNER_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

interface SettingsModalProps {
  open: boolean;
  progress: UserProgress;
  geminiApiKey: string;
  onSaveGeminiKey: (key: string) => void;
  onSupabaseUpdated?: () => void;
  onImportProgress: (imported: UserProgress) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export function SettingsModal({
  open,
  progress,
  geminiApiKey,
  onSaveGeminiKey,
  onSupabaseUpdated,
  onImportProgress,
  onResetProgress,
  onClose,
}: SettingsModalProps) {
  const initialSb = loadSupabaseConnection();
  const [ownerUnlocked, setOwnerUnlocked] = useState<boolean>(() =>
    detectInitialOwnerAccess()
  );
  const [titleTaps, setTitleTaps] = useState(0);

  const [keyInput, setKeyInput] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [keySavedFlash, setKeySavedFlash] = useState(false);
  const [sbUrlInput, setSbUrlInput] = useState(initialSb.url);
  const [sbKeyInput, setSbKeyInput] = useState(initialSb.anonKey);
  const [sbSavedFlash, setSbSavedFlash] = useState(false);
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

  const handleTitleTap = () => {
    if (ownerUnlocked) return;
    const next = titleTaps + 1;
    if (next >= 5) {
      setOwnerUnlocked(true);
      setTitleTaps(0);
      try {
        window.sessionStorage.setItem(OWNER_SESSION_KEY, 'true');
      } catch {
        // Ignore
      }
    } else {
      setTitleTaps(next);
    }
  };

  const handleLockOwnerPanel = () => {
    setOwnerUnlocked(false);
    try {
      window.sessionStorage.removeItem(OWNER_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  const handleSaveKey = () => {
    onSaveGeminiKey(keyInput.trim());
    setKeySavedFlash(true);
    window.setTimeout(() => setKeySavedFlash(false), 1800);
  };

  const handleSaveSupabase = () => {
    saveSupabaseConnection(sbUrlInput, sbKeyInput);
    onSupabaseUpdated?.();
    setSbSavedFlash(true);
    window.setTimeout(() => setSbSavedFlash(false), 1800);
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
      aria-label="SatzKlar Progress & Backup"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="paper-elevated w-full max-w-lg rounded-2xl overflow-hidden animate-pop-in">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2
            id="settings-modal-title"
            onClick={handleTitleTap}
            className="font-display font-extrabold text-lg text-[var(--ink-primary)] select-none"
          >
            Progress &amp; Backup
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
          {/* JSON Export / Import (Clean learner-facing backup) */}
          <section className="space-y-3">
            <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">
              Save &amp; Restore Learning Progress
            </h3>
            <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
              Your XP, daily streak, completed lessons, Mistake Vault, and A1–B2 Wortschatz memorization are saved automatically in this browser. Export a backup file anytime to transfer your progress to another phone or laptop.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="btn-export-json"
                type="button"
                onClick={handleExport}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-well)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#2563EB]" />
                <span>Export Backup</span>
              </button>

              <button
                id="btn-import-json"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-well)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#059669]" />
                <span>Restore Backup</span>
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
                Clears XP, mastery rings, and Mistake Vault on this device.
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

          {/* OWNER-ONLY HIDDEN ADMIN PANEL (Invisible to regular visitors!) */}
          {ownerUnlocked && (
            <div
              id="owner-admin-panel"
              className="pt-5 border-t-2 border-dashed border-[var(--border-strong)] space-y-5 animate-pop-in"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#D97706]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Owner Admin Settings (Hidden from Users)</span>
                </span>
                <button
                  id="btn-lock-owner-panel"
                  type="button"
                  onClick={handleLockOwnerPanel}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-well)] text-[11px] font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                >
                  Hide Admin
                </button>
              </div>

              {/* Owner Gemini API Key */}
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#D97706]" />
                  <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--ink-primary)]">
                    Gemini API Key (AI Sentence Doctor)
                  </h3>
                </div>
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
                  Stored strictly in your browser’s localStorage.
                </p>
              </section>

              {/* Owner Supabase DB Override */}
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="font-display font-bold text-xs sm:text-sm text-[var(--ink-primary)]">
                    Supabase Backend Connection
                  </h3>
                </div>
                <div className="space-y-2">
                  <input
                    id="input-supabase-url"
                    type="url"
                    value={sbUrlInput}
                    onChange={(e) => setSbUrlInput(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none font-mono text-xs text-[var(--ink-primary)]"
                  />
                  <div className="flex gap-2">
                    <input
                      id="input-supabase-key"
                      type="password"
                      value={sbKeyInput}
                      onChange={(e) => setSbKeyInput(e.target.value)}
                      placeholder="Publishable / anon key"
                      className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none font-mono text-xs text-[var(--ink-primary)]"
                    />
                    <button
                      id="btn-save-supabase"
                      type="button"
                      onClick={handleSaveSupabase}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold cursor-pointer shrink-0"
                    >
                      {sbSavedFlash ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
