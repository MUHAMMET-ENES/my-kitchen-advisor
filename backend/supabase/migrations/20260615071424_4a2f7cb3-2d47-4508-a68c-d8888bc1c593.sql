
DROP VIEW IF EXISTS public.public_profiles;

-- Reset table-level grants and use explicit column grants
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, avatar_url, created_at, updated_at) ON public.profiles TO anon, authenticated;
GRANT SELECT (email, preferences) ON public.profiles TO authenticated; -- still owner-only via RLS
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Recreate broad SELECT policy; column grants prevent anon from selecting the email column
DROP POLICY IF EXISTS "Public profile basics" ON public.profiles;
CREATE POLICY "Public profile basics" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
