-- ============================================================
-- Deployable — full schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- ── 1. profiles ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text,
  name                 text,
  store_url            text,
  onboarding_complete  boolean not null default false,
  created_at           timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ── 2. integrations ──────────────────────────────────────────────────────────
create table if not exists public.integrations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  provider       text not null,
  access_token   text not null,
  ad_account_id  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.integrations enable row level security;

create policy "Users manage own integrations"
  on public.integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3. sites ─────────────────────────────────────────────────────────────────
create table if not exists public.sites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'My Store',
  domain      text,
  -- short public token used in the pixel script
  site_id     text not null unique default substr(md5(random()::text || gen_random_uuid()::text), 1, 16),
  created_at  timestamptz not null default now()
);

alter table public.sites enable row level security;

-- Authenticated users manage their own sites
create policy "Users manage own sites"
  on public.sites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- The pixel track endpoint (service role) also reads sites — no extra policy needed
-- (service role bypasses RLS).

-- ── 4. events ────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  site_id       text not null,   -- FK enforced at app level (service role insert)
  event_type    text not null,   -- page_view | product_view | add_to_cart | checkout_start | purchase
  anonymous_id  text not null,
  url           text,
  referrer      text,
  metadata      jsonb not null default '{}',
  timestamp     timestamptz not null default now()
);

-- Index for fast per-site queries
create index if not exists events_site_id_idx on public.events (site_id);
create index if not exists events_timestamp_idx on public.events (timestamp);
create index if not exists events_site_ts_idx on public.events (site_id, timestamp desc);

alter table public.events enable row level security;

-- Authenticated users can read events for their own sites
create policy "Users read own events"
  on public.events for select
  using (
    site_id in (
      select site_id from public.sites where user_id = auth.uid()
    )
  );

-- Service role inserts via pixel track endpoint — no RLS policy needed for inserts
-- (the server uses service role key which bypasses RLS)

-- ── 5. Trigger: auto-create profile on new user ───────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 6. Trigger: auto-create site on new profile ───────────────────────────────
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.sites (user_id, name)
  values (new.id, 'My Store')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();
