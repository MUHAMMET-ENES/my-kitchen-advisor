
-- 1) Badges: only owner can read; only service_role can write (server-side awarding)
DROP POLICY IF EXISTS "Own badges" ON public.badges;
REVOKE INSERT, UPDATE, DELETE ON public.badges FROM authenticated;
CREATE POLICY "Own badges read" ON public.badges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2) recipe_ratings: public can only read ratings on public recipes; owners see theirs
DROP POLICY IF EXISTS "Ratings readable" ON public.recipe_ratings;
CREATE POLICY "Ratings readable public" ON public.recipe_ratings FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_ratings.recipe_id AND r.visibility = 'public')
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_ratings.recipe_id AND r.user_id = auth.uid())
  );

-- 3) recipe_remixes: same approach
DROP POLICY IF EXISTS "Remix readable" ON public.recipe_remixes;
CREATE POLICY "Remix readable public" ON public.recipe_remixes FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_remixes.source_recipe_id AND r.visibility = 'public')
    OR EXISTS (SELECT 1 FROM public.recipes r WHERE r.id = recipe_remixes.remix_recipe_id AND r.visibility = 'public')
    OR auth.uid() = user_id
  );

-- 4) Storage: restrict recipe-images reads to public recipes or owner
DROP POLICY IF EXISTS "Recipe images readable" ON storage.objects;
CREATE POLICY "Recipe images readable scoped" ON storage.objects FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'recipe-images' AND (
      (storage.foldername(name))[1] = COALESCE(auth.uid()::text, '')
      OR EXISTS (
        SELECT 1 FROM public.recipes r
        WHERE r.user_id::text = (storage.foldername(name))[1]
          AND r.visibility = 'public'
          AND r.image_url LIKE '%' || storage.objects.name
      )
    )
  );
