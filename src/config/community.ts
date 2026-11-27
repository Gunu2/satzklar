/**
 * Community, Real Multi-User Chat & Support Configuration for SatzKlar.
 *
 * 1. Global Real-Time Multi-User Chat (100% Free Supabase Tier):
 *    Paste your public Supabase Project URL & Anon Key below (or inside Settings)
 *    to connect all visitors on satzklar.my.id into real live rooms, online learner
 *    profiles, 1-on-1 private chats, and safety reports!
 *
 * 2. Creator Tip / Support Links:
 *    Replace the URLs below with your real Saweria / Ko-fi / Trakteer links.
 */
export const COMMUNITY_CONFIG = {
  supabaseUrl: 'https://ykrxfiojgxulacpkkvan.supabase.co',
  supabaseAnonKey: 'sb_publishable_KCPwps8uKpDKHS1cvZW1NA_-Xhov1Cc',
  tipLinks: [
    {
      id: 'ewallet-id',
      label: 'E-Wallet Indonesia (GoPay / OVO / Dana)',
      copyValue: '081299592294',
      url: '',
      note: 'GoPay, OVO, Dana, ShopeePay · Tap to copy number',
    },
    {
      id: 'paypal-global',
      label: 'PayPal (Global)',
      copyValue: 'chefgemoy@gmail.com',
      url: 'https://www.paypal.com/myaccount/transfer/homepage',
      note: 'International learners · Send via PayPal email',
    },
  ],
  githubDiscussionsUrl: 'https://github.com/Gunu2/satzklar/discussions',
};

export const SUPABASE_SQL_SCHEMA = `-- Run once in Supabase Dashboard -> SQL Editor
-- Creates rooms chat, lightweight email/guest profiles, 1-on-1 private DMs, and safety reports.

create table if not exists public.chat_profiles (
  id text primary key,
  nickname text not null check (char_length(nickname) between 2 and 24),
  cefr text not null check (cefr in ('A1','A2','B1','B2')),
  flag text not null default '🌐',
  native_lang text not null default 'English',
  bio text not null default '' check (char_length(bio) <= 140),
  is_guest boolean not null default true,
  email_verified boolean not null default false,
  email_hash text,
  current_room text not null default 'general',
  last_seen timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null check (room_id in ('general','a1','a2','b1','b2')),
  author_id text not null,
  author_name text not null check (char_length(author_name) between 2 and 24),
  author_cefr text not null check (author_cefr in ('A1','A2','B1','B2')),
  author_flag text not null default '🌐',
  is_guest boolean not null default true,
  content text not null check (
    char_length(content) between 1 and 500
    and content !~* '(https?://|www\\.|wa\\.me|t\\.me|discord\\.gg)'
  ),
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_room_created
  on public.chat_messages (room_id, created_at desc);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  thread_key text not null,
  sender_id text not null,
  sender_name text not null check (char_length(sender_name) between 2 and 24),
  sender_flag text not null default '🌐',
  recipient_id text not null,
  recipient_name text not null check (char_length(recipient_name) between 2 and 24),
  content text not null check (
    char_length(content) between 1 and 500
    and content !~* '(https?://|www\\.|wa\\.me|t\\.me|discord\\.gg)'
  ),
  created_at timestamptz not null default now()
);

create index if not exists idx_direct_messages_thread_created
  on public.direct_messages (thread_key, created_at desc);

create table if not exists public.chat_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('room_message','direct_message','user')),
  target_id text not null,
  reported_user_id text not null,
  reported_user_name text not null,
  reason text not null check (char_length(reason) between 3 and 240),
  snippet text not null default '' check (char_length(snippet) <= 300),
  reporter_id text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_profiles enable row level security;
alter table public.chat_messages enable row level security;
alter table public.direct_messages enable row level security;
alter table public.chat_reports enable row level security;

create policy "profiles_select_all" on public.chat_profiles for select using (true);
create policy "profiles_insert_all" on public.chat_profiles for insert with check (true);
create policy "profiles_update_all" on public.chat_profiles for update using (true);

create policy "messages_select_all" on public.chat_messages for select using (true);
create policy "messages_insert_clean" on public.chat_messages for insert with check (char_length(content) between 1 and 500);

create policy "dm_select_all" on public.direct_messages for select using (true);
create policy "dm_insert_clean" on public.direct_messages for insert with check (char_length(content) between 1 and 500);

create policy "reports_insert_all" on public.chat_reports for insert with check (true);

create table if not exists public.site_ratings (
  id uuid primary key default gen_random_uuid(),
  stars integer not null check (stars between 1 and 5),
  note text not null default '' check (char_length(note) <= 240),
  created_at timestamptz not null default now()
);

alter table public.site_ratings enable row level security;
create policy "ratings_select_all" on public.site_ratings for select using (true);
create policy "ratings_insert_all" on public.site_ratings for insert with check (stars between 1 and 5);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.chat_profiles to anon, authenticated;
grant select, insert on public.chat_messages to anon, authenticated;
grant select, insert on public.direct_messages to anon, authenticated;
grant insert on public.chat_reports to anon, authenticated;
grant select, insert on public.site_ratings to anon, authenticated;
`;
