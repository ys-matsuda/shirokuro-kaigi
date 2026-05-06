-- Supabase schema for 白黒つけない会議.
-- Run this in the Supabase SQL editor when the project is ready.

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id text primary key,
  name text not null,
  topic text not null,
  left_label text not null,
  right_label text not null,
  active_speaker_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.speakers (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id) on delete cascade,
  name text not null,
  initial text not null,
  value integer not null default 50 check (value between 0 and 100),
  color text not null,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, display_order)
);

create table if not exists public.audience_votes (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id) on delete cascade,
  voter_id text not null,
  name text not null default '自分',
  value integer not null check (value between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, voter_id)
);

create index if not exists speakers_room_order_idx
  on public.speakers(room_id, display_order);

create index if not exists audience_votes_room_value_idx
  on public.audience_votes(room_id, value);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rooms_touch_updated_at on public.rooms;
create trigger rooms_touch_updated_at
before update on public.rooms
for each row execute function public.touch_updated_at();

drop trigger if exists speakers_touch_updated_at on public.speakers;
create trigger speakers_touch_updated_at
before update on public.speakers
for each row execute function public.touch_updated_at();

drop trigger if exists audience_votes_touch_updated_at on public.audience_votes;
create trigger audience_votes_touch_updated_at
before update on public.audience_votes
for each row execute function public.touch_updated_at();

alter table public.rooms enable row level security;
alter table public.speakers enable row level security;
alter table public.audience_votes enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.rooms to anon, authenticated;
grant select, insert, update, delete on public.speakers to anon, authenticated;
grant select, insert, update, delete on public.audience_votes to anon, authenticated;

drop policy if exists rooms_public_select on public.rooms;
create policy rooms_public_select
on public.rooms for select
using (true);

drop policy if exists rooms_public_update on public.rooms;
create policy rooms_public_update
on public.rooms for update
using (true)
with check (true);

drop policy if exists speakers_public_select on public.speakers;
create policy speakers_public_select
on public.speakers for select
using (true);

drop policy if exists speakers_public_insert on public.speakers;
create policy speakers_public_insert
on public.speakers for insert
with check (true);

drop policy if exists speakers_public_update on public.speakers;
create policy speakers_public_update
on public.speakers for update
using (true)
with check (true);

drop policy if exists speakers_public_delete on public.speakers;
create policy speakers_public_delete
on public.speakers for delete
using (true);

drop policy if exists audience_votes_public_select on public.audience_votes;
create policy audience_votes_public_select
on public.audience_votes for select
using (true);

drop policy if exists audience_votes_public_insert on public.audience_votes;
create policy audience_votes_public_insert
on public.audience_votes for insert
with check (true);

drop policy if exists audience_votes_public_update on public.audience_votes;
create policy audience_votes_public_update
on public.audience_votes for update
using (true)
with check (true);

drop policy if exists audience_votes_public_delete on public.audience_votes;
create policy audience_votes_public_delete
on public.audience_votes for delete
using (true);

alter table public.rooms replica identity full;
alter table public.speakers replica identity full;
alter table public.audience_votes replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      public.rooms,
      public.speakers,
      public.audience_votes;
  end if;
exception
  when duplicate_object then null;
end;
$$;

insert into public.rooms (id, name, topic, left_label, right_label)
values (
  'main',
  'メイン会場',
  '酔って失言した人を許せる？',
  '許せない',
  '許せる'
)
on conflict (id) do nothing;

insert into public.speakers
  (id, room_id, name, initial, value, color, display_order)
values
  ('00000000-0000-4000-8000-000000000001', 'main', 'スピーカー1', '1', 50, '#47b8ff', 1),
  ('00000000-0000-4000-8000-000000000002', 'main', 'スピーカー2', '2', 50, '#8f7cff', 2),
  ('00000000-0000-4000-8000-000000000003', 'main', 'スピーカー3', '3', 50, '#f3d26f', 3),
  ('00000000-0000-4000-8000-000000000004', 'main', 'スピーカー4', '4', 50, '#ff6b9a', 4),
  ('00000000-0000-4000-8000-000000000005', 'main', 'スピーカー5', '5', 50, '#7dd3fc', 5)
on conflict (id) do nothing;

update public.rooms
set active_speaker_id = '00000000-0000-4000-8000-000000000001'
where id = 'main' and active_speaker_id is null;
