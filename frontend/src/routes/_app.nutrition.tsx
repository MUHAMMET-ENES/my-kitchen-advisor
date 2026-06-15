import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { logNutrition } from "@/lib/premium.functions";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Flame, Beef, Wheat, Droplet, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Line, LineChart } from "recharts";

export const Route = createFileRoute("/_app/nutrition")({
  head: () => ({ meta: [{ title: "Beslenme — Yurttaş Mutfakta" }] }),
  component: NutritionPage,
});

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

function NutritionPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const log = useServerFn(logNutrition);

  const [meal, setMeal] = useState<"breakfast" | "lunch" | "dinner" | "snack">("snack");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [note, setNote] = useState("");

  const goalsQ = useQuery({
    queryKey: ["nutrition-goals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("preferences").eq("id", user!.id).single();
      const p = (data?.preferences as Record<string, unknown>) ?? {};
      return {
        kcal: Number(p.goal_kcal) || 2200,
        protein: Number(p.goal_protein) || 100,
        carbs: Number(p.goal_carbs) || 260,
        fat: Number(p.goal_fat) || 70,
      };
    },
  });

  const logsQ = useQuery({
    queryKey: ["nutrition-logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("nutrition_logs").select("*")
        .eq("user_id", user!.id).gte("log_date", daysAgo(13))
        .order("log_date", { ascending: true });
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!kcal) throw new Error("Kalori gir");
      await log({ data: {
        meal,
        kcal: Number(kcal),
        protein: protein ? Number(protein) : 0,
        carbs: carbs ? Number(carbs) : 0,
        fat: fat ? Number(fat) : 0,
        note: note || undefined,
      } });
    },
    onSuccess: () => {
      toast.success("Eklendi");
      setKcal(""); setProtein(""); setCarbs(""); setFat(""); setNote("");
      qc.invalidateQueries({ queryKey: ["nutrition-logs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const goals = goalsQ.data ?? { kcal: 2200, protein: 100, carbs: 260, fat: 70 };
  const todays = (logsQ.data ?? []).filter((l) => l.log_date === today());
  const sum = todays.reduce(
    (acc, l) => ({
      kcal: acc.kcal + Number(l.kcal),
      protein: acc.protein + Number(l.protein),
      carbs: acc.carbs + Number(l.carbs),
      fat: acc.fat + Number(l.fat),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  // 14-day chart data
  const chartData: { date: string; kcal: number; protein: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = daysAgo(i);
    const dayLogs = (logsQ.data ?? []).filter((l) => l.log_date === date);
    chartData.push({
      date: new Date(date).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
      kcal: dayLogs.reduce((s, l) => s + Number(l.kcal), 0),
      protein: dayLogs.reduce((s, l) => s + Number(l.protein), 0),
    });
  }

  const STATS: { icon: typeof Flame; label: string; value: number; goal: number; color: string; unit: string }[] = [
    { icon: Flame, label: "Kalori", value: sum.kcal, goal: goals.kcal, color: "var(--primary)", unit: "kcal" },
    { icon: Beef, label: "Protein", value: sum.protein, goal: goals.protein, color: "#e11d48", unit: "g" },
    { icon: Wheat, label: "Karbonhidrat", value: sum.carbs, goal: goals.carbs, color: "#d97706", unit: "g" },
    { icon: Droplet, label: "Yağ", value: sum.fat, goal: goals.fat, color: "#0ea5e9", unit: "g" },
  ];

  return (
    <>
      <PageHeader title="Beslenme koçu" description="Günlük makro takibi, hedefler ve haftalık trendler" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STATS.map((s) => {
          const pct = Math.min(100, (s.value / Math.max(1, s.goal)) * 100);
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
                <span className="text-xs text-muted-foreground">{Math.round(pct)}%</span>
              </div>
              <div className="font-display text-2xl font-semibold">{Math.round(s.value)}<span className="text-sm text-muted-foreground ml-1">/ {s.goal} {s.unit}</span></div>
              <div className="text-xs text-muted-foreground mb-2">{s.label}</div>
              <Progress value={pct} />
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold">Son 14 gün — Kalori</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="kcal" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3"><Beef className="h-4 w-4 text-rose-600" /><h3 className="font-display font-semibold">Son 14 gün — Protein</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="protein" stroke="#e11d48" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 mb-6">
        <h3 className="font-display font-semibold mb-3">Öğün ekle</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <div>
            <Label className="text-xs">Öğün</Label>
            <Select value={meal} onValueChange={(v) => setMeal(v as typeof meal)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Kahvaltı</SelectItem>
                <SelectItem value="lunch">Öğle</SelectItem>
                <SelectItem value="dinner">Akşam</SelectItem>
                <SelectItem value="snack">Atıştırma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Kcal</Label><Input type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} /></div>
          <div><Label className="text-xs">Protein g</Label><Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} /></div>
          <div><Label className="text-xs">Karb g</Label><Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} /></div>
          <div><Label className="text-xs">Yağ g</Label><Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} /></div>
          <Button onClick={() => submit.mutate()} disabled={submit.isPending || !kcal} className="bg-[image:var(--gradient-warm)]">
            <Plus className="h-4 w-4 mr-2" />Ekle
          </Button>
        </div>
        <Input className="mt-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Not (isteğe bağlı)" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display font-semibold mb-3">Bugünün kayıtları</h3>
        {!todays.length ? (
          <p className="text-sm text-muted-foreground">Henüz kayıt yok.</p>
        ) : (
          <ul className="divide-y divide-border">
            {todays.map((l) => (
              <li key={l.id} className="py-2 flex justify-between text-sm">
                <span className="capitalize">{l.meal} {l.note ? `· ${l.note}` : ""}</span>
                <span className="text-muted-foreground">{Math.round(Number(l.kcal))} kcal · {Math.round(Number(l.protein))}g protein</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
