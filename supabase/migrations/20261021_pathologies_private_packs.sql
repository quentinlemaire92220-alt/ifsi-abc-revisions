-- Applied in Supabase on 2026-10-21.
-- Private P1 pathology review pack; all content lives in the database, never GitHub Pages.
-- RLS auth.uid() scopes each row to exactly its authenticated owner.
create table if not exists public.pathologies_private_packs (
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 pack_key text not null default 'p1',
 payload jsonb not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint pathologies_private_packs_pkey primary key(owner_id,pack_key),
 constraint pathologies_private_pack_name check(pack_key='p1'),
 constraint pathologies_private_pack_status check(
  payload->>'schema'='ifsi-abc-private-pathologies-p1-v1'
  and payload->'reviewOnly'='true'::jsonb
  and payload->'publicationPermitted'='false'::jsonb
  and payload->>'clinicalReview'='pending'
  and jsonb_typeof(payload->'items')='array'
  and jsonb_array_length(payload->'items')=3
  and pg_column_size(payload)<8388608
 )
);
alter table public.pathologies_private_packs enable row level security;
revoke all on public.pathologies_private_packs from public, anon;
grant select,insert,update,delete on public.pathologies_private_packs to authenticated;
drop policy if exists "Owner read personal pathologies" on public.pathologies_private_packs;
drop policy if exists "Owner upload personal pathologies" on public.pathologies_private_packs;
drop policy if exists "Owner update personal pathologies" on public.pathologies_private_packs;
drop policy if exists "Owner delete personal pathologies" on public.pathologies_private_packs;
create policy "Owner read personal pathologies"
 on public.pathologies_private_packs for select to authenticated
 using ((select auth.uid())=owner_id);
create policy "Owner upload personal pathologies"
 on public.pathologies_private_packs for insert to authenticated
 with check ((select auth.uid())=owner_id);
create policy "Owner update personal pathologies"
 on public.pathologies_private_packs for update to authenticated
 using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy "Owner delete personal pathologies"
 on public.pathologies_private_packs for delete to authenticated
 using ((select auth.uid())=owner_id);
comment on table public.pathologies_private_packs is
 'Personal, medically unapproved P1 Pathologies files, owner-only RLS; not a public teaching library.';
