import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertOctagon,
  ArrowDownToLine,
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Database,
  Hand,
  Headphones,
  Lock,
  LogOut,
  MessageSquare,
  Mic,
  MicOff,
  Plus,
  Radio,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Unlock,
  UserMinus,
  UserPlus,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import type { ChatUserProfile, SupabaseConnection } from '../../utils/chatBackend';
import { submitSafetyReport } from '../../utils/chatBackend';
import { moderateChatMessage } from '../../utils/chatModeration';
import { PartyAudioEngine } from '../../utils/partyAudio';
import {
  createPartyRoom,
  fetchActiveParties,
  fetchPartyMessages,
  fetchPartyParticipants,
  PARTY_ICEBREAKERS,
  PARTY_SQL_SCHEMA,
  postPartyMessage,
  removePartyParticipant,
  updatePartyRoomSettings,
  upsertPartyParticipant,
  type PartyCefr,
  type PartyMessage,
  type PartyParticipant,
  type PartyRole,
  type PartyRoom,
} from '../../utils/partyBackend';

interface PartyRoomViewProps {
  profile: ChatUserProfile;
  supabaseConn: SupabaseConnection;
}

const CEFR_FILTER_OPTIONS: PartyCefr[] = ['ALL', 'A1', 'A2', 'B1', 'B2'];

const CEFR_BADGE_STYLES: Record<PartyCefr, string> = {
  ALL: 'text-[#2563EB] bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300',
  A1: 'text-[#059669] bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
  A2: 'text-[#2563EB] bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300',
  B1: 'text-[#D97706] bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
  B2: 'text-[#0D9488] bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300',
};

function participantKey(partyId: string, userId: string): string {
  return `${partyId}::${userId}`;
}

export function PartyRoomView({ profile, supabaseConn }: PartyRoomViewProps) {
  const [rooms, setRooms] = useState<PartyRoom[]>([]);
  const [liveDbReady, setLiveDbReady] = useState<boolean>(false);
  const [levelFilter, setLevelFilter] = useState<PartyCefr>('ALL');
  const [showSqlBanner, setShowSqlBanner] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Create / Host Party modal state
  const [showHostModal, setShowHostModal] = useState(false);
  const [hostTitle, setHostTitle] = useState('');
  const [hostCefr, setHostCefr] = useState<PartyCefr>('ALL');
  const [hostMaxSeats, setHostMaxSeats] = useState<4 | 6 | 8>(6);
  const [hostTopicPrompt, setHostTopicPrompt] = useState('');
  const [hostSeatsLocked, setHostSeatsLocked] = useState(false);
  const [hostError, setHostError] = useState<string | null>(null);

  // Active Party Room state
  const [activeParty, setActiveParty] = useState<PartyRoom | null>(null);
  const [participants, setParticipants] = useState<PartyParticipant[]>([]);
  const [messages, setMessages] = useState<PartyMessage[]>([]);
  const [micOn, setMicOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [managingUserId, setManagingUserId] = useState<string | null>(null);

  // Party text chat composer
  const [chatDraft, setChatDraft] = useState('');
  const [chatAlert, setChatAlert] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState(0);

  const audioEngineRef = useRef<PartyAudioEngine | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  const micOnRef = useRef(micOn);
  useEffect(() => {
    micOnRef.current = micOn;
  }, [micOn]);

  const activePartyId = activeParty?.id ?? null;

  const myParticipant = useMemo(
    () => participants.find((p) => p.userId === profile.id) ?? null,
    [participants, profile.id]
  );

  const isHost = Boolean(activeParty && activeParty.hostId === profile.id);
  const isMod = Boolean(myParticipant && (myParticipant.role === 'host' || myParticipant.role === 'mod'));
  const isOnStage = myParticipant !== null && myParticipant.seatIndex !== null;

  const showToast = useCallback((msg: string) => {
    setStatusNotice(msg);
    window.setTimeout(() => setStatusNotice(null), 3500);
  }, []);

  const refreshLobby = useCallback(async () => {
    const res = await fetchActiveParties(supabaseConn);
    setRooms(res.rooms);
    setLiveDbReady(res.liveDbReady);
  }, [supabaseConn]);

  const refreshActiveParty = useCallback(async () => {
    if (!activePartyId) return;
    const [{ participants: list, liveDbReady: dbOk }, msgs, { rooms: latestRooms }] =
      await Promise.all([
        fetchPartyParticipants(supabaseConn, activePartyId),
        fetchPartyMessages(supabaseConn, activePartyId),
        fetchActiveParties(supabaseConn),
      ]);

    setLiveDbReady(dbOk);
    setParticipants(list.filter((p) => !p.kicked));
    setMessages(msgs);

    const updatedRoom = latestRooms.find((r) => r.id === activePartyId);
    if (updatedRoom) {
      setActiveParty((prev) => {
        if (
          prev &&
          prev.id === updatedRoom.id &&
          prev.seatsLocked === updatedRoom.seatsLocked &&
          prev.topicPrompt === updatedRoom.topicPrompt &&
          prev.isActive === updatedRoom.isActive
        ) {
          return prev;
        }
        return updatedRoom;
      });
    }

    // Enforce moderator force-mute or kick immediately
    const me = list.find((p) => p.userId === profile.id);
    if (me?.kicked) {
      audioEngineRef.current?.destroy();
      audioEngineRef.current = null;
      setMicOn(false);
      setActiveParty(null);
      showToast('You were removed from the party room by a moderator.');
      return;
    }
    if (me && (me.mutedByMod || me.seatIndex === null) && micOnRef.current) {
      audioEngineRef.current?.muteMicrophone();
      setMicOn(false);
      if (me.mutedByMod) {
        showToast('A moderator muted your microphone.');
      }
    }

    // Sync WebRTC peers with real non-demo participants
    if (audioEngineRef.current) {
      const peerIds = list
        .filter((p) => !p.isDemoPeer && !p.kicked)
        .map((p) => p.userId);
      audioEngineRef.current.syncPeers(peerIds);
    }
  }, [activePartyId, supabaseConn, profile.id, showToast]);

  // Lobby & Active Party polling + BroadcastChannel sync
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      if (activePartyId) {
        await refreshActiveParty();
      } else {
        await refreshLobby();
      }
    };
    void tick();

    const interval = window.setInterval(() => {
      void tick();
    }, 3000);

    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('satzklar_party_v1');
      broadcastRef.current = bc;
      bc.onmessage = () => {
        void tick();
      };
    }

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      broadcastRef.current?.close();
      broadcastRef.current = null;
    };
  }, [activePartyId, refreshActiveParty, refreshLobby]);

  // Keep participant heartbeat alive while inside a party
  useEffect(() => {
    if (!activePartyId || !myParticipant) return;
    const heartbeat = window.setInterval(() => {
      void upsertPartyParticipant(supabaseConn, {
        ...myParticipant,
        lastSeen: new Date().toISOString(),
      });
    }, 20_000);
    return () => window.clearInterval(heartbeat);
  }, [activePartyId, myParticipant, supabaseConn]);

  // Clean up audio engine on unmount
  useEffect(() => {
    return () => {
      audioEngineRef.current?.destroy();
      audioEngineRef.current = null;
    };
  }, []);

  const notifySync = () => {
    broadcastRef.current?.postMessage({ type: 'party_sync' });
  };

  const handleJoinParty = async (room: PartyRoom, asHost = false) => {
    setMicError(null);
    setChatAlert(null);
    setMicOn(false);

    const participant: PartyParticipant = {
      id: participantKey(room.id, profile.id),
      partyId: room.id,
      userId: profile.id,
      nickname: profile.nickname,
      flag: profile.flag,
      cefr: profile.cefr,
      role: asHost || room.hostId === profile.id ? 'host' : 'listener',
      seatIndex: asHost || room.hostId === profile.id ? 0 : null,
      micOn: false,
      handRaised: false,
      mutedByMod: false,
      kicked: false,
      lastSeen: new Date().toISOString(),
    };

    await upsertPartyParticipant(supabaseConn, participant);
    setActiveParty(room);
    setParticipants((prev) => [
      ...prev.filter((p) => p.id !== participant.id && p.partyId === room.id),
      participant,
    ]);

    // Initialize WebRTC audio engine
    audioEngineRef.current?.destroy();
    const engine = new PartyAudioEngine({
      conn: supabaseConn,
      partyId: room.id,
      myUserId: profile.id,
      onSpeakingChange: (speaking) => setIsSpeaking(speaking),
      onMicError: (err) => {
        setMicError(err);
        setMicOn(false);
      },
    });
    engine.startSignaling();
    audioEngineRef.current = engine;

    notifySync();
    const { participants: latest } = await fetchPartyParticipants(supabaseConn, room.id);
    setParticipants(latest.filter((p) => !p.kicked));
  };

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    setHostError(null);

    const titleCheck = moderateChatMessage(hostTitle);
    if (!titleCheck.allowed || hostTitle.trim().length < 3) {
      setHostError(
        titleCheck.allowed
          ? 'Please enter a party title (at least 3 characters).'
          : (titleCheck.reason ?? 'Please use a clean, respectful party title.')
      );
      return;
    }

    if (hostTopicPrompt.trim()) {
      const promptCheck = moderateChatMessage(hostTopicPrompt);
      if (!promptCheck.allowed) {
        setHostError(promptCheck.reason ?? 'Topic prompt blocked by safety guard.');
        return;
      }
    }

    const { room } = await createPartyRoom(supabaseConn, profile, {
      title: hostTitle.trim(),
      cefr: hostCefr,
      maxSeats: hostMaxSeats,
      topicPrompt: hostTopicPrompt.trim(),
      seatsLocked: hostSeatsLocked,
    });

    setShowHostModal(false);
    setHostTitle('');
    setHostTopicPrompt('');
    await handleJoinParty(room, true);
    showToast('Your Language Party is live! Turn on your mic whenever you are ready.');
  };

  const handleLeaveParty = async () => {
    if (!activeParty) return;
    audioEngineRef.current?.destroy();
    audioEngineRef.current = null;
    setMicOn(false);
    setIsSpeaking(false);
    setManagingUserId(null);

    await removePartyParticipant(supabaseConn, participantKey(activeParty.id, profile.id));
    setActiveParty(null);
    setParticipants([]);
    setMessages([]);
    notifySync();
    void refreshLobby();
  };

  const handleEndParty = async () => {
    if (!activeParty || !isHost) return;
    await updatePartyRoomSettings(supabaseConn, activeParty.id, { isActive: false });
    await handleLeaveParty();
    showToast('Language Party ended cleanly.');
  };

  const findFirstOpenSeat = useCallback((): number | null => {
    if (!activeParty) return null;
    const taken = new Set(
      participants
        .filter((p) => p.seatIndex !== null && !p.kicked)
        .map((p) => p.seatIndex as number)
    );
    for (let i = 0; i < activeParty.maxSeats; i++) {
      if (!taken.has(i)) return i;
    }
    return null;
  }, [activeParty, participants]);

  const handleTakeSeat = async (preferredSeat?: number) => {
    if (!activeParty || !myParticipant) return;
    if (activeParty.seatsLocked && !isMod) {
      showToast('Stage seats are request-only. Tap Raise Hand so the Host or Mod can invite you!');
      return;
    }
    const taken = new Set(
      participants
        .filter((p) => p.seatIndex !== null && p.userId !== profile.id)
        .map((p) => p.seatIndex as number)
    );
    const chosen =
      preferredSeat !== undefined && !taken.has(preferredSeat)
        ? preferredSeat
        : findFirstOpenSeat();
    if (chosen === null) {
      showToast('All speaker seats are currently full — raise your hand to join next!');
      return;
    }

    const updated: PartyParticipant = {
      ...myParticipant,
      role: myParticipant.role === 'listener' ? 'speaker' : myParticipant.role,
      seatIndex: chosen,
      handRaised: false,
      mutedByMod: false,
      lastSeen: new Date().toISOString(),
    };
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await upsertPartyParticipant(supabaseConn, updated);
    notifySync();
    showToast(`You took Seat #${chosen + 1}! Tap Mic ON when ready to speak.`);
  };

  const handleLeaveSeat = async () => {
    if (!activeParty || !myParticipant) return;
    audioEngineRef.current?.releaseMicrophone();
    setMicOn(false);
    setIsSpeaking(false);

    const updated: PartyParticipant = {
      ...myParticipant,
      role: isHost ? 'host' : myParticipant.role === 'mod' ? 'mod' : 'listener',
      seatIndex: null,
      micOn: false,
      handRaised: false,
      lastSeen: new Date().toISOString(),
    };
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await upsertPartyParticipant(supabaseConn, updated);
    notifySync();
    showToast('Moved back to Audience (Listening Mode).');
  };

  const handleToggleMic = async () => {
    if (!activeParty || !myParticipant || myParticipant.seatIndex === null) return;
    setMicError(null);

    if (micOn) {
      audioEngineRef.current?.muteMicrophone();
      setMicOn(false);
      const updated: PartyParticipant = {
        ...myParticipant,
        micOn: false,
        lastSeen: new Date().toISOString(),
      };
      setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      await upsertPartyParticipant(supabaseConn, updated);
      notifySync();
      return;
    }

    const granted = (await audioEngineRef.current?.enableMicrophone()) ?? false;
    if (!granted) return;

    setMicOn(true);
    const updated: PartyParticipant = {
      ...myParticipant,
      micOn: true,
      mutedByMod: false,
      lastSeen: new Date().toISOString(),
    };
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await upsertPartyParticipant(supabaseConn, updated);
    notifySync();
  };

  const handleToggleRaiseHand = async () => {
    if (!activeParty || !myParticipant) return;
    const nextRaised = !myParticipant.handRaised;
    const updated: PartyParticipant = {
      ...myParticipant,
      handRaised: nextRaised,
      lastSeen: new Date().toISOString(),
    };
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await upsertPartyParticipant(supabaseConn, updated);
    notifySync();
    showToast(nextRaised ? 'Hand raised! Host & Moderators can see you.' : 'Hand lowered.');
  };

  // --- HOST & MODERATOR ACTIONS ---
  const handleModInviteToStage = async (target: PartyParticipant) => {
    if (!isMod || !activeParty) return;
    const openSeat = findFirstOpenSeat();
    if (openSeat === null) {
      showToast('All seats are occupied — move someone to Audience first.');
      return;
    }
    const updated: PartyParticipant = {
      ...target,
      role: target.role === 'listener' ? 'speaker' : target.role,
      seatIndex: openSeat,
      handRaised: false,
      mutedByMod: false,
    };
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await upsertPartyParticipant(supabaseConn, updated);
    setManagingUserId(null);
    notifySync();
    showToast(`Invited ${target.nickname} to Seat #${openSeat + 1}.`);
  };

  const handleModForceMute = async (target: PartyParticipant) => {
    if (!isMod) return;
    const updated: PartyParticipant = {
      ...target,
      micOn: false,
      mutedByMod: true,
    };
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await upsertPartyParticipant(supabaseConn, updated);
    setManagingUserId(null);
    notifySync();
    showToast(`Muted ${target.nickname}’s microphone.`);
  };

  const handleModMoveToAudience = async (target: PartyParticipant) => {
    if (!isMod || target.role === 'host') return;
    const updated: PartyParticipant = {
      ...target,
      role: target.role === 'mod' ? 'mod' : 'listener',
      seatIndex: null,
      micOn: false,
      handRaised: false,
    };
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await upsertPartyParticipant(supabaseConn, updated);
    setManagingUserId(null);
    notifySync();
    showToast(`Moved ${target.nickname} back to Audience.`);
  };

  const handleHostToggleMod = async (target: PartyParticipant) => {
    if (!isHost || target.userId === profile.id) return;
    const nextRole: PartyRole =
      target.role === 'mod'
        ? target.seatIndex !== null
          ? 'speaker'
          : 'listener'
        : 'mod';
    const updated: PartyParticipant = { ...target, role: nextRole };
    setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await upsertPartyParticipant(supabaseConn, updated);
    setManagingUserId(null);
    notifySync();
    showToast(
      nextRole === 'mod'
        ? `${target.nickname} is now a Co-Moderator!`
        : `Removed Moderator role from ${target.nickname}.`
    );
  };

  const handleModKickUser = async (target: PartyParticipant) => {
    if (!isMod || target.role === 'host' || !activeParty) return;
    const updated: PartyParticipant = {
      ...target,
      seatIndex: null,
      micOn: false,
      kicked: true,
    };
    setParticipants((prev) => prev.filter((p) => p.id !== target.id));
    await upsertPartyParticipant(supabaseConn, updated);
    await submitSafetyReport(supabaseConn, {
      targetType: 'user',
      targetId: target.id,
      reportedUserId: target.userId,
      reportedUserName: target.nickname,
      reason: `Removed from Language Party "${activeParty.title}" by moderator`,
      snippet: '',
      reporterId: profile.id,
    });
    setManagingUserId(null);
    notifySync();
    showToast(`Removed ${target.nickname} from the party for safety.`);
  };

  const handleToggleSeatsLocked = async () => {
    if (!activeParty || !isMod) return;
    const nextLocked = !activeParty.seatsLocked;
    setActiveParty({ ...activeParty, seatsLocked: nextLocked });
    await updatePartyRoomSettings(supabaseConn, activeParty.id, { seatsLocked: nextLocked });
    notifySync();
    showToast(
      nextLocked
        ? 'Stage locked: listeners must Raise Hand to request a seat.'
        : 'Stage unlocked: learners can freely tap any empty seat!'
    );
  };

  const handleShuffleTopic = async () => {
    if (!activeParty || !isMod) return;
    const list = PARTY_ICEBREAKERS[activeParty.cefr] ?? PARTY_ICEBREAKERS.ALL;
    const currentIdx = list.indexOf(activeParty.topicPrompt);
    const nextPrompt = list[(currentIdx + 1) % list.length];
    setActiveParty({ ...activeParty, topicPrompt: nextPrompt });
    await updatePartyRoomSettings(supabaseConn, activeParty.id, { topicPrompt: nextPrompt });
    notifySync();
  };

  const handleSendPartyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParty || !myParticipant) return;
    setChatAlert(null);

    const mod = moderateChatMessage(chatDraft, { lastSentAt });
    if (!mod.allowed) {
      setChatAlert(mod.reason ?? 'Message blocked by safety filter.');
      return;
    }

    const clean = chatDraft.trim();
    setChatDraft('');
    setLastSentAt(Date.now());

    const saved = await postPartyMessage(supabaseConn, {
      partyId: activeParty.id,
      authorId: profile.id,
      authorName: profile.nickname,
      authorFlag: profile.flag,
      authorRole: myParticipant.role,
      content: clean,
    });
    setMessages((prev) => [...prev, saved]);
    notifySync();
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(PARTY_SQL_SCHEMA);
      setCopiedSql(true);
      window.setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  // =========================================================================
  // VIEW 1: INSIDE AN ACTIVE TANDEM-STYLE LANGUAGE PARTY ROOM
  // =========================================================================
  if (activeParty) {
    const seats = Array.from({ length: activeParty.maxSeats }, (_, idx) => {
      const occupant = participants.find((p) => p.seatIndex === idx) ?? null;
      return { seatIndex: idx, occupant };
    });
    const listeners = participants.filter((p) => p.seatIndex === null);
    const raisedHands = listeners.filter((p) => p.handRaised);
    const onStageCount = participants.filter((p) => p.seatIndex !== null).length;

    return (
      <div id="party-room-stage" className="space-y-4 animate-slide-up">
        {/* Top Party Header Bar */}
        <div className="paper-elevated rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <button
                id="btn-leave-party"
                type="button"
                onClick={() => void handleLeaveParty()}
                className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-well)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer shrink-0"
                title="Leave Party"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-[#E11D48] border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>LIVE PARTY</span>
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${CEFR_BADGE_STYLES[activeParty.cefr]}`}
                  >
                    {activeParty.cefr}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--ink-muted)]">
                    {onStageCount}/{activeParty.maxSeats} on stage · {listeners.length} listening
                  </span>
                </div>
                <h2 className="font-display font-extrabold text-base sm:text-lg text-[var(--ink-primary)] mt-1">
                  {activeParty.title}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isMod && (
                <button
                  id="btn-toggle-seat-lock"
                  type="button"
                  onClick={() => void handleToggleSeatsLocked()}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    activeParty.seatsLocked
                      ? 'bg-amber-50 border-amber-300 text-[#B45309] dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                      : 'bg-[var(--bg-well)] border-[var(--border-subtle)] text-[var(--ink-secondary)]'
                  }`}
                >
                  {activeParty.seatsLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Request-Only Stage</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Open Seats</span>
                    </>
                  )}
                </button>
              )}

              {isHost ? (
                <button
                  id="btn-end-party"
                  type="button"
                  onClick={() => void handleEndParty()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E11D48] text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>End Party</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleLeaveParty()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[#E11D48] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Leave Quietly</span>
                </button>
              )}
            </div>
          </div>

          {/* Speaking Icebreaker Prompt Strip */}
          <div className="rounded-xl p-3 bg-[var(--bg-well)]/75 border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] block">
                  Speaking Topic (German Icebreaker)
                </span>
                <p
                  translate="no"
                  className="notranslate text-xs sm:text-sm font-semibold text-[var(--ink-primary)]"
                >
                  “{activeParty.topicPrompt}”
                </p>
              </div>
            </div>
            {isMod && (
              <button
                type="button"
                onClick={() => void handleShuffleTopic()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer shrink-0"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Next Topic</span>
              </button>
            )}
          </div>
        </div>

        {/* Notices & Mic Errors */}
        {statusNotice && (
          <div
            id="party-status-toast"
            className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-[#047857] dark:text-emerald-300 flex items-center gap-2 animate-pop-in"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {micError && (
          <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-medium text-[#B45309] dark:text-amber-300 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{micError}</span>
            </span>
            <button type="button" onClick={() => setMicError(null)} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main 2-Column Party Layout: Stage + Audience | Live Party Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT (8 cols): Speaker Seats + Raised Hands + Audience + Mic Dock */}
          <div className="lg:col-span-8 space-y-4">
            {/* SPEAKER STAGE SEATS GRID */}
            <section className="paper-card rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[var(--ink-primary)] flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#059669]" />
                  <span>Speaker Stage ({onStageCount} / {activeParty.maxSeats} Seats)</span>
                </h3>
                <span className="text-[11px] text-[var(--ink-muted)]">
                  {activeParty.seatsLocked ? 'Raise hand to request seat' : 'Tap any empty seat to speak'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {seats.map(({ seatIndex, occupant }) => {
                  if (!occupant) {
                    const canTapSeat = !isOnStage && (!activeParty.seatsLocked || isMod);
                    return (
                      <button
                        key={`seat-empty-${seatIndex}`}
                        id={`party-empty-seat-${seatIndex}`}
                        type="button"
                        onClick={() => {
                          if (canTapSeat) {
                            void handleTakeSeat(seatIndex);
                          } else if (!isOnStage && activeParty.seatsLocked) {
                            void handleToggleRaiseHand();
                          }
                        }}
                        disabled={isOnStage}
                        className={`min-h-[138px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 p-3 transition-all ${
                          canTapSeat
                            ? 'border-[var(--border-strong)] bg-[var(--bg-well)]/40 hover:border-[#2563EB] hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-well)]/25 opacity-65 cursor-default'
                        }`}
                      >
                        <span className="w-11 h-11 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--ink-muted)]">
                          {activeParty.seatsLocked && !isMod ? (
                            <Hand className="w-4 h-4" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </span>
                        <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                          {isOnStage
                            ? `Seat #${seatIndex + 1}`
                            : activeParty.seatsLocked && !isMod
                              ? 'Raise Hand'
                              : 'Take a Seat'}
                        </span>
                      </button>
                    );
                  }

                  const isMe = occupant.userId === profile.id;
                  const speakingNow = isMe ? isSpeaking && micOn : occupant.micOn;
                  const canManageThisUser = isMod && !isMe && occupant.role !== 'host';
                  const menuOpen = managingUserId === occupant.userId;

                  return (
                    <div
                      key={occupant.id}
                      id={`party-seat-${seatIndex}`}
                      className={`relative min-h-[138px] rounded-2xl border-2 p-3.5 flex flex-col items-center justify-between text-center transition-all ${
                        speakingNow
                          ? 'border-[#059669] bg-emerald-50/50 dark:bg-emerald-950/25 shadow-sm'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                      }`}
                    >
                      {/* Role Badge */}
                      <div className="w-full flex items-center justify-between gap-1">
                        {occupant.role === 'host' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-[#B45309] dark:text-amber-300 font-mono text-[10px] font-bold">
                            <Crown className="w-3 h-3" />
                            <span>Host</span>
                          </span>
                        ) : occupant.role === 'mod' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 font-mono text-[10px] font-bold">
                            <Shield className="w-3 h-3" />
                            <span>Mod</span>
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-well)] text-[var(--ink-muted)]">
                            {occupant.cefr}
                          </span>
                        )}

                        {canManageThisUser && (
                          <button
                            id={`btn-manage-${occupant.userId}`}
                            type="button"
                            onClick={() =>
                              setManagingUserId(menuOpen ? null : occupant.userId)
                            }
                            className="px-1.5 py-0.5 rounded-md bg-[var(--bg-well)] hover:bg-[var(--border-subtle)] text-[10px] font-semibold text-[var(--ink-secondary)] cursor-pointer"
                          >
                            Mod ▾
                          </button>
                        )}
                      </div>

                      {/* Speaker Avatar + Live Speaking Ring */}
                      <div className="relative my-1.5">
                        <div
                          className={`w-13 h-13 rounded-full flex items-center justify-center text-2xl bg-[var(--bg-well)] border-2 transition-all ${
                            speakingNow
                              ? 'border-[#059669] ring-4 ring-[#059669]/25'
                              : 'border-[var(--border-subtle)]'
                          }`}
                        >
                          <span aria-hidden="true">{occupant.flag}</span>
                        </div>
                        <span
                          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--bg-surface)] ${
                            occupant.micOn
                              ? 'bg-[#059669] text-white'
                              : 'bg-[var(--bg-well)] text-[var(--ink-muted)]'
                          }`}
                        >
                          {occupant.micOn ? (
                            <Mic className="w-3 h-3" />
                          ) : (
                            <MicOff className="w-3 h-3" />
                          )}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="w-full">
                        <p className="text-xs font-bold text-[var(--ink-primary)] truncate">
                          {occupant.nickname}
                          {isMe ? ' (You)' : ''}
                        </p>
                        <p className="text-[10px] font-mono text-[var(--ink-muted)]">
                          {occupant.micOn ? 'Mic ON' : 'Muted'}
                        </p>
                      </div>

                      {/* Moderator Action Menu */}
                      {menuOpen && canManageThisUser && (
                        <div className="absolute top-9 right-2 z-30 w-44 rounded-xl paper-elevated p-1.5 text-left space-y-1 animate-pop-in">
                          {occupant.micOn && (
                            <button
                              type="button"
                              onClick={() => void handleModForceMute(occupant)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
                            >
                              <MicOff className="w-3.5 h-3.5 text-[#D97706]" />
                              <span>Mute Mic</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleModMoveToAudience(occupant)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>Move to Audience</span>
                          </button>
                          {isHost && (
                            <button
                              type="button"
                              onClick={() => void handleHostToggleMod(occupant)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--ink-primary)] hover:bg-[var(--bg-well)] cursor-pointer"
                            >
                              <Shield className="w-3.5 h-3.5 text-[#059669]" />
                              <span>
                                {occupant.role === 'mod' ? 'Remove Mod' : 'Make Moderator'}
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleModKickUser(occupant)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#E11D48] hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Kick &amp; Report</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM LIVE STAGE CONTROL DOCK (Tandem-style!) */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2.5">
                {isOnStage ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        id="btn-party-mic-toggle"
                        type="button"
                        onClick={() => void handleToggleMic()}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs ${
                          micOn
                            ? 'bg-[#059669] text-white hover:bg-emerald-700'
                            : 'bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 hover:opacity-90'
                        }`}
                      >
                        {micOn ? (
                          <>
                            <Mic className="w-4 h-4" />
                            <span>Mic ON (Tap to Mute)</span>
                          </>
                        ) : (
                          <>
                            <MicOff className="w-4 h-4" />
                            <span>Turn Mic ON</span>
                          </>
                        )}
                      </button>

                      <button
                        id="btn-party-leave-seat"
                        type="button"
                        onClick={() => void handleLeaveSeat()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-well)] text-xs sm:text-sm font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                      >
                        <ArrowDownToLine className="w-4 h-4" />
                        <span>Leave Seat</span>
                      </button>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--ink-muted)]">
                      {micOn ? 'Live audio active (WebRTC)' : 'Your mic is muted'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      {!activeParty.seatsLocked && (
                        <button
                          id="btn-party-take-seat"
                          type="button"
                          onClick={() => void handleTakeSeat()}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Take a Seat</span>
                        </button>
                      )}
                      <button
                        id="btn-party-raise-hand"
                        type="button"
                        onClick={() => void handleToggleRaiseHand()}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer ${
                          myParticipant?.handRaised
                            ? 'bg-amber-50 border-amber-300 text-[#B45309] dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                            : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--ink-primary)] hover:bg-[var(--bg-well)]'
                        }`}
                      >
                        <Hand className="w-4 h-4" />
                        <span>
                          {myParticipant?.handRaised ? 'Lower Hand' : 'Raise Hand'}
                        </span>
                      </button>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Listening in Audience</span>
                    </span>
                  </>
                )}
              </div>
            </section>

            {/* RAISED HANDS QUEUE (Visible when anyone raises hand) */}
            {raisedHands.length > 0 && (
              <section className="paper-card rounded-2xl p-4 border-amber-300 dark:border-amber-800 space-y-2.5">
                <p className="text-xs font-display font-bold text-[#B45309] dark:text-amber-300 flex items-center gap-1.5">
                  <Hand className="w-4 h-4" />
                  <span>Raised Hands ({raisedHands.length})</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {raisedHands.map((person) => (
                    <div
                      key={person.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-xs"
                    >
                      <span>{person.flag}</span>
                      <span className="font-semibold text-[var(--ink-primary)]">
                        {person.nickname}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--ink-muted)]">
                        {person.cefr}
                      </span>
                      {isMod && (
                        <button
                          type="button"
                          onClick={() => void handleModInviteToStage(person)}
                          className="ml-1 px-2 py-0.5 rounded-lg bg-[#059669] text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Invite to Seat
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* AUDIENCE / LISTENERS */}
            <section className="paper-card rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Audience / Listeners ({listeners.length})</span>
                </h3>
              </div>
              {listeners.length === 0 ? (
                <p className="text-xs text-[var(--ink-muted)]">
                  Everyone is currently on stage! New visitors join here as listeners first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {listeners.map((person) => (
                    <div
                      key={person.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-well)]/70 border border-[var(--border-subtle)] text-xs"
                    >
                      <span>{person.flag}</span>
                      <span className="font-semibold text-[var(--ink-primary)]">
                        {person.nickname}
                        {person.userId === profile.id ? ' (You)' : ''}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--ink-muted)]">
                        {person.cefr}
                      </span>
                      {person.handRaised && <span title="Hand raised">✋</span>}
                      {isMod && person.userId !== profile.id && (
                        <button
                          type="button"
                          onClick={() => void handleModInviteToStage(person)}
                          className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#2563EB] text-[10px] font-semibold text-[#2563EB] dark:text-[#60A5FA] cursor-pointer"
                        >
                          Invite
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT (4 cols): Live Party Text Chat (Anti-Bully Protected) */}
          <section className="lg:col-span-4 paper-card rounded-2xl flex flex-col h-[500px] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <span className="font-display font-bold text-sm text-[var(--ink-primary)] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                <span>Party Chat</span>
              </span>
              <span className="text-[10px] font-mono text-[#059669] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Safe Guard</span>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[var(--bg-canvas)]/40">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-1">
                  <p className="text-xs font-semibold text-[var(--ink-primary)]">
                    Share German words or greetings here!
                  </p>
                  <p className="text-[11px] text-[var(--ink-muted)]">
                    Great for typing vocabulary while someone is speaking on stage.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5"
                  >
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span>{m.authorFlag}</span>
                      <span className="font-bold text-[var(--ink-primary)]">{m.authorName}</span>
                      {m.authorRole === 'host' && (
                        <span className="font-mono text-[9px] px-1 rounded bg-amber-50 text-[#B45309] dark:bg-amber-950/50 dark:text-amber-300">
                          Host
                        </span>
                      )}
                      {m.authorRole === 'mod' && (
                        <span className="font-mono text-[9px] px-1 rounded bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/50 dark:text-blue-300">
                          Mod
                        </span>
                      )}
                    </div>
                    <p translate="no" className="notranslate text-xs text-[var(--ink-secondary)] break-words">
                      {m.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {chatAlert && (
              <div className="mx-3 mt-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-[11px] text-[#BE123C] dark:text-rose-300 flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{chatAlert}</span>
              </div>
            )}

            <form
              onSubmit={(e) => void handleSendPartyMessage(e)}
              className="p-2.5 border-t border-[var(--border-subtle)] flex gap-1.5 bg-[var(--bg-surface)]"
            >
              <input
                id="input-party-chat"
                type="text"
                maxLength={500}
                value={chatDraft}
                onChange={(e) => {
                  setChatDraft(e.target.value);
                  if (chatAlert) setChatAlert(null);
                }}
                placeholder="Type a friendly note or German word..."
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-xs text-[var(--ink-primary)] focus:border-[#2563EB] focus:outline-none"
              />
              <button
                id="btn-send-party-chat"
                type="submit"
                disabled={!chatDraft.trim()}
                className="p-2 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer shrink-0"
                aria-label="Send party chat message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LANGUAGE PARTIES LOBBY (BROWSE OR HOST A PARTY)
  // =========================================================================
  const filteredRooms =
    levelFilter === 'ALL'
      ? rooms
      : rooms.filter((r) => r.cefr === levelFilter || r.cefr === 'ALL');

  return (
    <div id="party-lobby-view" className="space-y-5">
      {/* Lobby Hero & Host CTA */}
      <div className="paper-elevated rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#E11D48]">
              <Radio className="w-3.5 h-3.5" />
              <span>German Language Parties · Voice Stage</span>
            </span>
            {liveDbReady ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-[#047857] border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                GLOBAL LIVE AUDIO
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowSqlBanner((s) => !s)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-[#B45309] border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 cursor-pointer"
              >
                <Database className="w-3 h-3" />
                <span>Enable Global Parties (1 SQL)</span>
              </button>
            )}
          </div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--ink-primary)]">
            Speak German Live Together — Host, Take a Seat, or Just Listen
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-secondary)]">
            Join a live speaking party by level, tap an empty seat to turn your mic ON/OFF, raise your hand, or host your own room with full Moderator controls.
          </p>
        </div>

        <button
          id="btn-open-host-party"
          type="button"
          onClick={() => setShowHostModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Host a Party</span>
        </button>
      </div>

      {statusNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-[#047857] dark:text-emerald-300">
          {statusNotice}
        </div>
      )}

      {/* Optional Party SQL Setup Guide */}
      {showSqlBanner && (
        <div className="paper-card rounded-2xl p-4 sm:p-5 space-y-3 border-amber-200 dark:border-amber-800">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-sm text-[var(--ink-primary)]">
                Activate Global Multi-User Voice Parties in Supabase (1 Minute)
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                Run this SQL once in your Supabase <strong>SQL Editor</strong> so learners worldwide can host rooms, take seats, and talk live via WebRTC audio!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSqlBanner(false)}
              className="p-1 text-[var(--ink-muted)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <pre className="p-3 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--ink-secondary)] overflow-x-auto max-h-44">
              {PARTY_SQL_SCHEMA}
            </pre>
            <button
              type="button"
              onClick={() => void handleCopySql()}
              className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--ink-primary)] cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied SQL' : 'Copy SQL'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Level Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-1 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)]">
          {CEFR_FILTER_OPTIONS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer ${
                levelFilter === lvl
                  ? 'bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-xs'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {lvl === 'ALL' ? 'All Levels' : lvl}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-[var(--ink-muted)]">
          {filteredRooms.length} active {filteredRooms.length === 1 ? 'party' : 'parties'}
        </span>
      </div>

      {/* Live Party Cards Grid */}
      {filteredRooms.length === 0 ? (
        <div className="paper-card rounded-2xl p-8 text-center space-y-3">
          <Radio className="w-8 h-8 mx-auto text-[#2563EB]" />
          <h3 className="font-display font-bold text-base text-[var(--ink-primary)]">
            No live parties for this level yet — start the first one!
          </h3>
          <p className="text-xs text-[var(--ink-secondary)]">
            Create a speaking room in 5 seconds, invite friends, and practice German together.
          </p>
          <button
            type="button"
            onClick={() => setShowHostModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Host a Party Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <article
              key={room.id}
              className="paper-card rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${CEFR_BADGE_STYLES[room.cefr]}`}
                  >
                    {room.cefr === 'ALL' ? 'ALL LEVELS' : room.cefr}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--ink-muted)]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{room.maxSeats} seats</span>
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-[var(--ink-primary)] leading-snug">
                  {room.title}
                </h3>

                <p
                  translate="no"
                  className="notranslate text-xs text-[var(--ink-secondary)] line-clamp-2 italic"
                >
                  “{room.topicPrompt}”
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs min-w-0">
                  <Crown className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                  <span aria-hidden="true">{room.hostFlag}</span>
                  <span className="font-semibold text-[var(--ink-primary)] truncate">
                    {room.hostName}
                  </span>
                </div>
                <button
                  id={`btn-join-party-${room.id}`}
                  type="button"
                  onClick={() => void handleJoinParty(room)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                >
                  Join Party →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* HOST A PARTY MODAL */}
      {showHostModal && (
        <div
          id="host-party-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Host a German Language Party"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHostModal(false);
          }}
        >
          <form
            onSubmit={(e) => void handleCreateParty(e)}
            className="paper-elevated w-full max-w-md rounded-2xl p-5 sm:p-6 space-y-4 animate-pop-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-lg text-[var(--ink-primary)] flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#D97706]" />
                <span>Host a Language Party</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHostModal(false)}
                className="p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label
                htmlFor="input-party-title"
                className="block text-xs font-semibold text-[var(--ink-primary)] mb-1"
              >
                Party Room Title *
              </label>
              <input
                id="input-party-title"
                type="text"
                maxLength={80}
                value={hostTitle}
                onChange={(e) => setHostTitle(e.target.value)}
                placeholder="e.g., Goethe B1 Sprechen Practice or Friendly A1 Coffee Chat"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] focus:border-[#2563EB] focus:outline-none text-sm text-[var(--ink-primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-primary)] mb-1">
                  Target Level
                </label>
                <select
                  id="select-party-cefr"
                  value={hostCefr}
                  onChange={(e) => setHostCefr(e.target.value as PartyCefr)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-sm text-[var(--ink-primary)]"
                >
                  <option value="ALL">All Levels</option>
                  <option value="A1">A1 Beginner</option>
                  <option value="A2">A2 Elementary</option>
                  <option value="B1">B1 Intermediate</option>
                  <option value="B2">B2 Upper-Int</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink-primary)] mb-1">
                  Speaker Seats
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {([4, 6, 8] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setHostMaxSeats(n)}
                      className={`py-2 rounded-xl font-mono text-xs font-bold border cursor-pointer ${
                        hostMaxSeats === n
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-[var(--bg-well)] text-[var(--ink-secondary)] border-[var(--border-subtle)]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="input-party-topic"
                className="block text-xs font-semibold text-[var(--ink-primary)] mb-1"
              >
                German Speaking Topic (Optional)
              </label>
              <input
                id="input-party-topic"
                type="text"
                maxLength={180}
                value={hostTopicPrompt}
                onChange={(e) => setHostTopicPrompt(e.target.value)}
                placeholder={PARTY_ICEBREAKERS[hostCefr][0]}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-well)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--ink-primary)]"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-well)]/70 border border-[var(--border-subtle)] cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={hostSeatsLocked}
                onChange={(e) => setHostSeatsLocked(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <strong className="text-[var(--ink-primary)] block">
                  Request-Only Stage (Recommended for Large Rooms)
                </strong>
                <span className="text-[var(--ink-secondary)]">
                  Listeners raise their hand first, and you or your Moderators invite them onto a seat.
                </span>
              </span>
            </label>

            {hostError && (
              <p className="text-xs font-medium text-[#E11D48]">{hostError}</p>
            )}

            <button
              id="btn-create-party-submit"
              type="submit"
              className="w-full py-3 rounded-xl bg-[#1C1917] text-[#FAF8F5] dark:bg-slate-100 dark:text-slate-900 font-bold text-sm hover:opacity-90 cursor-pointer"
            >
              Launch Live Party Room 🎙️
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
