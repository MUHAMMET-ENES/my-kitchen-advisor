import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateWeeklyPlan } from "@/lib/premium.functions";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Sparkles, RefreshCw, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/plan")({
  head: () => ({ meta: [{ title: "Haftalık Plan — Yurttaş Mutfakta" }] }),
  component: PlanPage,
});

function mondayOf(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
const fmt = (d: Date) => d.toISOString().slice(0, 10);

type Meal = { title: string; kcal: number; protein: number; cost: number; time: number; ingredients: { name: string; amount?: string }[] };
type DayPlan = { day: string; breakfast: Meal; lunch: Meal; dinner: Meal; snack?: { title: string; kcal: number; protein: number } };
type WeekPlan = {
  days?: DayPlan[];
  shopping_list?: { name: string; amount?: string; category?: string }[];
  summary?: { total_cost?: number; avg_kcal_per_day?: number; avg_protein_per_day?: number; highlights?: string[] };
};

function PlanPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const gen = useServerFn(generateWeeklyPlan);
  const [weekStart, setWeekStart] = useState(mondayOf(new Date()));
  const [prompt, setPrompt] = useState("");
  const [servings, setServings] = useState("1");
  const [budget, setBudget] = useState("70");
  const [kcal, setKcal] = useState("2200");
  const [protein, setProtein] = useState("100");
  const [noElec, setNoElec] = useState(false);
  const [odorFree, setOdorFree] = useState(false);
  const [autoShop, setAutoShop] = useState(true);

  const planQ = useQuery({
    queryKey: ["meal_plan", user?.id, fmt(weekStart)],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("meal_plans").select("*")
        .eq("user_id", user!.id).eq("week_start", fmt(weekStart)).maybeSingle();
      return data;
    },
  });

  const pantryQ = useQuery({
    queryKey: ["pantry-names", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("pantry_items").select("name").eq("user_id", user!.id);
      return (data ?? []).map((d) => d.name);
    },
  });

  const mutate = useMutation({
    mutationFn: async () => {
      const r = await gen({ data: {
        week_start: fmt(weekStart),
        prompt: prompt || undefined,
        servings: Number(servings),
        budget_per_day: budget ? Number(budget) : undefined,
        goals: { kcal: kcal ? Number(kcal) : undefined, protein: protein ? Number(protein) : undefined },
        preferences: { no_electricity: noElec, odor_free: odorFree },
        pantry: pantryQ.data,
        auto_shopping: autoShop,
      } });
      return r;
    },
    onSuccess: () => {
      toast.success("Plan hazır!");
      qc.invalidateQueries({ queryKey: ["meal_plan"] });
      qc.invalidateQueries({ queryKey: ["shopping"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const plan: WeekPlan = (planQ.data?.plan as WeekPlan) ?? {};

  const shift = (delta: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  };

  const weekLabel = useMemo(() => {
    const end = new Date(weekStart); end.setDate(end.getDate() + 6);
    return `${weekStart.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })} – ${end.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}`;
  }, [weekStart]);

  return (
    <>
      <PageHeader
        title="Haftalık plan"
        description="AI seninle birlikte 7 günü kurar, eksikleri otomatik listeye atar"
        action={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="px-3 py-1.5 text-sm border border-border rounded-md bg-card flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />{weekLabel}
            </div>
            <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div><Label className="text-xs">Porsiyon</Label><Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} /></div>
          <div><Label className="text-xs">Günlük bütçe (₺)</Label><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
          <div><Label className="text-xs">Günlük kcal</Label><Input type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} /></div>
          <div><Label className="text-xs">Günlük protein (g)</Label><Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} /></div>
        </div>
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Notlar: sınav haftası, kokusuz olsun, sebze ağırlıklı…" rows={2} />
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <label className="flex items-center gap-2"><Checkbox checked={noElec} onCheckedChange={(v) => setNoElec(!!v)} />Elektriksiz</label>
          <label className="flex items-center gap-2"><Checkbox checked={odorFree} onCheckedChange={(v) => setOdorFree(!!v)} />Kokusuz</label>
          <label className="flex items-center gap-2"><Checkbox checked={autoShop} onCheckedChange={(v) => setAutoShop(!!v)} />Eksikleri alışveriş listesine ekle</label>
          <div className="ml-auto">
            <Button onClick={() => mutate.mutate()} disabled={mutate.isPending} className="bg-[image:var(--gradient-warm)] shadow-[var(--shadow-warm)]">
              {mutate.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {planQ.data ? "Yeniden oluştur" : "Plan oluştur"}
            </Button>
          </div>
        </div>
      </div>

      {plan.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Hafta toplam</div>
            <div className="font-display text-2xl font-semibold">~{plan.summary.total_cost ?? "—"}₺</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Günlük ort. kcal</div>
            <div className="font-display text-2xl font-semibold">{plan.summary.avg_kcal_per_day ?? "—"}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">Günlük ort. protein</div>
            <div className="font-display text-2xl font-semibold">{plan.summary.avg_protein_per_day ?? "—"} g</div>
          </div>
          <div className="rounded-xl border border-border bg-[image:var(--gradient-warm)] text-primary-foreground p-4">
            <div className="text-xs opacity-90">Alışveriş listesi</div>
            <div className="font-display text-2xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />{plan.shopping_list?.length ?? 0} ürün
            </div>
          </div>
        </div>
      )}

      {!plan.days?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Bu hafta için plan yok. Üstteki formla oluştur.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {plan.days.map((d, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg font-semibold">{d.day}</h3>
                <div className="text-xs text-muted-foreground">
                  {(d.breakfast?.kcal ?? 0) + (d.lunch?.kcal ?? 0) + (d.dinner?.kcal ?? 0) + (d.snack?.kcal ?? 0)} kcal
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <MealCard label="Kahvaltı" m={d.breakfast} />
                <MealCard label="Öğle" m={d.lunch} />
                <MealCard label="Akşam" m={d.dinner} />
              </div>
              {d.snack?.title && (
                <div className="mt-3 text-xs text-muted-foreground">🍎 Atıştırmalık: <span className="text-foreground">{d.snack.title}</span> · {d.snack.kcal} kcal</div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MealCard({ label, m }: { label: string; m?: Meal }) {
  if (!m?.title) return null;
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium text-sm mt-0.5">{m.title}</div>
      <div className="text-xs text-muted-foreground mt-1">
        {m.time}dk · ~{m.cost}₺ · {m.kcal} kcal · {m.protein}g protein
      </div>
    </div>
  );
}
