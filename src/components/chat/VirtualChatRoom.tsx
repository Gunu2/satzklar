import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertOctagon,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Coffee,
  Flag,
  Globe,
  Hash,
  Heart,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  Radio,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import type { CEFRLevel, SentenceAnalysisResult } from '../../types/grammar';
import { COMMUNITY_CONFIG } from '../../config/community';
import { useLanguage } from '../../i18n/useLanguage';
import { analyzeSentenceLocally } from '../../utils/sentenceDoctor';
import { AudioButton } from '../drill/AudioButton';
import { PartyRoomView } from './PartyRoomView';
import {
  isValidEmail,
  loadBlockedUsers,
  loadReportedMessageIds,
  moderateChatMessage,
  saveBlockedUsers,
  saveReportedMessageIds,
  validateBio,
  validateNickname,
} from '../../utils/chatModeration';
import {
  buildTandemReply,
  CHAT_ROOMS,
  createStableUserId,
  fetchDirectMessages,
  fetchOnlineLearners,
  fetchRoomMessages,
  hasAcceptedSafetyRules,
  isSupabaseConfigured,
  loadSavedProfile,
  loadSupabaseConnection,
  postDirectMessage,
  postRoomMessage,
  saveUserProfile,
  sendSupabaseEmailOtp,
  setSafetyRulesAccepted,
  submitSafetyReport,
  syncUserPresence,
  type ChatRoomId,
  type ChatUserProfile,
  type DirectMessage,
  type RoomChatMessage,
} from '../../utils/chatBackend';

interface VirtualChatRoomProps {
  onOpenSettings: () => void;
  supabaseVersion?: number;
}

const FLAG_OPTIONS = [
  { flag: '🇮🇩', label: 'Indonesia' },
  { flag: '🇩🇪', label: 'Germany' },
  { flag: '🇬🇧', label: 'UK / English' },
  { flag: '🇺🇸', label: 'USA' },
  { flag: '🇯🇵', label: 'Japan' },
  { flag: '🇰🇷', label: 'Korea' },
  { flag: '🇹🇷', label: 'Turkey' },
  { flag: '🇪🇸', label: 'Spain / LatAm' },
  { flag: '🇫🇷', label: 'France' },
  { flag: '🇧🇷', label: 'Brazil' },
  { flag: '🇮🇳', label: 'India' },
  { flag: '🇻🇳', label: 'Vietnam' },
  { flag: '🇸🇦', label: 'Arabic' },
  { flag: '🇺🇦', label: 'Ukraine' },
  { flag: '🇨🇳', label: 'China' },
  { flag: '🌐', label: 'Global' },
];

const CEFR_OPTIONS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

const REPORT_REASONS = [
  'Bullying, insults, or harassment',
  'Scam, phishing, crypto/money solicitation, or suspicious contact request',
  'Spam, flooding, or off-topic disruption',
];

function formatClock(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function VirtualChatRoom({
  supabaseVersion = 0,
}: VirtualChatRoomProps) {
  const { t } = useLanguage();

  const supabaseConn = useMemo(() => {
    void supabaseVersion;
    return loadSupabaseConnection();
  }, [supabaseVersion]);
  const liveGlobalEnabled = isSupabaseConfigured(supabaseConn);

  // User profile (Guest OR Simple Email Profile)
  const [profile, setProfile] = useState<ChatUserProfile | null>(() => loadSavedProfile());
  const [rulesAccepted, setRulesAccepted] = useState<boolean>(() => hasAcceptedSafetyRules());
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Entry / Profile Form state
  const [authMode, setAuthMode] = useState<'guest' | 'email'>(
    profile && !profile.isGuest ? 'email' : 'guest'
  );
  const [nickInput, setNickInput] = useState<string>(profile?.nickname ?? '');
  const [emailInput, setEmailInput] = useState<string>(profile?.email ?? '');
  const [cefrInput, setCefrInput] = useState<CEFRLevel>(profile?.cefr ?? 'A2');
  const [flagInput, setFlagInput] = useState<string>(profile?.flag ?? '🇮🇩');
  const [bioInput, setBioInput] = useState<string>(profile?.bio ?? '');
  const [entryError, setEntryError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Lounge sub-mode: Text Rooms & DM vs. Tandem-style Live Language Parties
  const [loungeMode, setLoungeMode] = useState<'text' | 'parties'>('text');

  // Rooms, Members & Private 1-on-1 Chat state
  const [activeRoom, setActiveRoom] = useState<ChatRoomId>('general');
  const [activeDmPartner, setActiveDmPartner] = useState<ChatUserProfile | null>(null);
  const [learners, setLearners] = useState<ChatUserProfile[]>([]);
  const [roomMessages, setRoomMessages] = useState<RoomChatMessage[]>([]);
  const [dmMessages, setDmMessages] = useState<DirectMessage[]>([]);
  const [mobilePanel, setMobilePanel] = useState<'chat' | 'rooms' | 'people'>('chat');

  // Composer & Moderation state
  const [draft, setDraft] = useState('');
  const [modAlert, setModAlert] = useState<string | null>(null);
  const [tandemEnabled, setTandemEnabled] = useState<boolean>(!liveGlobalEnabled);
  const [lastSentAt, setLastSentAt] = useState<number>(0);
  const [lastSentText, setLastSentText] = useState<string>('');
  const [sending, setSending] = useState(false);

  // Inline Grammar Check per message
  const [grammarChecks, setGrammarChecks] = useState<Record<string, SentenceAnalysisResult>>({});

  // Safety: Blocked users & Reported messages
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => loadBlockedUsers());
  const [reportedMsgIds, setReportedMsgIds] = useState<string[]>(() => loadReportedMessageIds());
  const [reportingTarget, setReportingTarget] = useState<{
    targetType: 'room_message' | 'direct_message';
    targetId: string;
    reportedUserId: string;
    reportedUserName: string;
    snippet: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [reportConfirmation, setReportConfirmation] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const currentRoomMeta =
    CHAT_ROOMS.find((r) => r.id === activeRoom) ?? CHAT_ROOMS[0];

  const refreshData = useCallback(async () => {
    const [{ learners: fetchedLearners }, { messages: fetchedMsgs }] = await Promise.all([
      fetchOnlineLearners(supabaseConn, profile),
      fetchRoomMessages(supabaseConn, activeRoom),
    ]);
    setLearners(fetchedLearners);
    setRoomMessages(fetchedMsgs);

    if (profile && activeDmPartner) {
      const dms = await fetchDirectMessages(supabaseConn, profile.id, activeDmPartner.id);
      setDmMessages(dms);
    }
  }, [supabaseConn, profile, activeRoom, activeDmPartner]);

  // Initial load + 3.5s live polling + BroadcastChannel multi-tab sync
  useEffect(() => {
    let cancelled = false;

    const runSync = async () => {
      if (cancelled) return;
      await refreshData();
    };
    void runSync();

    const interval = window.setInterval(() => {
      void runSync();
    }, 3500);

    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('satzklar_chat_v2');
      channelRef.current = bc;
      bc.onmessage = () => {
        void runSync();
      };
    }

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [refreshData]);

  // Heartbeat presence into Supabase when profile is active
  useEffect(() => {
    if (!profile || !liveGlobalEnabled) return;
    const updated: ChatUserProfile = {
      ...profile,
      currentRoom: activeRoom,
      lastSeen: new Date().toISOString(),
    };
    void syncUserPresence(supabaseConn, updated);
  }, [profile, activeRoom, liveGlobalEnabled, supabaseConn]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [roomMessages.length, dmMessages.length, activeRoom, activeDmPartner?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEntryError(null);
    setAuthNotice(null);

    const nickCheck = validateNickname(nickInput);
    if (!nickCheck.ok) {
      setEntryError(nickCheck.error ?? 'Invalid nickname.');
      return;
    }

    const bioCheck = validateBio(bioInput);
    if (!bioCheck.ok) {
      setEntryError(bioCheck.error ?? 'Invalid bio.');
      return;
    }

    if (authMode === 'email' && !isValidEmail(emailInput)) {
      setEntryError('Please enter a valid email address (or switch to Guest mode — no email needed).');
      return;
    }

    const nextProfile: ChatUserProfile = {
      id: profile?.id ?? createStableUserId(),
      nickname: nickCheck.cleaned,
      cefr: cefrInput,
      flag: flagInput,
      nativeLang: FLAG_OPTIONS.find((f) => f.flag === flagInput)?.label ?? 'Global',
      bio: bioCheck.cleaned,
      isGuest: authMode === 'guest',
      email: authMode === 'email' ? emailInput.trim() : undefined,
      emailVerified: authMode === 'email',
      currentRoom: activeRoom,
      lastSeen: new Date().toISOString(),
    };

    saveUserProfile(nextProfile);
    setProfile(nextProfile);
    setSafetyRulesAccepted();
    setRulesAccepted(true);
    setShowProfileModal(false);

    if (authMode === 'email' && emailInput.trim()) {
      const otpRes = await sendSupabaseEmailOtp(supabaseConn, emailInput.trim());
      setAuthNotice(otpRes.message);
    }

    if (liveGlobalEnabled) {
      await syncUserPresence(supabaseConn, nextProfile);
    }
    channelRef.current?.postMessage({ type: 'profile_updated' });
    void refreshData();
  };

  const handleAcceptRulesOnly = () => {
    setSafetyRulesAccepted();
    setRulesAccepted(true);
  };

  const handleBlockUser = (userId: string, userName: string) => {
    const next = Array.from(new Set([...blockedUsers, userId]));
    setBlockedUsers(next);
    saveBlockedUsers(next);
    if (activeDmPartner?.id === userId) {
      setActiveDmPartner(null);
    }
    setReportConfirmation(`Blocked ${userName}. Their messages and private chats are hidden for you.`);
    window.setTimeout(() => setReportConfirmation(null), 4000);
  };

  const handleUnblockUser = (userId: string) => {
    const next = blockedUsers.filter((id) => id !== userId);
    setBlockedUsers(next);
    saveBlockedUsers(next);
  };

  const handleConfirmReport = async () => {
    if (!reportingTarget || !profile) return;
    const nextReported = Array.from(new Set([...reportedMsgIds, reportingTarget.targetId]));
    setReportedMsgIds(nextReported);
    saveReportedMessageIds(nextReported);

    await submitSafetyReport(supabaseConn, {
      ...reportingTarget,
      reason: reportReason,
      reporterId: profile.id,
    });

    setReportingTarget(null);
    setReportConfirmation(
      'Thank you for keeping SatzKlar safe. This message has been hidden and reported.'
    );
    window.setTimeout(() => setReportConfirmation(null), 4500);
  };

  const handleCheckGrammar = (messageId: string, text: string) => {
    const analysis = analyzeSentenceLocally(text);
    setGrammarChecks((prev) => ({ ...prev, [messageId]: analysis }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setModAlert(null);

    if (!profile) {
      setShowProfileModal(true);
      return;
    }

    if (!rulesAccepted) {
      setModAlert('Please agree to the Safe Learning Space rules first.');
      return;
    }

    // Strict Anti-Bullying, Anti-Cybercrime & Anti-Spam check BEFORE sending!
    const check = moderateChatMessage(draft, {
      lastSentAt,
      lastText: lastSentText,
    });

    if (!check.allowed) {
      setModAlert(check.reason ?? 'Message blocked by safety filter.');
      return;
    }

    const cleanText = draft.trim();
    setSending(true);
    setDraft('');
    setLastSentAt(Date.now());
    setLastSentText(cleanText);

    try {
      if (activeDmPartner) {
        const savedDm = await postDirectMessage(supabaseConn, {
          senderId: profile.id,
          senderName: profile.nickname,
          senderFlag: profile.flag,
          recipientId: activeDmPartner.id,
          recipientName: activeDmPartner.nickname,
          content: cleanText,
        });
        setDmMessages((prev) => [...prev, savedDm]);
        channelRef.current?.postMessage({ type: 'new_dm' });

        // If messaging a starter study buddy in Local/Practice mode with Tandem ON
        if (!liveGlobalEnabled && tandemEnabled && activeDmPartner.isCommunityBot) {
          const partner = activeDmPartner;
          const replyText = buildTandemReply(partner, cleanText, activeRoom);
          window.setTimeout(async () => {
            const replyDm = await postDirectMessage(supabaseConn, {
              senderId: partner.id,
              senderName: partner.nickname,
              senderFlag: partner.flag,
              recipientId: profile.id,
              recipientName: profile.nickname,
              content: replyText,
            });
            setDmMessages((prev) => [...prev, replyDm]);
          }, 700);
        }
      } else {
        const savedMsg = await postRoomMessage(supabaseConn, {
          roomId: activeRoom,
          authorId: profile.id,
          authorName: profile.nickname,
          authorCefr: profile.cefr,
          authorFlag: profile.flag,
          isGuest: profile.isGuest,
          content: cleanText,
        });
        setRoomMessages((prev) => [...prev, savedMsg]);
        channelRef.current?.postMessage({ type: 'new_room_msg', roomId: activeRoom });

        if (!liveGlobalEnabled && tandemEnabled) {
          const responder =
            learners.find((l) => l.isCommunityBot && l.currentRoom === activeRoom) ??
            learners.find((l) => l.isCommunityBot);
          if (responder) {
            const replyText = buildTandemReply(responder, cleanText, activeRoom);
            const targetRoom = activeRoom;
            window.setTimeout(async () => {
              const botMsg = await postRoomMessage(supabaseConn, {
                roomId: targetRoom,
                authorId: responder.id,
                authorName: responder.nickname,
                authorCefr: responder.cefr,
                authorFlag: responder.flag,
                isGuest: false,
                content: replyText,
              });
              setRoomMessages((prev) =>
                targetRoom === activeRoom ? [...prev, botMsg] : prev
              );
            }, 850);
          }
        }
      }
    } finally {
      setSending(false);
    }
  };

  const visibleRoomMessages = useMemo(
    () =>
      roomMessages.filter(
        (m) => !blockedUsers.includes(m.authorId) && !reportedMsgIds.includes(m.id)
      ),
    [roomMessages, blockedUsers, reportedMsgIds]
  );

  const visibleDmMessages = useMemo(
    () =>
      dmMessages.filter(
        (m) => !blockedUsers.includes(m.senderId) && !reportedMsgIds.includes(m.id)
      ),
    [dmMessages, blockedUsers, reportedMsgIds]
  );

  const visibleLearners = useMemo(
    () => learners.filter((l) => !blockedUsers.includes(l.id)),
    [learners, blockedUsers]
  );

  // --- ENTRY GATE: Friendly Guest or Simple Email Profile Setup ---
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <div className="paper-elevated rounded-2xl p-5 sm:p-7 space-y-5">
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-xl bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#059669]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Safe Learning Lounge · General + A1–B2 + Private DM</span>
              </span>
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--ink-primary)] mt-0.5">
                {t.chatTitle}
              </h1>
              <p className="text-sm text-[var(--ink-secondary)] mt-1">
                Learn German together in level rooms or the General room, meet learners worldwide, and practice 1-on-1 in simple private chats.
              </p>
            </div>
          </div>

          {/* Guest vs. Simple Email Profile Toggle */}
          <div
            role="tablist"
            aria-label="Choose entry method"
            className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]"
          >
            <button
              id="tab-enter-guest"
              type="button"
              role="tab"
              aria-selected={authMode === 'guest'}
              onClick={() => {
                setAuthMode('guest');
                setEntryError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                authMode === 'guest'
                  ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              <UserCircle2 className="w-4 h-4 text-[#2563EB]" />
              <span>Enter as Guest</span>
            </button>
            <button
              id="tab-enter-email"
              type="button"
              role="tab"
              aria-selected={authMode === 'email'}
              onClick={() => {
                setAuthMode('email');
                setEntryError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                authMode === 'email'
                  ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              <Mail className="w-4 h-4 text-[#059669]" />
              <span>Simple Email Profile</span>
            </button>
          </div>

          <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="input-chat-nickname"
                  className="block text-xs font-semibold text-[var(--ink-primary)] mb-1"
                >
                  Study Nickname *
                </label>
                <input
                  id="input-chat-nickname"
                  type="text"
                  maxLength={24}
                  value={nickInput}
                  onChange={(e) => setNickInput(e.target.value)}
                  placeholder="e.g., Gunawan_B1 or Maya"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-sm text-[var(--ink-primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="select-chat-cefr"
                  className="block text-xs font-semibold text-[var(--ink-primary)] mb-1"
                >
                  Your German Level
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {CEFR_OPTIONS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCefrInput(lvl)}
                      className={`py-2.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        cefrInput === lvl
                          ? 'bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                          : 'bg-[var(--bg-well)] text-[var(--ink-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {authMode === 'email' && (
              <div>
                <label
                  htmlFor="input-chat-email"
                  className="block text-xs font-semibold text-[var(--ink-primary)] mb-1"
                >
                  Email Only (No password or phone needed — kept private!) *
                </label>
                <input
                  id="input-chat-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#059669] focus:outline-none text-sm text-[var(--ink-primary)]"
                />
                <p className="text-[11px] text-[var(--ink-muted)] mt-1">
                  Your email is NEVER shown publicly in chat — only your nickname, flag, level, and optional study bio appear to other learners.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="select-chat-flag"
                  className="block text-xs font-semibold text-[var(--ink-primary)] mb-1"
                >
                  Country / Native Language
                </label>
                <select
                  id="select-chat-flag"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-sm text-[var(--ink-primary)]"
                >
                  {FLAG_OPTIONS.map((f) => (
                    <option key={f.label} value={f.flag}>
                      {f.flag} {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="input-chat-bio"
                  className="block text-xs font-semibold text-[var(--ink-primary)] mb-1"
                >
                  Short Study Goal (Optional — helps others know you)
                </label>
                <input
                  id="input-chat-bio"
                  type="text"
                  maxLength={140}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="e.g., Preparing for Goethe B1 & looking for a study buddy!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-sm text-[var(--ink-primary)]"
                />
              </div>
            </div>

            {/* Mandatory Safe Space Pledge */}
            <div className="rounded-xl p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#047857] dark:text-emerald-300">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Clean & Safe Community Rules (Zero Tolerance)</span>
              </div>
              <ul className="text-xs text-[var(--ink-secondary)] space-y-1 list-disc pl-5">
                <li>
                  <strong>No Bullying or Harassment:</strong> Be kind, patient, and respectful to learners at every CEFR level.
                </li>
                <li>
                  <strong>No Cybercrime, Scams, or External Links:</strong> URLs, phishing links, crypto/money requests, OTPs, and phone/WhatsApp harvesting are automatically blocked.
                </li>
                <li>
                  <strong>One-Click Report & Block:</strong> You can report any message or block any user instantly in rooms and private chats.
                </li>
              </ul>
            </div>

            {entryError && (
              <div
                id="chat-entry-error"
                className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-medium text-[#BE123C] dark:text-rose-300"
              >
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{entryError}</span>
              </div>
            )}

            <button
              id="btn-join-chat-room"
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {authMode === 'guest'
                  ? 'Agree to Safety Rules & Enter as Guest'
                  : 'Agree to Safety Rules & Enter with Email Profile'}
              </span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN MULTI-ROOM + PRIVATE DM WORKSPACE ---
  return (
    <div className="space-y-5">
      {/* Top Status & Profile Header */}
      <div className="paper-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display font-extrabold text-lg sm:text-xl text-[var(--ink-primary)]">
                {t.chatTitle}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-[#047857] border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                <Globe className="w-3 h-3" />
                <span>{liveGlobalEnabled ? 'GLOBAL LIVE' : 'LIVE LOUNGE'}</span>
              </span>
            </div>
            <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
              Protected by Anti-Bullying & Anti-Cybercrime Guard · General + A1–B2 Rooms + 1-on-1 Private Chat
            </p>
          </div>
        </div>

        {/* Current User Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-xs">
            <span aria-hidden="true">{profile.flag}</span>
            <span className="font-semibold text-[var(--ink-primary)] max-w-[120px] truncate">
              {profile.nickname}
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--ink-secondary)]">
              {profile.cefr}
            </span>
            {profile.isGuest ? (
              <span className="text-[10px] font-mono text-[var(--ink-muted)]">Guest</span>
            ) : (
              <span
                title="Simple Email Profile"
                className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-[#059669]"
              >
                <UserCheck className="w-3 h-3" />
                <span>Email</span>
              </span>
            )}
          </div>
          <button
            id="btn-edit-chat-profile"
            type="button"
            onClick={() => {
              setAuthMode(profile.isGuest ? 'guest' : 'email');
              setNickInput(profile.nickname);
              setEmailInput(profile.email ?? '');
              setCefrInput(profile.cefr);
              setFlagInput(profile.flag);
              setBioInput(profile.bio);
              setShowProfileModal(true);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            Profile
          </button>
        </div>
      </div>

      {/* Notices */}
      {authNotice && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs font-medium text-[#047857] dark:text-emerald-300">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{authNotice}</span>
          </span>
          <button type="button" onClick={() => setAuthNotice(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {reportConfirmation && (
        <div
          id="chat-safety-toast"
          className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-medium text-[#1D4ED8] dark:text-blue-300"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{reportConfirmation}</span>
          </span>
          <button type="button" onClick={() => setReportConfirmation(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rules banner if somehow not accepted */}
      {!rulesAccepted && (
        <div className="paper-card rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-emerald-300">
          <p className="text-xs text-[var(--ink-secondary)]">
            <strong className="text-[var(--ink-primary)]">Safety Reminder:</strong> Keep SatzKlar clean — zero bullying, zero scams/links, and zero sharing of financial or private credentials.
          </p>
          <button
            type="button"
            onClick={handleAcceptRulesOnly}
            className="px-3.5 py-1.5 rounded-lg bg-[#059669] text-white text-xs font-semibold cursor-pointer shrink-0"
          >
            I Agree
          </button>
        </div>
      )}

      {/* Lounge Mode Switcher: Text Rooms & Private DM vs. Live Voice Language Parties */}
      <div
        role="tablist"
        aria-label="Study Lounge Mode"
        className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-well)] border border-[var(--border-subtle)]"
      >
        <button
          id="lounge-mode-text"
          type="button"
          role="tab"
          aria-selected={loungeMode === 'text'}
          onClick={() => setLoungeMode('text')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            loungeMode === 'text'
              ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
              : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#2563EB]" />
          <span>Text Rooms &amp; Private DM</span>
        </button>
        <button
          id="lounge-mode-parties"
          type="button"
          role="tab"
          aria-selected={loungeMode === 'parties'}
          onClick={() => setLoungeMode('parties')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            loungeMode === 'parties'
              ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
              : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          <Radio className="w-4 h-4 text-[#E11D48]" />
          <span>Language Parties (Voice Stage)</span>
        </button>
      </div>

      {loungeMode === 'parties' ? (
        <PartyRoomView profile={profile} supabaseConn={supabaseConn} />
      ) : (
        <>
          {/* Mobile Panel Switcher */}
          <div className="lg:hidden grid grid-cols-3 gap-1 p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => setMobilePanel('rooms')}
          className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            mobilePanel === 'rooms'
              ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
              : 'text-[var(--ink-muted)]'
          }`}
        >
          Rooms (5)
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel('chat')}
          className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            mobilePanel === 'chat'
              ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
              : 'text-[var(--ink-muted)]'
          }`}
        >
          {activeDmPartner ? `DM: ${activeDmPartner.nickname}` : currentRoomMeta.name}
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel('people')}
          className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            mobilePanel === 'people'
              ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
              : 'text-[var(--ink-muted)]'
          }`}
        >
          Learners ({visibleLearners.length})
        </button>
      </div>

      {/* 3-Column Community Workspace: Rooms | Active Chat / DM | Learners Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: Public Level Rooms + Blocked list */}
        <aside
          className={`lg:col-span-3 space-y-3 ${
            mobilePanel === 'rooms' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="paper-card rounded-2xl p-3 space-y-1.5">
            <p className="px-2 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)]">
              Study Rooms
            </p>
            {CHAT_ROOMS.map((room) => {
              const selected = !activeDmPartner && activeRoom === room.id;
              return (
                <button
                  key={room.id}
                  id={`chat-room-${room.id}`}
                  type="button"
                  onClick={() => {
                    setActiveDmPartner(null);
                    setActiveRoom(room.id);
                    setModAlert(null);
                    setMobilePanel('chat');
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                      : 'text-[var(--ink-secondary)] hover:bg-[var(--bg-well)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Hash className="w-3.5 h-3.5 shrink-0 opacity-75" />
                    <span className="text-xs sm:text-sm font-semibold truncate">
                      {room.name.replace('#', '')}
                    </span>
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      selected
                        ? 'bg-white/15 text-white border-white/20 dark:bg-slate-900/15 dark:text-slate-900 dark:border-slate-900/20'
                        : room.accentClass
                    }`}
                  >
                    {room.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Safety Shield Status Card */}
          <div className="paper-card rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Active Safety Guard</span>
            </div>
            <p className="text-[11px] text-[var(--ink-secondary)] leading-relaxed">
              Blocks bullying, hate speech, links/phishing, phone/WhatsApp harvesting, crypto scams & spam automatically.
            </p>
            {blockedUsers.length > 0 && (
              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1">
                <p className="text-[11px] font-semibold text-[var(--ink-primary)]">
                  Blocked Users ({blockedUsers.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {blockedUsers.map((uid) => (
                    <button
                      key={uid}
                      type="button"
                      onClick={() => handleUnblockUser(uid)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                    >
                      Unblock {uid.slice(0, 8)} ×
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER: Live Room or 1-on-1 Private Chat Stream */}
        <section
          className={`lg:col-span-6 paper-card rounded-2xl flex flex-col h-[580px] overflow-hidden ${
            mobilePanel === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Chat Stream Header */}
          <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-2">
            {activeDmPartner ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  id="btn-exit-dm"
                  type="button"
                  onClick={() => setActiveDmPartner(null)}
                  className="p-1.5 rounded-lg text-[var(--ink-secondary)] hover:bg-[var(--bg-well)] cursor-pointer shrink-0"
                  title="Back to public room"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span className="font-display font-bold text-sm text-[var(--ink-primary)] truncate">
                      Private Chat with {activeDmPartner.flag} {activeDmPartner.nickname}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-secondary)]">
                      {activeDmPartner.cefr}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-muted)] truncate">
                    {activeDmPartner.bio || '1-on-1 German language exchange · Protected by Safety Guard'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-sm sm:text-base text-[var(--ink-primary)] truncate">
                    {currentRoomMeta.name}
                  </h2>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${currentRoomMeta.accentClass}`}
                  >
                    {currentRoomMeta.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-muted)] truncate">
                  {currentRoomMeta.description}
                </p>
              </div>
            )}

            {/* Tandem practice toggle (helpful in local mode or quiet rooms) */}
            {!liveGlobalEnabled && (
              <button
                id="btn-toggle-tandem"
                type="button"
                onClick={() => setTandemEnabled((v) => !v)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer shrink-0 ${
                  tandemEnabled
                    ? 'bg-emerald-50 text-[#047857] border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-[var(--bg-well)] text-[var(--ink-muted)] border-[var(--border-subtle)]'
                }`}
              >
                {tandemEnabled ? t.chatTandemOn : t.chatTandemOff}
              </button>
            )}
          </div>

          {/* Messages List */}
          <div
            id="chat-message-list"
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-canvas)]/50"
          >
            {activeDmPartner ? (
              visibleDmMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10 space-y-2">
                  <MessageCircle className="w-8 h-8 text-[#2563EB]/70" />
                  <p className="font-display font-bold text-sm text-[var(--ink-primary)]">
                    Say Hallo to {activeDmPartner.nickname}!
                  </p>
                  <p className="text-xs text-[var(--ink-secondary)] max-w-sm">
                    Start a friendly 1-on-1 conversation in German to get to know each other and practice together. Same strict anti-bully & anti-scam rules apply here.
                  </p>
                </div>
              ) : (
                visibleDmMessages.map((dm) => {
                  const isMine = dm.senderId === profile.id;
                  const analysis = grammarChecks[dm.id];
                  return (
                    <div
                      key={dm.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 border ${
                          isMine
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-[var(--bg-surface)] text-[var(--ink-primary)] border-[var(--border-subtle)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-[11px] font-bold opacity-90">
                            {dm.senderFlag} {dm.senderName}
                          </span>
                          <span className="text-[10px] font-mono opacity-75">
                            {formatClock(dm.createdAt)}
                          </span>
                        </div>
                        <p
                          translate="no"
                          className="notranslate text-sm leading-relaxed break-words"
                        >
                          {dm.content}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <AudioButton text={dm.content} compact />
                          <button
                            type="button"
                            onClick={() => handleCheckGrammar(dm.id, dm.content)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                              isMine
                                ? 'bg-white/15 text-white hover:bg-white/25'
                                : 'bg-[var(--bg-well)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                            }`}
                          >
                            <Stethoscope className="w-3 h-3" />
                            <span>{t.chatCheckGrammar}</span>
                          </button>
                          {!isMine && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setReportingTarget({
                                    targetType: 'direct_message',
                                    targetId: dm.id,
                                    reportedUserId: dm.senderId,
                                    reportedUserName: dm.senderName,
                                    snippet: dm.content,
                                  })
                                }
                                title="Report message"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--ink-muted)] hover:text-[#E11D48] cursor-pointer"
                              >
                                <Flag className="w-3 h-3" />
                                <span>Report</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBlockUser(dm.senderId, dm.senderName)}
                                title="Block user"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--ink-muted)] hover:text-[#E11D48] cursor-pointer"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Block</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {analysis && <InlineGrammarFeedback result={analysis} />}
                    </div>
                  );
                })
              )
            ) : visibleRoomMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10 space-y-2">
                <Sparkles className="w-7 h-7 text-[#2563EB]" />
                <p className="font-display font-bold text-sm text-[var(--ink-primary)]">
                  Be the first to write in {currentRoomMeta.name}!
                </p>
                <p
                  translate="no"
                  className="notranslate text-xs text-[var(--ink-secondary)] italic"
                >
                  Try: “{currentRoomMeta.promptHint}”
                </p>
              </div>
            ) : (
              visibleRoomMessages.map((msg) => {
                const isMine = msg.authorId === profile.id;
                const analysis = grammarChecks[msg.id];
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 border ${
                        isMine
                          ? 'bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                          : 'bg-[var(--bg-surface)] text-[var(--ink-primary)] border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span aria-hidden="true" className="text-xs">
                            {msg.authorFlag}
                          </span>
                          <span className="text-xs font-bold">{msg.authorName}</span>
                          <span
                            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isMine
                                ? 'bg-white/15 text-white dark:bg-slate-900/15 dark:text-slate-900'
                                : 'bg-[var(--bg-well)] text-[var(--ink-secondary)]'
                            }`}
                          >
                            {msg.authorCefr}
                          </span>
                          {!msg.isGuest && (
                            <span
                              title="Email Profile"
                              className={`text-[10px] font-mono ${
                                isMine ? 'opacity-80' : 'text-[#059669]'
                              }`}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono opacity-70">
                          {formatClock(msg.createdAt)}
                        </span>
                      </div>

                      <p
                        translate="no"
                        className="notranslate text-sm leading-relaxed break-words"
                      >
                        {msg.content}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <AudioButton text={msg.content} compact />
                        <button
                          type="button"
                          onClick={() => handleCheckGrammar(msg.id, msg.content)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                            isMine
                              ? 'bg-white/15 text-white hover:bg-white/25 dark:bg-slate-900/15 dark:text-slate-900'
                              : 'bg-[var(--bg-well)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                          }`}
                        >
                          <Stethoscope className="w-3 h-3" />
                          <span>{t.chatCheckGrammar}</span>
                        </button>

                        {!isMine && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const found = learners.find((l) => l.id === msg.authorId);
                                setActiveDmPartner(
                                  found ?? {
                                    id: msg.authorId,
                                    nickname: msg.authorName,
                                    cefr: msg.authorCefr,
                                    flag: msg.authorFlag,
                                    nativeLang: 'Global',
                                    bio: '',
                                    isGuest: msg.isGuest,
                                    currentRoom: activeRoom,
                                    lastSeen: msg.createdAt,
                                  }
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Private Chat</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setReportingTarget({
                                  targetType: 'room_message',
                                  targetId: msg.id,
                                  reportedUserId: msg.authorId,
                                  reportedUserName: msg.authorName,
                                  snippet: msg.content,
                                })
                              }
                              title="Report abusive or suspicious message"
                              className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg text-[11px] text-[var(--ink-muted)] hover:text-[#E11D48] cursor-pointer"
                            >
                              <Flag className="w-3 h-3" />
                              <span className="sr-only sm:not-sr-only">Report</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleBlockUser(msg.authorId, msg.authorName)}
                              title="Block this user"
                              className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg text-[11px] text-[var(--ink-muted)] hover:text-[#E11D48] cursor-pointer"
                            >
                              <Ban className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {analysis && <InlineGrammarFeedback result={analysis} />}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Moderation Alert Banner */}
          {modAlert && (
            <div
              id="chat-moderation-alert"
              role="alert"
              className="mx-3 mt-2 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-xs font-medium text-[#BE123C] dark:text-rose-300"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{modAlert}</span>
              <button type="button" onClick={() => setModAlert(null)} className="cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Message Composer */}
          <form
            onSubmit={(e) => void handleSendMessage(e)}
            className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1.5"
          >
            <div className="flex gap-2">
              <input
                id="input-chat-message"
                type="text"
                maxLength={500}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (modAlert) setModAlert(null);
                }}
                placeholder={
                  activeDmPartner
                    ? `Write a friendly private message to ${activeDmPartner.nickname}...`
                    : t.chatPlaceholder
                }
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-sm text-[var(--ink-primary)]"
              />
              <button
                id="btn-send-chat"
                type="submit"
                disabled={sending || !draft.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t.chatSend}</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[var(--ink-muted)] px-1">
              <span>No links, phone numbers, scams, or bullying · Respectful German practice</span>
              <span className="font-mono">{draft.length}/500</span>
            </div>
          </form>
        </section>

        {/* RIGHT: Learners Online ("Get to Know Each Other" + 1-on-1 Private Chat) */}
        <aside
          className={`lg:col-span-3 space-y-3 ${
            mobilePanel === 'people' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="paper-card rounded-2xl p-3 space-y-2.5 max-h-[580px] overflow-y-auto">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#059669]" />
                <span>Learners ({visibleLearners.length})</span>
              </span>
              <span className="text-[10px] text-[var(--ink-muted)]">Click to DM</span>
            </div>

            <div className="space-y-2">
              {visibleLearners.map((learner) => {
                const isSelf = learner.id === profile.id;
                const isDmActive = activeDmPartner?.id === learner.id;
                return (
                  <div
                    key={learner.id}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isDmActive
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-[#2563EB]'
                        : 'bg-[var(--bg-well)]/60 border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full bg-[#059669] shrink-0"
                          title="Active"
                        />
                        <span aria-hidden="true" className="text-sm shrink-0">
                          {learner.flag}
                        </span>
                        <span className="text-xs font-bold text-[var(--ink-primary)] truncate">
                          {learner.nickname}
                          {isSelf ? ' (You)' : ''}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--ink-secondary)] shrink-0">
                        {learner.cefr}
                      </span>
                    </div>

                    {learner.bio && (
                      <p className="text-[11px] text-[var(--ink-secondary)] mt-1 leading-snug line-clamp-2">
                        {learner.bio}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-mono text-[var(--ink-muted)]">
                        {learner.isGuest ? 'Guest' : '✓ Email'} · #{learner.currentRoom}
                      </span>

                      {!isSelf && (
                        <button
                          id={`btn-dm-${learner.id}`}
                          type="button"
                          onClick={() => {
                            setActiveDmPartner(learner);
                            setModAlert(null);
                            setMobilePanel('chat');
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#2563EB] text-[11px] font-semibold text-[#2563EB] dark:text-[#60A5FA] cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Private Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
        </>
      )}

      {/* Tasteful Creator Support / Tip Card */}
      <div className="paper-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#D97706] flex items-center justify-center shrink-0">
            <Coffee className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-[var(--ink-primary)] flex items-center gap-1.5">
              <span>{t.supportTitle}</span>
              <Heart className="w-3.5 h-3.5 text-[#E11D48] fill-current" />
            </h3>
            <p className="text-xs text-[var(--ink-secondary)] mt-0.5 max-w-2xl">
              {t.supportDesc}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {COMMUNITY_CONFIG.tipLinks.map((tip) => (
            <button
              key={tip.id}
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(tip.copyValue);
                setReportConfirmation(`Copied ${tip.label}: ${tip.copyValue} — thank you for supporting SatzKlar!`);
                window.setTimeout(() => setReportConfirmation(null), 3500);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#D97706] text-xs font-semibold text-[var(--ink-primary)] transition-colors cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{tip.id === 'ewallet-id' ? 'E-Wallet (Copy)' : 'PayPal (Copy)'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Edit / Upgrade Profile Modal (Switch between Guest & Simple Email Profile anytime) */}
      {showProfileModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit chat profile"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileModal(false);
          }}
        >
          <div className="paper-elevated w-full max-w-md rounded-2xl p-5 space-y-4 animate-pop-in">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
                Your Study Lounge Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setAuthMode('guest')}
                className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  authMode === 'guest'
                    ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                    : 'text-[var(--ink-secondary)]'
                }`}
              >
                Guest Mode
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('email')}
                className={`py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                  authMode === 'email'
                    ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                    : 'text-[var(--ink-secondary)]'
                }`}
              >
                Simple Email Profile
              </button>
            </div>

            <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-primary)] mb-1">
                  Nickname
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={nickInput}
                  onChange={(e) => setNickInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-sm text-[var(--ink-primary)]"
                />
              </div>

              {authMode === 'email' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-primary)] mb-1">
                    Email (kept private — never shown in chat)
                  </label>
                  <input
                    id="modal-input-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-sm text-[var(--ink-primary)]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-primary)] mb-1">
                    CEFR Level
                  </label>
                  <select
                    value={cefrInput}
                    onChange={(e) => setCefrInput(e.target.value as CEFRLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-sm text-[var(--ink-primary)]"
                  >
                    {CEFR_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-primary)] mb-1">
                    Flag / Region
                  </label>
                  <select
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-sm text-[var(--ink-primary)]"
                  >
                    {FLAG_OPTIONS.map((f) => (
                      <option key={f.label} value={f.flag}>
                        {f.flag} {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink-primary)] mb-1">
                  Short Study Goal / Bio
                </label>
                <input
                  type="text"
                  maxLength={140}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Preparing for Goethe B1..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-sm text-[var(--ink-primary)]"
                />
              </div>

              {entryError && (
                <p className="text-xs text-[#E11D48] font-medium">{entryError}</p>
              )}

              <button
                id="btn-save-chat-profile"
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Message Safety Modal */}
      {reportingTarget && (
        <div
          id="report-message-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Report unsafe message"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReportingTarget(null);
          }}
        >
          <div className="paper-elevated w-full max-w-md rounded-2xl p-5 space-y-4 animate-pop-in">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-[var(--ink-primary)] flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#E11D48]" />
                <span>Report &amp; Hide Message</span>
              </h3>
              <button
                type="button"
                onClick={() => setReportingTarget(null)}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--ink-secondary)]">
              Reporting message from <strong>{reportingTarget.reportedUserName}</strong>:
            </p>
            <blockquote className="p-2.5 rounded-xl bg-[var(--bg-well)] text-xs text-[var(--ink-secondary)] italic line-clamp-3">
              “{reportingTarget.snippet}”
            </blockquote>

            <div className="space-y-1.5">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${
                    reportReason === reason
                      ? 'border-[#E11D48] bg-rose-50/50 dark:bg-rose-950/30 text-[var(--ink-primary)] font-medium'
                      : 'border-[var(--border-subtle)] text-[var(--ink-secondary)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="mt-0.5"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportingTarget(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--ink-secondary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-report"
                type="button"
                onClick={() => void handleConfirmReport()}
                className="px-4 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
              >
                Report &amp; Hide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InlineGrammarFeedback({ result }: { result: SentenceAnalysisResult }) {
  return (
    <div className="mt-1.5 max-w-[90%] rounded-xl px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs space-y-1">
      {result.issues.length === 0 ? (
        <p className="flex items-center gap-1.5 text-[#059669] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{result.praise || 'Super! Looks grammatically clean.'}</span>
        </p>
      ) : (
        <>
          <p className="font-semibold text-[var(--ink-primary)]">
            Grammar Doctor ({result.issues.length}{' '}
            {result.issues.length === 1 ? 'tip' : 'tips'}):
          </p>
          {result.issues.slice(0, 3).map((issue) => (
            <p key={issue.id} className="text-[var(--ink-secondary)] leading-snug">
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-[#B45309] dark:bg-amber-950/50 dark:text-amber-300 mr-1.5">
                {issue.category}
              </span>
              {issue.suggestion}
            </p>
          ))}
        </>
      )}
    </div>
  );
}
