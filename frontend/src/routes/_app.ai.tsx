import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateRecipe, saveAiRecipe } from "@/lib/ai.functions";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Clock, Save, RefreshCw, History } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({ meta: [{ title: "AI Asistan" }] }),
  component: AI,
});

type GeneratedRecipe = {
  title?: string;
  description?: string;
  time_minutes?: number;
  ingredients?: { name: string; amount?: string }[];
  steps?: string[];
  tags?: string[];
  equipment?: string[];
  estimated_cost?: number;
  estimated_calories?: number;
  satiety?: number;
  dish_load?: number;
  highlights?: string[];
};

const EQUIPMENT = ["Ocak", "Mikrodalga", "Tost makinesi", "Su ısıtıcısı", "Fırın", "Air fryer", "Sadece bıçak"];

function AI() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const generate = useServerFn(generateRecipe);
  const save = useServerFn(saveAiRecipe);
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // filters
  const [timeMax, setTimeMax] = useState("");
  const [budget, setBudget] = useState("");
  const [servings, setServings] = useState("1");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [noElec, setNoElec] = useState(false);
  const [microwave, setMicrowave] = useState(false);
  const [onePot, setOnePot] = useState(false);
  const [lowDish, setLowDish] = useState(false);
  const [nextDay, setNextDay] = useState(false);
  const [odorFree, setOdorFree] = useState(false);
  const [prioritizeExp, setPrioritizeExp] = useState(true);
  const [mode, setMode] = useState<"normal" | "exam" | "comfort" | "late_night" | "high_protein">("normal");

  const pantryQ = useQuery({
    queryKey: ["pantry-names", user?.id],
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

  const historyQ = useQuery({
    queryKey: ["ai-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("ai_history").select("id, prompt, created_at").eq("user_id", user!.id)
        .order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const gen = useMutation({
    mutationFn: async () => {
      const context = {
        time_minutes: timeMax ? Number(timeMax) : undefined,
        budget: budget ? Number(budget) : undefined,
        servings: Number(servings),
        equipment: equipment.length ? equipment : undefined,
        no_electricity: noElec || undefined,
        microwave_only: microwave || undefined,
        one_pot: onePot || undefined,
        low_dishes: lowDish || undefined,
        next_day_safe: nextDay || undefined,
        odor_free: odorFree || undefined,
        mode,
        prioritize_expiring: prioritizeExp,
      };
      const r = await generate({ data: {
        prompt,
        pantry: pantryQ.data?.all ?? [],
        expiring: prioritizeExp ? pantryQ.data?.expiring : undefined,
        context,
      } });
      return r as GeneratedRecipe;
    },
    onSuccess: (r) => setRecipe(r),
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!recipe) return;
      const r = await save({
        data: {
          title: recipe.title ?? "AI Tarif",
          description: recipe.description,
          ingredients: recipe.ingredients ?? [],
          steps: recipe.steps ?? [],
          tags: recipe.tags ?? [],
          equipment: recipe.equipment ?? [],
          time_minutes: recipe.time_minutes ?? null,
          estimated_cost: recipe.estimated_cost ?? null,
          estimated_calories: recipe.estimated_calories ?? null,
          ai_meta: { satiety: recipe.satiety, dish_load: recipe.dish_load, highlights: recipe.highlights },
        },
      });
      return r;
    },
    onSuccess: (r) => {
      toast.success("Tarif kaydedildi");
      if (r) navigate({ to: "/recipes/$id", params: { id: r.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const examples = [
    "Hızlı ve doyurucu kahvaltı, mikrodalga yok",
    "2 yumurta ve ekmekle 10 dakikada tarif",
    "Az bulaşıkla akşam yemeği, 30₺ bütçe",
    "Elektriksiz, soğuk salata önerisi",
    "Sınav haftası: tek kase, doyurucu, 15 dk",
  ];

  const toggleEq = (e: string) => setEquipment((p) => p.includes(e) ? p.filter((x) => x !== e) : [...p, e]);

  return (
    <>
      <PageHeader title="AI Asistan" description="Yurt mutfağına özel: kısıtlarını söyle, gerçekçi tarif al." />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Örn: Elimde sadece makarna, salça ve peynir var. Hızlı bir öğün yapabilir miyim?"
          rows={3}
          className="text-base"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-accent transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className="text-xs text-primary hover:underline mt-3"
        >
          {showFilters ? "Filtreleri gizle" : "Detaylı filtreler"}
        </button>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-border">
            <div>
              <Label className="text-xs">Maks. süre (dk)</Label>
              <Input type="number" value={timeMax} onChange={(e) => setTimeMax(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Bütçe (₺)</Label>
              <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Porsiyon</Label>
              <Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs">Mod</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal gün</SelectItem>
                  <SelectItem value="exam">Sınav haftası — düşük enerji</SelectItem>
                  <SelectItem value="comfort">Konfor / Cheat meal</SelectItem>
                  <SelectItem value="late_night">Gece atıştırması</SelectItem>
                  <SelectItem value="high_protein">Bütçe + yüksek protein</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label className="text-xs mb-2 block">Ekipman</Label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEq(e)}
                    className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                      equipment.includes(e) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-3 grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2"><Checkbox checked={noElec} onCheckedChange={(v) => setNoElec(!!v)} />Elektriksiz</label>
              <label className="flex items-center gap-2"><Checkbox checked={microwave} onCheckedChange={(v) => setMicrowave(!!v)} />Sadece mikrodalga</label>
              <label className="flex items-center gap-2"><Checkbox checked={onePot} onCheckedChange={(v) => setOnePot(!!v)} />Tek kap</label>
              <label className="flex items-center gap-2"><Checkbox checked={lowDish} onCheckedChange={(v) => setLowDish(!!v)} />Az bulaşık</label>
              <label className="flex items-center gap-2"><Checkbox checked={nextDay} onCheckedChange={(v) => setNextDay(!!v)} />Ertesi güne dayansın</label>
              <label className="flex items-center gap-2"><Checkbox checked={odorFree} onCheckedChange={(v) => setOdorFree(!!v)} />Kokusuz (oda arkadaşı dostu)</label>
              <label className="flex items-center gap-2 col-span-2"><Checkbox checked={prioritizeExp} onCheckedChange={(v) => setPrioritizeExp(!!v)} />Bozulacak malzemeleri önceliklendir</label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-muted-foreground">
            Buzdolabınızdan {pantryQ.data?.all.length ?? 0} malzeme · {pantryQ.data?.expiring.length ?? 0} yakında bozulacak
          </div>
          <Button
            onClick={() => gen.mutate()}
            disabled={!prompt || gen.isPending}
            className="bg-[image:var(--gradient-warm)] shadow-[var(--shadow-warm)]"
          >
            {gen.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Tarif üret
          </Button>
        </div>
      </div>

      {recipe && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-warm)]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">{recipe.title}</h2>
              {recipe.description && <p className="text-muted-foreground mt-1">{recipe.description}</p>}
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                {recipe.time_minutes && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{recipe.time_minutes} dk</span>}
                {recipe.estimated_cost != null && <span>~{recipe.estimated_cost}₺</span>}
                {recipe.estimated_calories != null && <span>~{recipe.estimated_calories} kcal</span>}
                {recipe.satiety && <span>Doyuruculuk: {recipe.satiety}/5</span>}
                {recipe.dish_load != null && <span>Bulaşık yükü: {recipe.dish_load}/5</span>}
              </div>
              {recipe.highlights?.length ? (
                <div className="flex flex-wrap gap-1 mt-3">
                  {recipe.highlights.map((h) => (
                    <span key={h} className="rounded-full bg-[image:var(--gradient-warm)] text-primary-foreground px-2 py-0.5 text-xs">{h}</span>
                  ))}
                </div>
              ) : null}
              {recipe.tags?.length ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {recipe.tags.map((t) => (
                    <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{t}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
              <Save className="h-4 w-4 mr-2" />Kaydet
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-display text-lg font-semibold mb-2">Malzemeler</h3>
              <ul className="space-y-1 text-sm">
                {recipe.ingredients?.map((i, k) => (
                  <li key={k}>• {i.amount ? `${i.amount} ` : ""}{i.name}</li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-display text-lg font-semibold mb-2">Adımlar</h3>
              <ol className="space-y-2 text-sm">
                {recipe.steps?.map((s, k) => (
                  <li key={k} className="flex gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-warm)] text-primary-foreground text-xs font-semibold">{k + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {historyQ.data?.length ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-display font-semibold">Son istemler</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {historyQ.data.map((h) => (
              <li key={h.id}>
                <button onClick={() => setPrompt(h.prompt)} className="text-left text-muted-foreground hover:text-foreground">
                  {h.prompt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
