-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Admin account: admin@tapineg.com (create it under Authentication -> Users, tick "Auto Confirm User").

create table if not exists public.places (
  id text primary key,
  position int not null default 0,
  data jsonb not null
);

create table if not exists public.site_settings (
  id int primary key default 1,
  data jsonb not null,
  constraint single_row check (id = 1)
);

alter table public.places enable row level security;
alter table public.site_settings enable row level security;

-- Everyone (visitors tapping an NFC card) can read
create policy "public read places" on public.places for select using (true);
create policy "public read settings" on public.site_settings for select using (true);

-- Only the admin can write
create policy "admin write places" on public.places for all to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@tapineg.com')
  with check ((auth.jwt() ->> 'email') = 'admin@tapineg.com');

create policy "admin write settings" on public.site_settings for all to authenticated
  using ((auth.jwt() ->> 'email') = 'admin@tapineg.com')
  with check ((auth.jwt() ->> 'email') = 'admin@tapineg.com');

-- Storage bucket for logos and menus (public read, admin write)
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "admin upload files" on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and (auth.jwt() ->> 'email') = 'admin@tapineg.com');
create policy "admin update files" on storage.objects for update to authenticated
  using (bucket_id = 'uploads' and (auth.jwt() ->> 'email') = 'admin@tapineg.com');
create policy "admin delete files" on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and (auth.jwt() ->> 'email') = 'admin@tapineg.com');
