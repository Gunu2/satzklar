import { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Coffee,
  Copy,
  ExternalLink,
  Heart,
  Send,
  Star,
  X,
} from 'lucide-react';
import { COMMUNITY_CONFIG } from '../../config/community';
import { isSupabaseConfigured, loadSupabaseConnection } from '../../utils/chatBackend';
import { moderateChatMessage } from '../../utils/chatModeration';

const RATING_STORAGE_KEY = 'satzklar_user_site_rating_v1';

interface SavedRating {
  stars: number;
  note: string;
  ratedAt: string;
}

interface CommunityRatingStats {
  avg: number;
  count: number;
}

function loadSavedRating(): SavedRating | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(RATING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedRating;
  } catch {
    return null;
  }
}

export function StudioFooter() {
  const [savedRating, setSavedRating] = useState<SavedRating | null>(() => loadSavedRating());
  const [hoverStar, setHoverStar] = useState<number>(0);
  const [selectedStar, setSelectedStar] = useState<number>(() => savedRating?.stars ?? 0);
  const [showRateBox, setShowRateBox] = useState(false);
  const [noteInput, setNoteInput] = useState<string>(() => savedRating?.note ?? '');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [thankYouFlash, setThankYouFlash] = useState(false);
  const [stats, setStats] = useState<CommunityRatingStats | null>(null);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [copiedTipId, setCopiedTipId] = useState<string | null>(null);

  // Optionally fetch aggregate community rating from Supabase if `site_ratings` table exists
  useEffect(() => {
    const conn = loadSupabaseConnection();
    if (!isSupabaseConfigured(conn)) return;

    let cancelled = false;
    const headers: Record<string, string> = { apikey: conn.anonKey };
    if (conn.anonKey.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${conn.anonKey}`;
    }

    fetch(`${conn.url}/rest/v1/site_ratings?select=stars&limit=500`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((rows: Array<{ stars: number }> | null) => {
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        const valid = rows.filter((r) => typeof r.stars === 'number' && r.stars >= 1 && r.stars <= 5);
        if (valid.length === 0) return;
        const avg = valid.reduce((sum, r) => sum + r.stars, 0) / valid.length;
        setStats({ avg: Math.round(avg * 10) / 10, count: valid.length });
      })
      .catch(() => {
        // Silently ignore if table not created yet
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleStarClick = (star: number) => {
    setSelectedStar(star);
    setShowRateBox(true);
    setNoteError(null);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStar < 1 || selectedStar > 5) return;
    setNoteError(null);

    const trimmedNote = noteInput.trim();
    if (trimmedNote) {
      const mod = moderateChatMessage(trimmedNote);
      if (!mod.allowed) {
        setNoteError(mod.reason ?? 'Please keep your review kind and link-free.');
        return;
      }
    }

    const record: SavedRating = {
      stars: selectedStar,
      note: trimmedNote,
      ratedAt: new Date().toISOString(),
    };
    setSavedRating(record);
    try {
      window.localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Ignore storage error
    }

    // Best-effort sync to Supabase `site_ratings` if configured
    const conn = loadSupabaseConnection();
    if (isSupabaseConfigured(conn)) {
      const headers: Record<string, string> = {
        apikey: conn.anonKey,
        'Content-Type': 'application/json',
      };
      if (conn.anonKey.startsWith('eyJ')) {
        headers.Authorization = `Bearer ${conn.anonKey}`;
      }
      fetch(`${conn.url}/rest/v1/site_ratings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          stars: selectedStar,
          note: trimmedNote.slice(0, 240),
        }),
      }).catch(() => {
        // Ignore gracefully if optional table hasn't been added yet
      });
    }

    setShowRateBox(false);
    setThankYouFlash(true);
    window.setTimeout(() => setThankYouFlash(false), 3500);
  };

  const displayStars = hoverStar || selectedStar || savedRating?.stars || 0;

  return (
    <footer
      id="studio-footer"
      className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/70 py-6 px-4 sm:px-6 mt-10"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Friendly Tagline */}
        <div className="text-center md:text-left">
          <p className="font-display font-bold text-sm text-[var(--ink-primary)]">
            SatzKlar <span className="font-normal text-[var(--ink-muted)]">· satzklar.my.id</span>
          </p>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            Learn German visually from A1 to B2 — made with care for learners worldwide.
          </p>
        </div>

        {/* Interactive Star Rating Widget */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--ink-secondary)]">
              {savedRating ? 'Your Rating:' : 'Rate this site:'}
            </span>
            <div
              className="inline-flex items-center gap-0.5"
              onMouseLeave={() => setHoverStar(0)}
              role="radiogroup"
              aria-label="Rate SatzKlar from 1 to 5 stars"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= displayStars;
                return (
                  <button
                    key={star}
                    id={`footer-star-${star}`}
                    type="button"
                    onMouseEnter={() => setHoverStar(star)}
                    onClick={() => handleStarClick(star)}
                    aria-label={`Rate ${star} out of 5 stars`}
                    className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        filled
                          ? 'text-[#D97706] fill-[#F59E0B]'
                          : 'text-[var(--border-strong)] hover:text-[#D97706]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {stats && (
              <span className="font-mono text-[11px] font-bold text-[var(--ink-muted)]">
                {stats.avg.toFixed(1)} ({stats.count})
              </span>
            )}
          </div>

          {thankYouFlash && (
            <p
              id="footer-rating-thanks"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] animate-pop-in"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Danke! Thank you for rating SatzKlar {savedRating?.stars}★!</span>
            </p>
          )}
        </div>

        {/* Give a Tip / Support Creator CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-footer-give-tip"
            type="button"
            onClick={() => setTipModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Coffee className="w-4 h-4 text-[#F59E0B]" />
            <span>Give a Tip</span>
            <Heart className="w-3.5 h-3.5 text-[#E11D48] fill-current" />
          </button>
        </div>
      </div>

      {/* Rating Review Popover Modal */}
      {showRateBox && (
        <div
          id="rating-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Rate SatzKlar"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRateBox(false);
          }}
        >
          <form
            onSubmit={(e) => void handleSubmitRating(e)}
            className="paper-elevated w-full max-w-sm rounded-2xl p-5 space-y-4 animate-pop-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
                Rate SatzKlar
              </h3>
              <button
                type="button"
                onClick={() => setShowRateBox(false)}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedStar(star)}
                  className="p-1 cursor-pointer hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= selectedStar
                        ? 'text-[#D97706] fill-[#F59E0B]'
                        : 'text-[var(--border-strong)]'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label
                htmlFor="input-rating-note"
                className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1"
              >
                Short feedback or wish list (optional)
              </label>
              <textarea
                id="input-rating-note"
                rows={3}
                maxLength={240}
                value={noteInput}
                onChange={(e) => {
                  setNoteInput(e.target.value);
                  if (noteError) setNoteError(null);
                }}
                placeholder="e.g., Love the color-coded articles & 3-month Wortschatz goal!"
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-xs sm:text-sm text-[var(--ink-primary)] resize-none"
              />
              {noteError && (
                <p className="text-xs text-[#E11D48] font-medium mt-1">{noteError}</p>
              )}
            </div>

            <button
              id="btn-submit-rating"
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit {selectedStar}★ Rating</span>
            </button>
          </form>
        </div>
      )}

      {/* Give a Tip / Creator Support Modal */}
      {tipModalOpen && (
        <div
          id="tip-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Support SatzKlar"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTipModalOpen(false);
          }}
        >
          <div className="paper-elevated w-full max-w-md rounded-2xl p-5 sm:p-6 space-y-4 animate-pop-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#D97706] flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display font-extrabold text-base text-[var(--ink-primary)]">
                    Support SatzKlar
                  </h3>
                  <p className="text-xs text-[var(--ink-muted)]">
                    100% free German learning for everyone
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTipModalOpen(false)}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
              Enjoying SatzKlar? Every coffee tip helps keep the domain, global chat room, and Goethe/ÖSD mock exams free and ad-free for learners around the world!
            </p>

            <div className="space-y-3">
              {COMMUNITY_CONFIG.tipLinks.map((tip) => {
                const isCopied = copiedTipId === tip.id;
                return (
                  <div
                    key={tip.id}
                    className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-well)]/60 space-y-2.5"
                  >
                    <div>
                      <span className="block font-display font-bold text-sm text-[var(--ink-primary)]">
                        {tip.label}
                      </span>
                      <span className="block text-[11px] text-[var(--ink-muted)]">
                        {tip.note}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                      <code
                        translate="no"
                        className="notranslate font-mono text-xs sm:text-sm font-bold text-[var(--ink-primary)] select-all truncate"
                      >
                        {tip.copyValue}
                      </code>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          id={`btn-copy-tip-${tip.id}`}
                          type="button"
                          onClick={() => {
                            void navigator.clipboard?.writeText(tip.copyValue);
                            setCopiedTipId(tip.id);
                            window.setTimeout(() => setCopiedTipId(null), 2200);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isCopied
                              ? 'bg-[#059669] text-white'
                              : 'bg-[#D97706] text-white hover:bg-amber-700'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {tip.url && (
                          <a
                            href={tip.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open PayPal"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-well)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
