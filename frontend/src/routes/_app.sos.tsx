import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { generateRecipe, saveAiRecipe } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Siren, Clock, Wallet, Save, Flame } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sos")({
  head: () => ({ meta: [{ title: "Acil Açlık SOS — Yurttaş Mutfakta" }] }),
  component: SOS,
});

const MOODS = [
  { key: "starving", label: "Açlıktan ölüyorum", emoji: "😵", prompt: "Beni 5 dakikada doyuracak en hızlı şey" },
  { key: "stressed", label: "Stresliyim", emoji: "😩", prompt: "Beni rahatlatacak, sıcacık konfor yemeği" },
  { key: "sad", label: "Moralim bozuk", emoji: "🥲", prompt: "Annemi aratmayacak şefkatli bir tarif" },
  { key: "exam", label: "Sınav var", emoji: "📚", prompt: "Beynimi çalıştıracak, enerji veren ama uyutmayan" },
  { key: "broke", label: "Beş parasızım", emoji: "💸", prompt: "En ucuz, doyurucu, neredeyse bedavaya gelen" },
  { key: "late", label: "Gece 02:00", emoji: "🌙", prompt: "Komşuyu uyandırmadan, sessizce yapılan hafif atıştırmalık" },
];

function SOS() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const generate = useServerFn(generateRecipe);
  const save = useServerFn(saveAiRecipe);
  const [mood, setMood] = useState<(typeof MOODS)[number]>(MOODS[0]);
  const [minutes, setMinutes] = useState(10);
  const [budget, setBudget] = useState("");
  type RecipeOut = Awaited<ReturnType<typeof generate>>;
  const [recipe, setRecipe] = useState<RecipeOut | null>(null);

  const lateHours = useMemo(() => {
    const h = new Date().getHours();
    return h >= 22 || h < 6;
  }, []);

  const pantryQ = useQuery({
    queryKey: ["pantry-sos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("pantry_items").select("name, expires_at").eq("user_id", user!.id);
      const all = data?.map((d) => d.name) ?? [];
      const expiring = (data ?? [])
        .filter((d) => d.expires_at && (new Date(d.expires_at).getTime() - Date.now()) / 86_400_000 <= 3)
        .map((d) => d.name);
      return { all, expiring };
    },
  });

  const rescue = useMutation({
    mutationFn: async () => {
      return await generate({
        data: {
          prompt: `${mood.prompt}. Tek başıma yurttayım. ${lateHours ? "Şu an gece geç saat, sessiz olmalı." : ""}`,
          pantry: pantryQ.data?.all ?? [],
          expiring: pantryQ.data?.expiring ?? [],
          context: {
            time_minutes: minutes,
            servings: 1,
            budget: budget ? Number(budget) : undefined,
            mode: mood.key === "exam" ? "exam" : mood.key === "stressed" || mood.key === "sad" ? "comfort" : mood.key === "late" || lateHours ? "late_night" : "normal",
            microwave_only: mood.key === "late" || lateHours,
            odor_free: mood.key === "late" || lateHours,
            low_dishes: true,
            one_pot: true,
            prioritize_expiring: true,
          },
        },
      });
    },
    onSuccess: (r) => setRecipe(r),
    onError: (e: Error) => toast.error(e.message),
  });

  const saveM = useMutation({
    mutationFn: async () => {
      if (!recipe) return;
      const { id } = await save({
        data: {
          title: recipe.title ?? "SOS Tarifi",
          description: recipe.description,
          ingredients: recipe.ingredients ?? [],
          steps: recipe.steps ?? [],
          tags: [...(recipe.tags ?? []), "sos", mood.key],
          equipment: recipe.equipment ?? [],
          time_minutes: recipe.time_minutes ?? null,
          estimated_cost: recipe.estimated_cost ?? null,
          estimated_calories: recipe.estimated_calories ?? null,
        },
      });
      return id;
    },
    onSuccess: (id) => { toast.success("Kaydedildi"); if (id) navigate({ to: "/recipes/$id", params: { id } }); },
  });

  return (
    <>
      <PageHeader
        title="Acil Açlık SOS"
        description="Tek tıkla kurtarma tarifi. Ruh halini seç, zaman ver, gerisini biz hallederiz."
      />

      <div className="rounded-3xl border-2 border-destructive/30 bg-gradient-to-br from-destructive/5 to-primary/5 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive text-destructive-foreground animate-pulse">
            <Siren className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold">Şu anki ruh halin?</div>
            {lateHours && <div className="text-xs text-primary">🌙 Gece modu aktif — sessiz tarifler önerilecek</div>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMood(m)}
              className={`rounded-2xl border-2 p-3 text-left transition-all ${
                mood.key === m.key
                  ? "border-primary bg-primary/10 shadow-[var(--shadow-warm)]"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="text-2xl mb-1">{m.emoji}</div>
              <div className="text-sm font-medium leading-tight">{m.label}</div>
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> Ne kadar vaktim var?</label>
              <span className="text-sm font-semibold text-primary">{minutes} dk</span>
            </div>
            <Slider value={[minutes]} min={2} max={45} step={1} onValueChange={(v) => setMinutes(v[0])} />
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2"><Wallet className="h-4 w-4" /> Bütçe (opsiyonel, ₺)</label>
            <Input type="number" inputMode="decimal" placeholder="örn. 50" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => rescue.mutate()}
          disabled={rescue.isPending}
          className="w-full h-14 text-base font-semibold rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-[var(--shadow-warm)]"
        >
          <Flame className="h-5 w-5 mr-2" />
          {rescue.isPending ? "Mutfak alarma geçti..." : "Beni Kurtar 🚨"}
        </Button>

        {(pantryQ.data?.all.length ?? 0) > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Buzdolabındaki {pantryQ.data?.all.length} malzeme dikkate alınacak
            {pantryQ.data?.expiring.length ? ` · ${pantryQ.data.expiring.length} ürün öncelikli (bozulmak üzere)` : ""}
          </p>
        )}
      </div>

      {recipe && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-warm)]">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="font-display text-2xl font-semibold">{recipe.title}</h2>
            <Button size="sm" onClick={() => saveM.mutate()} disabled={saveM.isPending}>
              <Save className="h-4 w-4 mr-1" /> Kaydet
            </Button>
          </div>
          {recipe.description && <p className="text-muted-foreground mb-4">{recipe.description}</p>}
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            {recipe.time_minutes && <span className="rounded-full bg-secondary px-3 py-1">⏱ {recipe.time_minutes} dk</span>}
            {recipe.estimated_cost != null && <span className="rounded-full bg-secondary px-3 py-1">₺ {recipe.estimated_cost}</span>}
            {recipe.estimated_calories != null && <span className="rounded-full bg-secondary px-3 py-1">🔥 {recipe.estimated_calories} kcal</span>}
            {recipe.satiety != null && <span className="rounded-full bg-secondary px-3 py-1">😋 Tokluk {recipe.satiety}/5</span>}
            {recipe.dish_load != null && <span className="rounded-full bg-secondary px-3 py-1">🧽 Bulaşık {recipe.dish_load}/5</span>}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-display text-lg font-semibold mb-2">Malzemeler</h3>
              <ul className="space-y-1 text-sm">
                {recipe.ingredients?.map((i, k) => (
                  <li key={k} className="flex justify-between border-b border-border py-1">
                    <span>{i.name}</span><span className="text-muted-foreground">{i.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold mb-2">Adımlar</h3>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                {recipe.steps?.map((s, k) => <li key={k}>{s}</li>)}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
