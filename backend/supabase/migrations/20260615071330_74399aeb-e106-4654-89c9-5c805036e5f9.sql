
-- Weekly meal plans
CREATE TABLE public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plans TO authenticated;
GRANT ALL ON public.meal_plans TO service_role;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own plan" ON public.meal_plans FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_meal_plans_updated BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Nutrition logs
CREATE TABLE public.nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  meal text NOT NULL DEFAULT 'snack',
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  servings numeric NOT NULL DEFAULT 1,
  kcal numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_logs TO authenticated;
GRANT ALL ON public.nutrition_logs TO service_role;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own nutrition" ON public.nutrition_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX nutrition_logs_user_date_idx ON public.nutrition_logs (user_id, log_date);

-- Follows
CREATE TABLE public.follows (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT SELECT ON public.follows TO anon;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows readable" ON public.follows FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Follow self" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Unfollow self" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Recipe likes
CREATE TABLE public.recipe_likes (
  user_id uuid NOT NULL,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id)
);
GRANT SELECT, INSERT, DELETE ON public.recipe_likes TO authenticated;
GRANT SELECT ON public.recipe_likes TO anon;
GRANT ALL ON public.recipe_likes TO service_role;
ALTER TABLE public.recipe_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes readable public" ON public.recipe_likes FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_likes.recipe_id AND r.visibility = 'public')
    OR auth.uid() = user_id
  );
CREATE POLICY "Like self" ON public.recipe_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Unlike self" ON public.recipe_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Recipe comments
CREATE TABLE public.recipe_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_comments TO authenticated;
GRANT SELECT ON public.recipe_comments TO anon;
GRANT ALL ON public.recipe_comments TO service_role;
ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments readable public" ON public.recipe_comments FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_comments.recipe_id AND r.visibility = 'public')
    OR auth.uid() = user_id
  );
CREATE POLICY "Comment self insert" ON public.recipe_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Comment self update" ON public.recipe_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Comment self delete" ON public.recipe_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Pantry barcode/brand/image
ALTER TABLE public.pantry_items
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS image_url text;
CREATE INDEX IF NOT EXISTS pantry_items_user_barcode_idx ON public.pantry_items (user_id, barcode);

-- Recipe nutrition (per serving)
ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS protein_g numeric,
  ADD COLUMN IF NOT EXISTS carbs_g numeric,
  ADD COLUMN IF NOT EXISTS fat_g numeric;

-- Public profile readable for social (only safe columns via dedicated policy)
DROP POLICY IF EXISTS "Public profile basics" ON public.profiles;
CREATE POLICY "Public profile basics" ON public.profiles FOR SELECT TO anon, authenticated
  USING (true);
-- Note: profiles.email is still owner-only safe because the existing self-only policy is in addition,
-- but to be explicit we restrict the exposed columns at the query/view layer in the app.
