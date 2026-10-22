-- Supabase migration 20261022085801 (applied on 2026-10-22).
-- Reproducible permissions hardening for the owner-only private Pathologies pack.
-- Existing RLS policies already restrict SELECT/INSERT/UPDATE/DELETE to auth.uid() = owner_id.
--
-- On older/default Supabase projects authenticated may inherit ALL privileges.
-- GRANT select,insert,update,delete does NOT revoke pre-existing TRUNCATE, REFERENCES, TRIGGER.
-- TRUNCATE and REFERENCES are not subject to RLS, so remove these client privileges.
-- Leave SELECT, INSERT, UPDATE and DELETE for the current Auth + RLS sync contract.
REVOKE TRUNCATE, TRIGGER, REFERENCES
ON TABLE public.pathologies_private_packs
FROM authenticated;
