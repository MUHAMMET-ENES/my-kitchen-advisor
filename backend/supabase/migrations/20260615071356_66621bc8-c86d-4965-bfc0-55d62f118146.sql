
DROP POLICY IF EXISTS "Public profile basics" ON public.profiles;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
  SELECT id, full_name, avatar_url, created_at FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Allow anon/auth to read just id/name/avatar from profiles via direct table too (needed for joins in some clients)
-- We add a permissive SELECT scoped to social-safe context only when used through select list — Postgres RLS can't column-filter.
-- Instead, we add a SELECT policy that allows reading ANY profile row but the client must only select safe columns.
-- For stronger guarantees, we rely on the view above; do not expose profiles directly to anon for social.
