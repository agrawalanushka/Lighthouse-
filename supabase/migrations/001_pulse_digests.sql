-- Pulse digests table (owned by Rishi)
-- Caches Claude-generated personalized news digests per user per week.

create table if not exists pulse_digests (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  week_of     date        not null,
  items       jsonb       not null default '[]',
  generated_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  constraint pulse_digests_user_week_unique unique (user_id, week_of)
);

-- Row-level security: users can only read their own digests.
alter table pulse_digests enable row level security;

create policy "Users can read own digests"
  on pulse_digests for select
  using (auth.uid() = user_id);

-- Service role (used by API routes) bypasses RLS automatically.
