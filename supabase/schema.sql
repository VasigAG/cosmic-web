-- COSMIC PERSONAL WEB — database schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

-- 1) Who is the owner? Only users listed here can write anything.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
-- (no policies on purpose: nobody can read or change this table through the public API)

create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 2) Site config: ONE row holding every setting + all section content as JSON.
create table if not exists public.site_config (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_config enable row level security;

drop policy if exists "anyone reads config" on public.site_config;
create policy "anyone reads config" on public.site_config for select using (true);
drop policy if exists "owner writes config" on public.site_config;
create policy "owner writes config" on public.site_config for all using (public.is_owner()) with check (public.is_owner());

-- 3) Blog posts (markdown). Drafts are only visible to you.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null default '',
  body text not null default '',
  tags text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;

drop policy if exists "anyone reads published posts" on public.posts;
create policy "anyone reads published posts" on public.posts for select using (published or public.is_owner());
drop policy if exists "owner writes posts" on public.posts;
create policy "owner writes posts" on public.posts for all using (public.is_owner()) with check (public.is_owner());

-- 4) Guestbook: visitors can submit; nothing shows until you approve it.
create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 24),
  message text not null check (char_length(message) between 1 and 280),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.guestbook enable row level security;

drop policy if exists "anyone reads approved entries" on public.guestbook;
create policy "anyone reads approved entries" on public.guestbook for select using (approved or public.is_owner());
drop policy if exists "anyone can submit unapproved" on public.guestbook;
create policy "anyone can submit unapproved" on public.guestbook for insert with check (approved = false);
drop policy if exists "owner manages guestbook" on public.guestbook;
create policy "owner manages guestbook" on public.guestbook for all using (public.is_owner()) with check (public.is_owner());

-- 5) AFTER you create your user (Authentication → Users → Add user), run this
--    once, with YOUR email, to make that user the owner:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'you@example.com'
-- on conflict do nothing;
