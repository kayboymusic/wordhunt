-- WordHunt schema
-- Run this in the Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

-- ── daily_words ──────────────────────────────────────────────────────────────
create table if not exists daily_words (
  id         uuid primary key default gen_random_uuid(),
  word       text not null check (length(word) = 5),
  date       date unique not null,
  created_at timestamptz default now()
);

-- ── game_sessions ─────────────────────────────────────────────────────────────
create table if not exists game_sessions (
  id           uuid primary key default gen_random_uuid(),
  player_token text not null,
  player_email text,
  challenge_id uuid,
  game_date    date not null,
  guesses      jsonb not null default '[]',
  status       text not null default 'playing'
               check (status in ('playing', 'won', 'lost')),
  created_at   timestamptz default now(),
  completed_at timestamptz,
  unique (player_token, game_date)
);

-- ── challenges ────────────────────────────────────────────────────────────────
create table if not exists challenges (
  id                  uuid primary key default gen_random_uuid(),
  invite_token        text unique not null,
  creator_email       text not null,
  opponent_email      text not null,
  status              text not null default 'pending'
                      check (status in ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired')),
  creator_session_id  uuid references game_sessions(id) on delete set null,
  opponent_session_id uuid references game_sessions(id) on delete set null,
  game_date           date not null,
  created_at          timestamptz default now(),
  expires_at          timestamptz not null
);

-- Add FK from game_sessions → challenges (after challenges table exists)
alter table game_sessions
  add constraint fk_challenge
  foreign key (challenge_id)
  references challenges(id)
  on delete set null;

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Game sessions: read/write only via service role (API routes use service role key)
alter table game_sessions enable row level security;
alter table challenges enable row level security;
alter table daily_words enable row level security;

-- Service role bypasses RLS automatically in Supabase
-- No public policies needed since all DB access is via server-side service role client
