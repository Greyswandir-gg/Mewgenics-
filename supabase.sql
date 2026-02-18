-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Branches
create table if not exists public.branches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cats
create table if not exists public.cats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  name text not null,
  age integer default 0,
  level integer default 1,
  temperament text,
  genes_stats jsonb default '{}'::jsonb,
  tags text[] default array[]::text[],
  love_cat_id uuid,
  enemy_cat_id uuid,
  mother_id uuid,
  father_id uuid,
  equipped_collar_id text,
  is_archived boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Events
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  type text not null,
  stat_key text,
  delta integer,
  rel_kind text,
  rel_from uuid,
  rel_to uuid,
  note text,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Team presets
create table if not exists public.team_presets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  members jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Updated_at trigger for branches and cats
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_branches on public.branches;
create trigger set_updated_at_branches
before update on public.branches
for each row execute procedure public.touch_updated_at();

drop trigger if exists set_updated_at_cats on public.cats;
create trigger set_updated_at_cats
before update on public.cats
for each row execute procedure public.touch_updated_at();

-- RLS
alter table public.branches enable row level security;
alter table public.cats enable row level security;
alter table public.events enable row level security;
alter table public.team_presets enable row level security;

create policy "branches by owner" on public.branches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cats by owner" on public.cats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "events by owner" on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "presets by owner" on public.team_presets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed default collars on client; no DB table required.

-- Gender for cats
alter table if exists public.cats add column if not exists gender text default 'unknown';

-- Tag presets
create table if not exists public.tag_presets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default '#000000'
);

alter table public.tag_presets enable row level security;
create policy "tag_presets by owner" on public.tag_presets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
