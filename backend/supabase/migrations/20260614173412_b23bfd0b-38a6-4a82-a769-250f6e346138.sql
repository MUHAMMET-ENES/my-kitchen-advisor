
-- INTERACTIONS (cooked/liked/rejected)
CREATE TABLE public.recipe_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('cooked','liked','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id, kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_interactions TO authenticated;
GRANT ALL ON public.recipe_interactions TO service_role;
ALTER TABLE public.recipe_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own interactions" ON public.recipe_interactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- REMIXES (lineage)
CREATE TABLE public.recipe_remixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  remix_recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(remix_recipe_id)
);
GRANT SELECT, INSERT, DELETE ON public.recipe_remixes TO authenticated;
GRANT SELECT ON public.recipe_remixes TO anon;
GRANT ALL ON public.recipe_remixes TO service_role;
ALTER TABLE public.recipe_remixes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Remix self manage" ON public.recipe_remixes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Remix readable" ON public.recipe_remixes FOR SELECT TO authenticated, anon USING (true);

-- BADGES
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(user_id, code)
);
GRANT SELECT, INSERT, DELETE ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own badges" ON public.badges FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications" ON public.notifications FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CONTENT REPORTS
CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_kind TEXT NOT NULL CHECK (target_kind IN ('recipe','rating','image')),
  target_id UUID NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.content_reports TO authenticated;
GRANT ALL ON public.content_reports TO service_role;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own reports" ON public.content_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Insert reports" ON public.content_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- USER VIOLATIONS
CREATE TABLE public.user_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warn',
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_violations TO authenticated;
GRANT ALL ON public.user_violations TO service_role;
ALTER TABLE public.user_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own violations read" ON public.user_violations FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- SEARCH HISTORY
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.search_history TO authenticated;
GRANT ALL ON public.search_history TO service_role;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own search" ON public.search_history FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- index helpers
CREATE INDEX idx_pantry_expires ON public.pantry_items(user_id, expires_at);
CREATE INDEX idx_recipes_user ON public.recipes(user_id, created_at DESC);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
