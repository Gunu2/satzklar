/**
 * Tandem-Style Language Party Backend (Zero Extra Dependencies).
 *
 * Supports:
 * - Global Multi-User Live Parties via Supabase REST (`party_rooms`, `party_participants`,
 *   `party_messages`, `party_signals`) with full Host & Moderator permissions.
 * - Instant Local + Multi-Tab (`BroadcastChannel`) fallback until the Party SQL tables
 *   are created in Supabase.
 */
import type { CEFRLevel } from '../types/grammar';
import {
  isSupabaseConfigured,
  type ChatUserProfile,
  type SupabaseConnection,
} from './chatBackend';

export type PartyCefr = 'ALL' | CEFRLevel;
export type PartyRole = 'host' | 'mod' | 'speaker' | 'listener';

export interface PartyRoom {
  id: string;
  title: string;
  topicPrompt: string;
  cefr: PartyCefr;
  hostId: string;
  hostName: string;
  hostFlag: string;
  maxSeats: number; // 4, 6, or 8
  seatsLocked: boolean; // true = listeners must Raise Hand & Host/Mod approves
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartyParticipant {
  id: string; // `${partyId}::${userId}`
  partyId: string;
  userId: string;
  nickname: string;
  flag: string;
  cefr: CEFRLevel;
  role: PartyRole;
  seatIndex: number | null; // 0..(maxSeats-1) when on stage, null when in audience
  micOn: boolean;
  handRaised: boolean;
  mutedByMod: boolean;
  kicked: boolean;
  lastSeen: string;
  isDemoPeer?: boolean;
}

export interface PartyMessage {
  id: string;
  partyId: string;
  authorId: string;
  authorName: string;
  authorFlag: string;
  authorRole: PartyRole;
  content: string;
  createdAt: string;
}

export interface PartySignal {
  id: string;
  partyId: string;
  fromUserId: string;
  toUserId: string;
  signalType: 'offer' | 'answer' | 'ice';
  payload: Record<string, unknown>;
  createdAt: string;
}

export const PARTY_ICEBREAKERS: Record<PartyCefr, string[]> = {
  ALL: [
    'Stell dich kurz vor: Woher kommst du und warum lernst du Deutsch?',
    'Was war heute das Schönste, das du erlebt hast?',
    'Welches deutsche Wort findest du besonders lustig oder schwierig?',
  ],
  A1: [
    'Wie heißt du, wo wohnst du und was trinkst du morgens gern?',
    'Was machst du am Wochenende gern in deiner Freizeit?',
    'Beschreibe dein Zimmer oder deinen Lieblingsort in 3 Sätzen!',
  ],
  A2: [
    'Erzähl im Perfekt: Was hast du letztes Wochenende gemacht?',
    'Wohin möchtest du gern einmal reisen und warum?',
    'Wie kommst du normalerweise zur Arbeit oder zur Uni?',
  ],
  B1: [
    'Goethe B1 Sprechen: Plant gemeinsam einen Tagesausflug am Samstag!',
    'Vor- und Nachteile: Ist Homeoffice besser als Arbeiten im Büro?',
    'Wie können wir im Alltag umweltfreundlicher leben?',
  ],
  B2: [
    'B2 Debatte: Sollte künstliche Intelligenz im Sprachunterricht erlaubt sein?',
    'Wie lässt sich der Fachkräftemangel langfristig am besten lösen?',
    'Einerseits ... andererseits: Leben in der Großstadt vs. auf dem Land.',
  ],
};

export const PARTY_SQL_SCHEMA = `-- Run once in Supabase SQL Editor to enable live global Tandem-style Language Parties!

create table if not exists public.party_rooms (
  id text primary key,
  title text not null check (char_length(title) between 3 and 80),
  topic_prompt text not null default '' check (char_length(topic_prompt) <= 200),
  cefr text not null check (cefr in ('ALL','A1','A2','B1','B2')),
  host_id text not null,
  host_name text not null,
  host_flag text not null default '🌐',
  max_seats integer not null default 6 check (max_seats between 2 and 8),
  seats_locked boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.party_participants (
  id text primary key,
  party_id text not null references public.party_rooms(id) on delete cascade,
  user_id text not null,
  nickname text not null,
  flag text not null default '🌐',
  cefr text not null default 'A2',
  role text not null check (role in ('host','mod','speaker','listener')),
  seat_index integer,
  mic_on boolean not null default false,
  hand_raised boolean not null default false,
  muted_by_mod boolean not null default false,
  kicked boolean not null default false,
  last_seen timestamptz not null default now()
);

create index if not exists idx_party_participants_party
  on public.party_participants (party_id, last_seen desc);

create table if not exists public.party_messages (
  id uuid primary key default gen_random_uuid(),
  party_id text not null references public.party_rooms(id) on delete cascade,
  author_id text not null,
  author_name text not null,
  author_flag text not null default '🌐',
  author_role text not null default 'listener',
  content text not null check (
    char_length(content) between 1 and 500
    and content !~* '(https?://|www\\.|wa\\.me|t\\.me|discord\\.gg)'
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.party_signals (
  id uuid primary key default gen_random_uuid(),
  party_id text not null references public.party_rooms(id) on delete cascade,
  from_user_id text not null,
  to_user_id text not null,
  signal_type text not null check (signal_type in ('offer','answer','ice')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_party_signals_to
  on public.party_signals (party_id, to_user_id, created_at asc);

alter table public.party_rooms enable row level security;
alter table public.party_participants enable row level security;
alter table public.party_messages enable row level security;
alter table public.party_signals enable row level security;

create policy "party_rooms_all" on public.party_rooms for all using (true) with check (true);
create policy "party_participants_all" on public.party_participants for all using (true) with check (true);
create policy "party_messages_all" on public.party_messages for all using (true) with check (true);
create policy "party_signals_all" on public.party_signals for all using (true) with check (true);

grant select, insert, update, delete on public.party_rooms to anon, authenticated;
grant select, insert, update, delete on public.party_participants to anon, authenticated;
grant select, insert, update, delete on public.party_messages to anon, authenticated;
grant select, insert, update, delete on public.party_signals to anon, authenticated;
`;

const LOCAL_PARTIES_KEY = 'satzklar_local_parties_v1';
const LOCAL_PARTICIPANTS_KEY = 'satzklar_local_party_participants_v1';
const LOCAL_PARTY_MSGS_KEY = 'satzklar_local_party_msgs_v1';

function buildHeaders(conn: SupabaseConnection): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: conn.anonKey,
    'Content-Type': 'application/json',
  };
  if (conn.anonKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${conn.anonKey}`;
  }
  return headers;
}

const STARTER_PARTIES: PartyRoom[] = [
  {
    id: 'party-kaffeeklatsch-all',
    title: '☕ Kaffeeklatsch: Stell dich auf Deutsch vor!',
    topicPrompt: 'Stell dich kurz vor: Woher kommst du und warum lernst du Deutsch?',
    cefr: 'ALL',
    hostId: 'buddy-lena-de',
    hostName: 'Lena (Host)',
    hostFlag: '🇩🇪',
    maxSeats: 6,
    seatsLocked: false,
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'party-goethe-b1',
    title: '🎯 Goethe / ÖSD B1 Sprechen & Alltag',
    topicPrompt: 'Plant gemeinsam einen Wochenendausflug und begründet eure Ideen!',
    cefr: 'B1',
    hostId: 'buddy-raka-id',
    hostName: 'Raka_ID',
    hostFlag: '🇮🇩',
    maxSeats: 6,
    seatsLocked: false,
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'party-a1-beginner',
    title: '🌱 A1 Slow Speaking Circle (No Pressure!)',
    topicPrompt: 'Wie heißt du, was machst du gern und was isst du am liebsten?',
    cefr: 'A1',
    hostId: 'buddy-kenji-jp',
    hostName: 'Kenji_A1',
    hostFlag: '🇯🇵',
    maxSeats: 4,
    seatsLocked: false,
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STARTER_PARTICIPANTS: PartyParticipant[] = [
  {
    id: 'party-kaffeeklatsch-all::buddy-lena-de',
    partyId: 'party-kaffeeklatsch-all',
    userId: 'buddy-lena-de',
    nickname: 'Lena (Host)',
    flag: '🇩🇪',
    cefr: 'B2',
    role: 'host',
    seatIndex: 0,
    micOn: true,
    handRaised: false,
    mutedByMod: false,
    kicked: false,
    lastSeen: new Date().toISOString(),
    isDemoPeer: true,
  },
  {
    id: 'party-kaffeeklatsch-all::buddy-sofia-es',
    partyId: 'party-kaffeeklatsch-all',
    userId: 'buddy-sofia-es',
    nickname: 'Sofia_A2',
    flag: '🇪🇸',
    cefr: 'A2',
    role: 'mod',
    seatIndex: 1,
    micOn: false,
    handRaised: false,
    mutedByMod: false,
    kicked: false,
    lastSeen: new Date().toISOString(),
    isDemoPeer: true,
  },
  {
    id: 'party-goethe-b1::buddy-raka-id',
    partyId: 'party-goethe-b1',
    userId: 'buddy-raka-id',
    nickname: 'Raka_ID',
    flag: '🇮🇩',
    cefr: 'B1',
    role: 'host',
    seatIndex: 0,
    micOn: true,
    handRaised: false,
    mutedByMod: false,
    kicked: false,
    lastSeen: new Date().toISOString(),
    isDemoPeer: true,
  },
  {
    id: 'party-a1-beginner::buddy-kenji-jp',
    partyId: 'party-a1-beginner',
    userId: 'buddy-kenji-jp',
    nickname: 'Kenji_A1',
    flag: '🇯🇵',
    cefr: 'A1',
    role: 'host',
    seatIndex: 0,
    micOn: false,
    handRaised: false,
    mutedByMod: false,
    kicked: false,
    lastSeen: new Date().toISOString(),
    isDemoPeer: true,
  },
];

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage error
  }
}

// Tracks whether the optional Party SQL tables exist on the configured Supabase project.
// Avoids repeated 404 network delays & write races before the user runs PARTY_SQL_SCHEMA.
let cachedPartyTablesStatus: 'unknown' | 'ready' | 'missing' = 'unknown';

function shouldUseSupabaseParty(conn: SupabaseConnection): boolean {
  return isSupabaseConfigured(conn) && cachedPartyTablesStatus !== 'missing';
}

export async function fetchActiveParties(
  conn: SupabaseConnection
): Promise<{ rooms: PartyRoom[]; liveDbReady: boolean }> {
  if (shouldUseSupabaseParty(conn)) {
    try {
      const res = await fetch(
        `${conn.url}/rest/v1/party_rooms?is_active=eq.true&order=updated_at.desc&limit=30`,
        { headers: buildHeaders(conn) }
      );
      if (res.ok) {
        cachedPartyTablesStatus = 'ready';
        const rows = (await res.json()) as Array<{
          id: string;
          title: string;
          topic_prompt: string;
          cefr: PartyCefr;
          host_id: string;
          host_name: string;
          host_flag: string;
          max_seats: number;
          seats_locked: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }>;
        const mapped: PartyRoom[] = rows.map((r) => ({
          id: r.id,
          title: r.title,
          topicPrompt: r.topic_prompt,
          cefr: r.cefr,
          hostId: r.host_id,
          hostName: r.host_name,
          hostFlag: r.host_flag,
          maxSeats: r.max_seats,
          seatsLocked: r.seats_locked,
          isActive: r.is_active,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
        return { rooms: mapped, liveDbReady: true };
      }
      if (res.status === 404) {
        cachedPartyTablesStatus = 'missing';
      }
    } catch {
      // Fall through to local fallback
    }
  }

  const localRooms = readLocal<PartyRoom[]>(LOCAL_PARTIES_KEY, STARTER_PARTIES).filter(
    (r) => r.isActive
  );
  return { rooms: localRooms.length ? localRooms : STARTER_PARTIES, liveDbReady: false };
}

export async function createPartyRoom(
  conn: SupabaseConnection,
  host: ChatUserProfile,
  opts: { title: string; cefr: PartyCefr; maxSeats: number; topicPrompt: string; seatsLocked: boolean }
): Promise<{ room: PartyRoom; liveDbReady: boolean }> {
  const now = new Date().toISOString();
  const room: PartyRoom = {
    id: `party_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: opts.title.trim(),
    topicPrompt:
      opts.topicPrompt.trim() ||
      PARTY_ICEBREAKERS[opts.cefr][0],
    cefr: opts.cefr,
    hostId: host.id,
    hostName: host.nickname,
    hostFlag: host.flag,
    maxSeats: opts.maxSeats,
    seatsLocked: opts.seatsLocked,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  if (shouldUseSupabaseParty(conn)) {
    try {
      const res = await fetch(`${conn.url}/rest/v1/party_rooms`, {
        method: 'POST',
        headers: { ...buildHeaders(conn), Prefer: 'return=minimal' },
        body: JSON.stringify({
          id: room.id,
          title: room.title,
          topic_prompt: room.topicPrompt,
          cefr: room.cefr,
          host_id: room.hostId,
          host_name: room.hostName,
          host_flag: room.hostFlag,
          max_seats: room.maxSeats,
          seats_locked: room.seatsLocked,
          is_active: true,
          created_at: now,
          updated_at: now,
        }),
      });
      if (res.ok) {
        return { room, liveDbReady: true };
      }
    } catch {
      // Fall back locally
    }
  }

  const existing = readLocal<PartyRoom[]>(LOCAL_PARTIES_KEY, STARTER_PARTIES);
  writeLocal(LOCAL_PARTIES_KEY, [room, ...existing]);
  return { room, liveDbReady: false };
}

export async function updatePartyRoomSettings(
  conn: SupabaseConnection,
  partyId: string,
  patch: Partial<Pick<PartyRoom, 'seatsLocked' | 'isActive' | 'topicPrompt'>>
): Promise<void> {
  const now = new Date().toISOString();
  if (shouldUseSupabaseParty(conn)) {
    try {
      const body: Record<string, unknown> = { updated_at: now };
      if (patch.seatsLocked !== undefined) body.seats_locked = patch.seatsLocked;
      if (patch.isActive !== undefined) body.is_active = patch.isActive;
      if (patch.topicPrompt !== undefined) body.topic_prompt = patch.topicPrompt;
      const res = await fetch(`${conn.url}/rest/v1/party_rooms?id=eq.${encodeURIComponent(partyId)}`, {
        method: 'PATCH',
        headers: buildHeaders(conn),
        body: JSON.stringify(body),
      });
      if (res.ok) return;
    } catch {
      // Fall back locally
    }
  }

  const existing = readLocal<PartyRoom[]>(LOCAL_PARTIES_KEY, STARTER_PARTIES);
  writeLocal(
    LOCAL_PARTIES_KEY,
    existing.map((r) => (r.id === partyId ? { ...r, ...patch, updatedAt: now } : r))
  );
}

export async function upsertPartyParticipant(
  conn: SupabaseConnection,
  p: PartyParticipant
): Promise<void> {
  if (shouldUseSupabaseParty(conn)) {
    try {
      const res = await fetch(`${conn.url}/rest/v1/party_participants`, {
        method: 'POST',
        headers: { ...buildHeaders(conn), Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({
          id: p.id,
          party_id: p.partyId,
          user_id: p.userId,
          nickname: p.nickname,
          flag: p.flag,
          cefr: p.cefr,
          role: p.role,
          seat_index: p.seatIndex,
          mic_on: p.micOn,
          hand_raised: p.handRaised,
          muted_by_mod: p.mutedByMod,
          kicked: p.kicked,
          last_seen: new Date().toISOString(),
        }),
      });
      if (res.ok) return;
    } catch {
      // Fall back locally
    }
  }

  const all = readLocal<PartyParticipant[]>(LOCAL_PARTICIPANTS_KEY, STARTER_PARTICIPANTS);
  const filtered = all.filter((x) => x.id !== p.id);
  writeLocal(LOCAL_PARTICIPANTS_KEY, [...filtered, { ...p, lastSeen: new Date().toISOString() }]);
}

export async function removePartyParticipant(
  conn: SupabaseConnection,
  participantId: string
): Promise<void> {
  if (shouldUseSupabaseParty(conn)) {
    try {
      const res = await fetch(
        `${conn.url}/rest/v1/party_participants?id=eq.${encodeURIComponent(participantId)}`,
        { method: 'DELETE', headers: buildHeaders(conn) }
      );
      if (res.ok) return;
    } catch {
      // Fall back locally
    }
  }

  const all = readLocal<PartyParticipant[]>(LOCAL_PARTICIPANTS_KEY, STARTER_PARTICIPANTS);
  writeLocal(
    LOCAL_PARTICIPANTS_KEY,
    all.filter((x) => x.id !== participantId)
  );
}

export async function fetchPartyParticipants(
  conn: SupabaseConnection,
  partyId: string
): Promise<{ participants: PartyParticipant[]; liveDbReady: boolean }> {
  if (shouldUseSupabaseParty(conn)) {
    try {
      // Active participants seen in last 90 seconds
      const cutoff = new Date(Date.now() - 90_000).toISOString();
      const res = await fetch(
        `${conn.url}/rest/v1/party_participants?party_id=eq.${encodeURIComponent(partyId)}&last_seen=gte.${encodeURIComponent(cutoff)}&order=seat_index.asc.nullslast`,
        { headers: buildHeaders(conn) }
      );
      if (res.ok) {
        const rows = (await res.json()) as Array<{
          id: string;
          party_id: string;
          user_id: string;
          nickname: string;
          flag: string;
          cefr: CEFRLevel;
          role: PartyRole;
          seat_index: number | null;
          mic_on: boolean;
          hand_raised: boolean;
          muted_by_mod: boolean;
          kicked: boolean;
          last_seen: string;
        }>;
        return {
          liveDbReady: true,
          participants: rows.map((r) => ({
            id: r.id,
            partyId: r.party_id,
            userId: r.user_id,
            nickname: r.nickname,
            flag: r.flag,
            cefr: r.cefr,
            role: r.role,
            seatIndex: r.seat_index,
            micOn: r.mic_on,
            handRaised: r.hand_raised,
            mutedByMod: r.muted_by_mod,
            kicked: r.kicked,
            lastSeen: r.last_seen,
          })),
        };
      }
    } catch {
      // Fall back locally
    }
  }

  const all = readLocal<PartyParticipant[]>(LOCAL_PARTICIPANTS_KEY, STARTER_PARTICIPANTS);
  return {
    liveDbReady: false,
    participants: all.filter((p) => p.partyId === partyId),
  };
}

export async function fetchPartyMessages(
  conn: SupabaseConnection,
  partyId: string
): Promise<PartyMessage[]> {
  if (shouldUseSupabaseParty(conn)) {
    try {
      const res = await fetch(
        `${conn.url}/rest/v1/party_messages?party_id=eq.${encodeURIComponent(partyId)}&order=created_at.asc&limit=60`,
        { headers: buildHeaders(conn) }
      );
      if (res.ok) {
        const rows = (await res.json()) as Array<{
          id: string;
          party_id: string;
          author_id: string;
          author_name: string;
          author_flag: string;
          author_role: PartyRole;
          content: string;
          created_at: string;
        }>;
        return rows.map((r) => ({
          id: r.id,
          partyId: r.party_id,
          authorId: r.author_id,
          authorName: r.author_name,
          authorFlag: r.author_flag,
          authorRole: r.author_role,
          content: r.content,
          createdAt: r.created_at,
        }));
      }
    } catch {
      // Fall back locally
    }
  }

  return readLocal<PartyMessage[]>(LOCAL_PARTY_MSGS_KEY, []).filter(
    (m) => m.partyId === partyId
  );
}

export async function postPartyMessage(
  conn: SupabaseConnection,
  msg: Omit<PartyMessage, 'id' | 'createdAt'>
): Promise<PartyMessage> {
  const localMsg: PartyMessage = {
    ...msg,
    id: `pmsg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  if (shouldUseSupabaseParty(conn)) {
    try {
      const res = await fetch(`${conn.url}/rest/v1/party_messages`, {
        method: 'POST',
        headers: { ...buildHeaders(conn), Prefer: 'return=representation' },
        body: JSON.stringify({
          party_id: msg.partyId,
          author_id: msg.authorId,
          author_name: msg.authorName,
          author_flag: msg.authorFlag,
          author_role: msg.authorRole,
          content: msg.content,
        }),
      });
      if (res.ok) {
        const [saved] = (await res.json()) as Array<{ id: string; created_at: string }>;
        if (saved) return { ...localMsg, id: saved.id, createdAt: saved.created_at };
      }
    } catch {
      // Fall back locally
    }
  }

  const all = readLocal<PartyMessage[]>(LOCAL_PARTY_MSGS_KEY, []);
  writeLocal(LOCAL_PARTY_MSGS_KEY, [...all.slice(-120), localMsg]);
  return localMsg;
}

// --- WebRTC Signaling via Supabase (`party_signals`) ---

export async function sendPartySignal(
  conn: SupabaseConnection,
  signal: Omit<PartySignal, 'id' | 'createdAt'>
): Promise<void> {
  if (!shouldUseSupabaseParty(conn)) return;
  try {
    await fetch(`${conn.url}/rest/v1/party_signals`, {
      method: 'POST',
      headers: buildHeaders(conn),
      body: JSON.stringify({
        party_id: signal.partyId,
        from_user_id: signal.fromUserId,
        to_user_id: signal.toUserId,
        signal_type: signal.signalType,
        payload: signal.payload,
      }),
    });
  } catch {
    // Ignore transient network errors
  }
}

export async function pollPartySignals(
  conn: SupabaseConnection,
  partyId: string,
  myUserId: string
): Promise<PartySignal[]> {
  if (!isSupabaseConfigured(conn)) return [];
  try {
    const res = await fetch(
      `${conn.url}/rest/v1/party_signals?party_id=eq.${encodeURIComponent(partyId)}&to_user_id=eq.${encodeURIComponent(myUserId)}&order=created_at.asc&limit=40`,
      { headers: buildHeaders(conn) }
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<{
      id: string;
      party_id: string;
      from_user_id: string;
      to_user_id: string;
      signal_type: 'offer' | 'answer' | 'ice';
      payload: Record<string, unknown>;
      created_at: string;
    }>;

    // Clean up consumed signals asynchronously so table stays tiny
    for (const r of rows) {
      void fetch(`${conn.url}/rest/v1/party_signals?id=eq.${encodeURIComponent(r.id)}`, {
        method: 'DELETE',
        headers: buildHeaders(conn),
      }).catch(() => {});
    }

    return rows.map((r) => ({
      id: r.id,
      partyId: r.party_id,
      fromUserId: r.from_user_id,
      toUserId: r.to_user_id,
      signalType: r.signal_type,
      payload: r.payload,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}
