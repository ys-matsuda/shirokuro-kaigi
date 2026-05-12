-- Existing Supabase projects can run this once before using generated room URLs.
-- New installs can run supabase/schema.sql instead.

alter table public.rooms
  add column if not exists expires_at timestamptz;

create index if not exists rooms_expires_at_idx
  on public.rooms(expires_at)
  where expires_at is not null;
