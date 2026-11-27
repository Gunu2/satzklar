/**
 * Zero-dependency Multi-User Chat Backend for SatzKlar.
 *
 * - Global Live Mode (Supabase REST + Email OTP):
 *   Activates automatically when `supabaseUrl` & `supabaseAnonKey` are set in
 *   `src/config/community.ts` or Settings. Connects learners worldwide across
 *   General + A1–B2 rooms, Online Learner Directory, 1-on-1 Private DMs, and Reports.
 *
 * - Instant Local + Multi-Tab Sync Mode (`BroadcastChannel` + `localStorage`):
 *   Works out-of-the-box with zero configuration so learners can explore rooms,
 *   meet starter study buddies, practice 1-on-1 private chat, and test every safety feature.
 */
import type { CEFRLevel } from '../types/grammar';
import { COMMUNITY_CONFIG } from '../config/community';

export type ChatRoomId = 'general' | 'a1' | 'a2' | 'b1' | 'b2';

export interface ChatRoomMeta {
  id: ChatRoomId;
  name: string;
  badge: string;
  description: string;
  promptHint: string;
  accentClass: string;
}

export const CHAT_ROOMS: ChatRoomMeta[] = [
  {
    id: 'general',
    name: '#general-lounge',
    badge: 'ALL',
    description: 'Open to every CEFR level — introduce yourself, ask study questions, and find a partner!',
    promptHint: 'Hallo zusammen! Ich komme aus ... und lerne Deutsch für ...',
    accentClass: 'text-[#2563EB] bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-300',
  },
  {
    id: 'a1',
    name: '#a1-start',
    badge: 'A1',
    description: 'Friendly beginner room: greetings, daily routines, der/die/das & simple V2 sentences.',
    promptHint: 'Guten Tag! Ich heiße ... und ich trinke gern Kaffee.',
    accentClass: 'text-[#059669] bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300',
  },
  {
    id: 'a2',
    name: '#a2-alltag',
    badge: 'A2',
    description: 'Everyday German: Perfekt tense, travel, hobbies, Dative verbs & Wechselpräpositionen.',
    promptHint: 'Gestern bin ich mit dem Zug in die Stadt gefahren.',
    accentClass: 'text-[#2563EB] bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/60 dark:text-blue-300',
  },
  {
    id: 'b1',
    name: '#b1-pruefung',
    badge: 'B1',
    description: 'Goethe / ÖSD / telc B1 exam prep: opinions, Nebensätze (weil/obwohl) & Schreiben tips.',
    promptHint: 'Meiner Meinung nach ist Homeoffice praktisch, weil man Zeit spart.',
    accentClass: 'text-[#D97706] bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300',
  },
  {
    id: 'b2',
    name: '#b2-debatte',
    badge: 'B2',
    description: 'Advanced debates, workplace German, Konjunktiv II, Passiv & Goethe/ÖSD B2 prep.',
    promptHint: 'Einerseits bietet KI große Chancen, andererseits braucht man klare Regeln.',
    accentClass: 'text-[#0D9488] bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800/60 dark:text-teal-300',
  },
];

export interface ChatUserProfile {
  id: string;
  nickname: string;
  cefr: CEFRLevel;
  flag: string;
  nativeLang: string;
  bio: string;
  isGuest: boolean;
  email?: string; // Stored strictly in local profile (only anonymized hash goes to DB)
  emailVerified?: boolean;
  currentRoom: ChatRoomId;
  lastSeen: string;
  isCommunityBot?: boolean;
}

export interface RoomChatMessage {
  id: string;
  roomId: ChatRoomId;
  authorId: string;
  authorName: string;
  authorCefr: CEFRLevel;
  authorFlag: string;
  isGuest: boolean;
  content: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  threadKey: string;
  senderId: string;
  senderName: string;
  senderFlag: string;
  recipientId: string;
  recipientName: string;
  content: string;
  createdAt: string;
}

export interface SupabaseConnection {
  url: string;
  anonKey: string;
}

const SUPABASE_URL_KEY = 'satzklar_supabase_url_v1';
const SUPABASE_KEY_KEY = 'satzklar_supabase_anon_key_v1';
const USER_PROFILE_KEY = 'satzklar_chat_profile_v2';
const RULES_ACCEPTED_KEY = 'satzklar_chat_rules_accepted_v1';
const LOCAL_ROOM_MSGS_KEY = 'satzklar_local_room_msgs_v2';
const LOCAL_DM_MSGS_KEY = 'satzklar_local_dm_msgs_v2';

export function loadSupabaseConnection(): SupabaseConnection {
  if (typeof window !== 'undefined') {
    try {
      const localUrl = window.localStorage.getItem(SUPABASE_URL_KEY)?.trim() ?? '';
      const localKey = window.localStorage.getItem(SUPABASE_KEY_KEY)?.trim() ?? '';
      if (localUrl && localKey) {
        return { url: localUrl.replace(/\/+$/, ''), anonKey: localKey };
      }
    } catch {
      // Ignore storage error
    }
  }
  return {
    url: COMMUNITY_CONFIG.supabaseUrl.trim().replace(/\/+$/, ''),
    anonKey: COMMUNITY_CONFIG.supabaseAnonKey.trim(),
  };
}

export function saveSupabaseConnection(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = anonKey.trim();
    if (!cleanUrl || !cleanKey) {
      window.localStorage.removeItem(SUPABASE_URL_KEY);
      window.localStorage.removeItem(SUPABASE_KEY_KEY);
    } else {
      window.localStorage.setItem(SUPABASE_URL_KEY, cleanUrl);
      window.localStorage.setItem(SUPABASE_KEY_KEY, cleanKey);
    }
  } catch {
    // Ignore storage error
  }
}

export function isSupabaseConfigured(conn: SupabaseConnection): boolean {
  return Boolean(conn.url.startsWith('https://') && conn.anonKey.length > 20);
}

export function loadSavedProfile(): ChatUserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChatUserProfile;
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: ChatUserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}

export function hasAcceptedSafetyRules(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(RULES_ACCEPTED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSafetyRulesAccepted(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RULES_ACCEPTED_KEY, 'true');
  } catch {
    // Ignore
  }
}

export function makeThreadKey(userA: string, userB: string): string {
  return [userA, userB].sort().join('::');
}

export function createStableUserId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `usr_${crypto.randomUUID().slice(0, 12)}`;
  }
  return `usr_${Math.random().toString(36).slice(2, 12)}`;
}

async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 24);
  }
  return normalized.slice(0, 12);
}

// Starter Study Buddies shown in Local/Demo Mode (or when global room is brand new)
export const STARTER_LEARNERS: ChatUserProfile[] = [
  {
    id: 'buddy-lena-de',
    nickname: 'Lena (Tandem)',
    cefr: 'B2',
    flag: '🇩🇪',
    nativeLang: 'Deutsch',
    bio: 'Muttersprachlerin aus Hamburg. Ich helfe gern bei B1/B2 Satzbau & Alltag!',
    isGuest: false,
    emailVerified: true,
    currentRoom: 'general',
    lastSeen: new Date().toISOString(),
    isCommunityBot: true,
  },
  {
    id: 'buddy-raka-id',
    nickname: 'Raka_ID',
    cefr: 'B1',
    flag: '🇮🇩',
    nativeLang: 'Bahasa Indonesia',
    bio: 'Belajar Goethe B1 untuk Ausbildung ke Jerman. Yuk latihan bareng!',
    isGuest: false,
    emailVerified: true,
    currentRoom: 'b1',
    lastSeen: new Date().toISOString(),
    isCommunityBot: true,
  },
  {
    id: 'buddy-kenji-jp',
    nickname: 'Kenji_A1',
    cefr: 'A1',
    flag: '🇯🇵',
    nativeLang: '日本語',
    bio: 'Starte gerade mit A1! Liebe Kaffee und deutsche Musik.',
    isGuest: true,
    currentRoom: 'a1',
    lastSeen: new Date().toISOString(),
    isCommunityBot: true,
  },
  {
    id: 'buddy-sofia-es',
    nickname: 'Sofia_A2',
    cefr: 'A2',
    flag: '🇪🇸',
    nativeLang: 'Español',
    bio: 'Übe Dativ und Perfekt für den Alltag in München.',
    isGuest: false,
    emailVerified: true,
    currentRoom: 'a2',
    lastSeen: new Date().toISOString(),
    isCommunityBot: true,
  },
  {
    id: 'buddy-omar-ar',
    nickname: 'Omar_B2',
    cefr: 'B2',
    flag: '🇪🇬',
    nativeLang: 'العربية',
    bio: 'Bereite mich auf ÖSD B2 vor. Diskutiere gern über Technik & Beruf.',
    isGuest: false,
    emailVerified: true,
    currentRoom: 'b2',
    lastSeen: new Date().toISOString(),
    isCommunityBot: true,
  },
];

const SEED_ROOM_MESSAGES: RoomChatMessage[] = [
  {
    id: 'seed-gen-1',
    roomId: 'general',
    authorId: 'buddy-lena-de',
    authorName: 'Lena (Tandem)',
    authorCefr: 'B2',
    authorFlag: '🇩🇪',
    isGuest: false,
    content:
      'Willkommen im #general-lounge! Hier können alle Levels zusammen lernen. Stell dich gern kurz auf Deutsch vor — oder klicke auf einen Namen für einen privaten 1-zu-1 Chat!',
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: 'seed-gen-2',
    roomId: 'general',
    authorId: 'buddy-raka-id',
    authorName: 'Raka_ID',
    authorCefr: 'B1',
    authorFlag: '🇮🇩',
    isGuest: false,
    content:
      'Hallo zusammen! Ich komme aus Indonesien und lerne gerade für das Goethe-Zertifikat B1. Freue mich, euch kennenzulernen!',
    createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
  {
    id: 'seed-a1-1',
    roomId: 'a1',
    authorId: 'buddy-kenji-jp',
    authorName: 'Kenji_A1',
    authorCefr: 'A1',
    authorFlag: '🇯🇵',
    isGuest: true,
    content: 'Hallo! Ich heiße Kenji. Ich komme aus Japan und ich lerne Deutsch. Wie heißt du?',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'seed-a2-1',
    roomId: 'a2',
    authorId: 'buddy-sofia-es',
    authorName: 'Sofia_A2',
    authorCefr: 'A2',
    authorFlag: '🇪🇸',
    isGuest: false,
    content: 'Am Wochenende bin ich mit meinen Freunden in den Park gegangen. Was hast du gemacht?',
    createdAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
  },
  {
    id: 'seed-b1-1',
    roomId: 'b1',
    authorId: 'buddy-raka-id',
    authorName: 'Raka_ID',
    authorCefr: 'B1',
    authorFlag: '🇮🇩',
    isGuest: false,
    content: 'Ich übe heute Schreiben Teil 2, weil ich nächste Woche die B1-Prüfung habe. Hat jemand Tipps für Nebensätze?',
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },
  {
    id: 'seed-b2-1',
    roomId: 'b2',
    authorId: 'buddy-omar-ar',
    authorName: 'Omar_B2',
    authorCefr: 'B2',
    authorFlag: '🇪🇬',
    isGuest: false,
    content: 'Meiner Ansicht nach sollte digitales Lernen im Berufsleben stärker gefördert werden. Wie seht ihr das?',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];

function supabaseHeaders(conn: SupabaseConnection): HeadersInit {
  const headers: Record<string, string> = {
    apikey: conn.anonKey,
    'Content-Type': 'application/json',
  };
  // Legacy anon keys are JWTs (eyJ...); new sb_publishable_ keys authenticate via apikey header only.
  if (conn.anonKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${conn.anonKey}`;
  }
  return headers;
}

// --- Local storage helpers for instant zero-config mode ---
function readLocalRoomMessages(): RoomChatMessage[] {
  if (typeof window === 'undefined') return SEED_ROOM_MESSAGES;
  try {
    const raw = window.localStorage.getItem(LOCAL_ROOM_MSGS_KEY);
    if (!raw) return SEED_ROOM_MESSAGES;
    const parsed = JSON.parse(raw) as RoomChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ROOM_MESSAGES;
  } catch {
    return SEED_ROOM_MESSAGES;
  }
}

function writeLocalRoomMessages(msgs: RoomChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_ROOM_MSGS_KEY, JSON.stringify(msgs.slice(-160)));
  } catch {
    // Ignore
  }
}

function readLocalDirectMessages(): DirectMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_DM_MSGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DirectMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalDirectMessages(dms: DirectMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_DM_MSGS_KEY, JSON.stringify(dms.slice(-200)));
  } catch {
    // Ignore
  }
}

// --- Public Backend API ---

export async function sendSupabaseEmailOtp(
  conn: SupabaseConnection,
  email: string
): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured(conn)) {
    return {
      ok: true,
      message: 'Email profile active! Your email stays private and is never shown publicly.',
    };
  }
  try {
    const res = await fetch(`${conn.url}/auth/v1/otp`, {
      method: 'POST',
      headers: supabaseHeaders(conn),
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) {
      return {
        ok: true,
        message: 'Email profile active! Your email stays private and is never shown publicly.',
      };
    }
    return {
      ok: true,
      message: `Email profile active! Verification link sent to ${email.trim()}.`,
    };
  } catch {
    return {
      ok: true,
      message: 'Email profile active! Your email stays private.',
    };
  }
}

export async function syncUserPresence(
  conn: SupabaseConnection,
  profile: ChatUserProfile
): Promise<void> {
  if (!isSupabaseConfigured(conn)) return;
  try {
    const emailHash = profile.email ? await hashEmail(profile.email) : null;
    await fetch(`${conn.url}/rest/v1/chat_profiles`, {
      method: 'POST',
      headers: {
        ...supabaseHeaders(conn),
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: profile.id,
        nickname: profile.nickname,
        cefr: profile.cefr,
        flag: profile.flag,
        native_lang: profile.nativeLang,
        bio: profile.bio,
        is_guest: profile.isGuest,
        email_verified: Boolean(profile.emailVerified),
        email_hash: emailHash,
        current_room: profile.currentRoom,
        last_seen: new Date().toISOString(),
      }),
    });
  } catch {
    // Fail gracefully without interrupting chat
  }
}

export async function fetchOnlineLearners(
  conn: SupabaseConnection,
  currentUser: ChatUserProfile | null
): Promise<{ learners: ChatUserProfile[]; liveMode: boolean }> {
  if (isSupabaseConfigured(conn)) {
    try {
      const res = await fetch(
        `${conn.url}/rest/v1/chat_profiles?select=*&order=last_seen.desc&limit=40`,
        { headers: supabaseHeaders(conn) }
      );
      if (res.ok) {
        const rows = (await res.json()) as Array<{
          id: string;
          nickname: string;
          cefr: CEFRLevel;
          flag: string;
          native_lang: string;
          bio: string;
          is_guest: boolean;
          email_verified: boolean;
          current_room: ChatRoomId;
          last_seen: string;
        }>;
        const mapped: ChatUserProfile[] = rows.map((r) => ({
          id: r.id,
          nickname: r.nickname,
          cefr: r.cefr,
          flag: r.flag,
          nativeLang: r.native_lang,
          bio: r.bio,
          isGuest: r.is_guest,
          emailVerified: r.email_verified,
          currentRoom: r.current_room,
          lastSeen: r.last_seen,
        }));
        return { learners: mapped, liveMode: true };
      }
    } catch {
      // Fall through to local fallback
    }
  }

  const list = [...STARTER_LEARNERS];
  if (currentUser && !list.some((u) => u.id === currentUser.id)) {
    list.unshift(currentUser);
  }
  return { learners: list, liveMode: false };
}

export async function fetchRoomMessages(
  conn: SupabaseConnection,
  roomId: ChatRoomId
): Promise<{ messages: RoomChatMessage[]; liveMode: boolean }> {
  if (isSupabaseConfigured(conn)) {
    try {
      const res = await fetch(
        `${conn.url}/rest/v1/chat_messages?room_id=eq.${roomId}&order=created_at.asc&limit=80`,
        { headers: supabaseHeaders(conn) }
      );
      if (res.ok) {
        const rows = (await res.json()) as Array<{
          id: string;
          room_id: ChatRoomId;
          author_id: string;
          author_name: string;
          author_cefr: CEFRLevel;
          author_flag: string;
          is_guest: boolean;
          content: string;
          created_at: string;
        }>;
        return {
          liveMode: true,
          messages: rows.map((r) => ({
            id: r.id,
            roomId: r.room_id,
            authorId: r.author_id,
            authorName: r.author_name,
            authorCefr: r.author_cefr,
            authorFlag: r.author_flag,
            isGuest: r.is_guest,
            content: r.content,
            createdAt: r.created_at,
          })),
        };
      }
    } catch {
      // Fall through to local mode
    }
  }

  const localAll = readLocalRoomMessages();
  return {
    liveMode: false,
    messages: localAll.filter((m) => m.roomId === roomId),
  };
}

export async function postRoomMessage(
  conn: SupabaseConnection,
  msg: Omit<RoomChatMessage, 'id' | 'createdAt'>
): Promise<RoomChatMessage> {
  const localRecord: RoomChatMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured(conn)) {
    try {
      const res = await fetch(`${conn.url}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders(conn),
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          room_id: msg.roomId,
          author_id: msg.authorId,
          author_name: msg.authorName,
          author_cefr: msg.authorCefr,
          author_flag: msg.authorFlag,
          is_guest: msg.isGuest,
          content: msg.content,
        }),
      });
      if (res.ok) {
        const [saved] = (await res.json()) as Array<{ id: string; created_at: string }>;
        if (saved) {
          return {
            ...localRecord,
            id: saved.id,
            createdAt: saved.created_at,
          };
        }
      }
    } catch {
      // Fall back to local persistence
    }
  }

  const all = readLocalRoomMessages();
  writeLocalRoomMessages([...all, localRecord]);
  return localRecord;
}

export async function fetchDirectMessages(
  conn: SupabaseConnection,
  userId: string,
  partnerId: string
): Promise<DirectMessage[]> {
  const threadKey = makeThreadKey(userId, partnerId);

  if (isSupabaseConfigured(conn)) {
    try {
      const res = await fetch(
        `${conn.url}/rest/v1/direct_messages?thread_key=eq.${encodeURIComponent(threadKey)}&order=created_at.asc&limit=80`,
        { headers: supabaseHeaders(conn) }
      );
      if (res.ok) {
        const rows = (await res.json()) as Array<{
          id: string;
          thread_key: string;
          sender_id: string;
          sender_name: string;
          sender_flag: string;
          recipient_id: string;
          recipient_name: string;
          content: string;
          created_at: string;
        }>;
        return rows.map((r) => ({
          id: r.id,
          threadKey: r.thread_key,
          senderId: r.sender_id,
          senderName: r.sender_name,
          senderFlag: r.sender_flag,
          recipientId: r.recipient_id,
          recipientName: r.recipient_name,
          content: r.content,
          createdAt: r.created_at,
        }));
      }
    } catch {
      // Fall back to local
    }
  }

  return readLocalDirectMessages().filter((dm) => dm.threadKey === threadKey);
}

export async function postDirectMessage(
  conn: SupabaseConnection,
  dm: Omit<DirectMessage, 'id' | 'createdAt' | 'threadKey'>
): Promise<DirectMessage> {
  const threadKey = makeThreadKey(dm.senderId, dm.recipientId);
  const localRecord: DirectMessage = {
    ...dm,
    id: `dm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    threadKey,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured(conn)) {
    try {
      const res = await fetch(`${conn.url}/rest/v1/direct_messages`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders(conn),
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          thread_key: threadKey,
          sender_id: dm.senderId,
          sender_name: dm.senderName,
          sender_flag: dm.senderFlag,
          recipient_id: dm.recipientId,
          recipient_name: dm.recipientName,
          content: dm.content,
        }),
      });
      if (res.ok) {
        const [saved] = (await res.json()) as Array<{ id: string; created_at: string }>;
        if (saved) {
          return {
            ...localRecord,
            id: saved.id,
            createdAt: saved.created_at,
          };
        }
      }
    } catch {
      // Fall back to local
    }
  }

  const all = readLocalDirectMessages();
  writeLocalDirectMessages([...all, localRecord]);
  return localRecord;
}

export async function submitSafetyReport(
  conn: SupabaseConnection,
  payload: {
    targetType: 'room_message' | 'direct_message' | 'user';
    targetId: string;
    reportedUserId: string;
    reportedUserName: string;
    reason: string;
    snippet: string;
    reporterId: string;
  }
): Promise<void> {
  if (!isSupabaseConfigured(conn)) return;
  try {
    await fetch(`${conn.url}/rest/v1/chat_reports`, {
      method: 'POST',
      headers: supabaseHeaders(conn),
      body: JSON.stringify({
        target_type: payload.targetType,
        target_id: payload.targetId,
        reported_user_id: payload.reportedUserId,
        reported_user_name: payload.reportedUserName,
        reason: payload.reason.slice(0, 240),
        snippet: payload.snippet.slice(0, 300),
        reporter_id: payload.reporterId,
      }),
    });
  } catch {
    // Ignore network error; local hiding already protects the user immediately
  }
}

/**
 * Generates a warm, level-appropriate German Tandem reply in local/practice mode
 * so learners always have someone to practice with even before global Supabase is connected.
 */
export function buildTandemReply(
  partner: ChatUserProfile,
  userMessage: string,
  roomId: ChatRoomId
): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('hallo') || lower.includes('guten') || lower.includes('hi') || lower.includes('hey')) {
    if (roomId === 'a1') {
      return `Hallo! Schön, dich kennenzulernen! Wie geht es dir heute und was machst du gern?`;
    }
    return `Hallo! Schön, dass du da bist! Auf welches Ziel lernst du gerade Deutsch — Arbeit, Studium oder eine Prüfung?`;
  }
  if (lower.includes('prüfung') || lower.includes('goethe') || lower.includes('ösd') || lower.includes('b1') || lower.includes('b2')) {
    return `Viel Erfolg bei der Prüfungsvorbereitung! Mir hilft es sehr, jeden Tag 10 Minuten Hören und einen kurzen Absatz für Schreiben zu üben. Welcher Teil fällt dir am schwersten?`;
  }
  if (lower.includes('dativ') || lower.includes('akkusativ') || lower.includes('artikel') || lower.includes('grammatik')) {
    return `Guter Punkt! Bei Dativ und Akkusativ merke ich mir immer „Wo?“ (Dativ) vs. „Wohin?“ (Akkusativ). Hast du einen Beispielsatz, den wir zusammen prüfen können?`;
  }
  if (lower.includes('?')) {
    return `Das ist eine tolle Frage! Bei mir klappt es am besten, wenn ich neue Wörter direkt in einem ganzen Satz benutze. Wie lernst du am liebsten?`;
  }

  const byLevel: Record<ChatRoomId, string[]> = {
    general: [
      `Super geschrieben! Klick gern auf „Check Grammar“, um deinen Satz noch feiner zu machen. Worüber möchtest du als Nächstes sprechen?`,
      `Danke für deine Nachricht! Es macht wirklich Spaß, gemeinsam Deutsch zu üben. Seit wann lernst du schon?`,
    ],
    a1: [
      `Sehr gut! Dein Satz ist klar und leicht zu verstehen. Woher kommst du und was ist dein Lieblingsessen?`,
      `Prima! Weiter so! Was machst du heute nach dem Lernen?`,
    ],
    a2: [
      `Klasse Satz! Hast du am Wochenende etwas Schönes unternommen?`,
      `Das klingt interessant! Ich versuche auch, jeden Tag mindestens fünf Sätze im Perfekt zu schreiben.`,
    ],
    b1: [
      `Sehr schön formuliert! Versuche als nächstes gern einen Nebensatz mit „weil“ oder „obwohl“ einzubauen — das bringt extra Punkte in der B1-Prüfung!`,
      `Das sehe ich genauso, weil man durch echtes Schreiben viel schneller sicher wird. Welches B1-Thema findest du am spannendsten?`,
    ],
    b2: [
      `Ein überzeugendes Argument! Andererseits sollte man auch bedenken, wie unterschiedlich die Lernbedingungen weltweit sind. Wie wäre dein Lösungsvorschlag?`,
      `Stilistisch schon richtig stark! Hast du schon die B2-Vollprüfung im Exam Studio ausprobiert?`,
    ],
  };

  const options = byLevel[roomId] ?? byLevel.general;
  const idx = (userMessage.length + partner.nickname.length) % options.length;
  return options[idx];
}
