import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Sparkles, Package, BookOpen, ShoppingCart, AlertTriangle, ArrowRight, Award, ChefHat, CalendarDays, Activity, Compass, Siren, Dice5, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Panel — Yurttaş Mutfakta" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const [recipes, pantry, shopping, expiring, cooked, badges, cookedThisMonth, savedRecipes] = await Promise.all([
        supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("pantry_items").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("shopping_items").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("is_done", false),
        supabase.from("pantry_items").select("id, name, expires_at").eq("user_id", user!.id).not("expires_at", "is", null).order("expires_at").limit(5),
        supabase.from("recipe_interactions").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("kind", "cooked"),
        supabase.from("badges").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("recipe_interactions").select("recipe_id, created_at, recipes(estimated_cost, estimated_calories)").eq("user_id", user!.id).eq("kind", "cooked").gte("created_at", monthStart.toISOString()),
        supabase.from("recipes").select("id, title").eq("user_id", user!.id).limit(50),
      ]);

      const monthSpend = (cookedThisMonth.data ?? []).reduce((sum, r) => {
        const rec = r.recipes as { estimated_cost?: number | null } | { estimated_cost?: number | null }[] | null;
        const cost = Array.isArray(rec) ? rec[0]?.estimated_cost : rec?.estimated_cost;
        return sum + (cost ?? 0);
      }, 0);

      return {
        recipeCount: recipes.count ?? 0,
        pantryCount: pantry.count ?? 0,
        shoppingCount: shopping.count ?? 0,
        expiring: expiring.data ?? [],
        cookedCount: cooked.count ?? 0,
        badgeCount: badges.count ?? 0,
        monthCookedCount: cookedThisMonth.data?.length ?? 0,
        monthSpend,
        savedRecipes: savedRecipes.data ?? [],
      };
    },
  });

  // Yurttaş Skoru — gamified efficiency score
  const yurttasScore = useMemo(() => {
    if (!stats.data) return 0;
    const cookedPts = stats.data.cookedCount * 8;
    const pantryPts = Math.min(stats.data.pantryCount, 25) * 3;
    const badgePts = stats.data.badgeCount * 15;
    const efficiency = stats.data.monthSpend > 0 && stats.data.monthCookedCount > 0
      ? Math.max(0, 100 - Math.round(stats.data.monthSpend / Math.max(stats.data.monthCookedCount, 1)))
      : 0;
    return cookedPts + pantryPts + badgePts + efficiency;
  }, [stats.data]);

  const scoreLevel = yurttasScore < 50 ? { label: "Stajyer Aşçı", emoji: "🥚" }
    : yurttasScore < 150 ? { label: "Yurt Çırağı", emoji: "🍳" }
    : yurttasScore < 300 ? { label: "Tencere Ustası", emoji: "🍲" }
    : yurttasScore < 500 ? { label: "Koridor Şefi", emoji: "👨‍🍳" }
    : { label: "Yurt Efsanesi", emoji: "🏆" };

  const rollDice = () => {
    const saved = stats.data?.savedRecipes ?? [];
    if (saved.length === 0) {
      toast.info("Önce birkaç tarif kaydet, sonra zar atalım 🎲");
      navigate({ to: "/ai" });
      return;
    }
    const pick = saved[Math.floor(Math.random() * saved.length)];
    toast.success(`Bugün: ${pick.title} 🎲`);
    navigate({ to: "/recipes/$id", params: { id: pick.id } });
  };

  const cards: { to: string; title: string; desc: string; icon: typeof Sparkles; gradient?: boolean; destructive?: boolean }[] = [
    { to: "/sos", title: "Acil Açlık SOS", desc: "Tek tıkla kurtarma tarifi", icon: Siren, destructive: true },
    { to: "/ai", title: "AI ile tarif üret", desc: "Elindekilerle hızlı öneri", icon: Sparkles, gradient: true },
    { to: "/plan", title: "Haftalık plan", desc: "7 günlük menü + market", icon: CalendarDays },
    { to: "/nutrition", title: "Beslenme koçu", desc: "Makro takip ve grafik", icon: Activity },
    { to: "/discover", title: "Keşfet", desc: "Topluluk tarifleri", icon: Compass },
    { to: "/recipes", title: "Tariflerim", desc: `${stats.data?.recipeCount ?? "—"} tarif`, icon: BookOpen },
    { to: "/pantry", title: "Buzdolabım", desc: `${stats.data?.pantryCount ?? "—"} ürün`, icon: Package },
    { to: "/shopping", title: "Alışveriş", desc: `${stats.data?.shoppingCount ?? "—"} bekliyor`, icon: ShoppingCart },
  ];

  return (
    <>
      <PageHeader
        title={`Merhaba ${user?.user_metadata?.full_name?.split(" ")[0] ?? "şef"} 👋`}
        description="Bugün ne pişiriyoruz?"
      />

      {/* Yurttaş Skoru + Zar */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 rounded-3xl border-2 border-primary/30 bg-[image:var(--gradient-warm)] text-primary-foreground p-6 shadow-[var(--shadow-warm)] relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-9xl opacity-10">{scoreLevel.emoji}</div>
          <div className="relative">
            <div className="flex items-center gap-2 text-sm opacity-90 mb-1">
              <TrendingUp className="h-4 w-4" /> Yurttaş Skorun
            </div>
            <div className="font-display text-5xl font-bold leading-none">{yurttasScore}</div>
            <div className="text-lg font-medium mt-2">{scoreLevel.emoji} {scoreLevel.label}</div>
            <div className="text-xs opacity-80 mt-3 flex flex-wrap gap-3">
              <span>🍳 {stats.data?.cookedCount ?? 0} pişirme</span>
              <span>📦 {stats.data?.pantryCount ?? 0} ürün</span>
              <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> Bu ay ₺{Math.round(stats.data?.monthSpend ?? 0)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={rollDice}
          className="rounded-3xl border-2 border-dashed border-primary/40 bg-card p-6 text-left hover:bg-primary/5 hover:border-primary transition-all group"
        >
          <Dice5 className="h-8 w-8 text-primary mb-3 group-hover:rotate-180 transition-transform duration-500" />
          <div className="font-display text-lg font-semibold">Bugün ne pişirsem?</div>
          <div className="text-sm text-muted-foreground mt-1">Tarif kütüphanenden rastgele biri</div>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`group rounded-2xl border p-5 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-warm)] hover:-translate-y-0.5 ${
              c.destructive ? "bg-destructive text-destructive-foreground border-transparent" :
              c.gradient ? "bg-[image:var(--gradient-warm)] text-primary-foreground border-transparent" : "bg-card border-border"
            }`}
          >
            <c.icon className={`h-6 w-6 mb-3 ${c.destructive ? "animate-pulse" : ""}`} />
            <div className="font-display text-lg font-semibold">{c.title}</div>
            <div className={`text-sm mt-1 ${c.gradient || c.destructive ? "opacity-90" : "text-muted-foreground"}`}>{c.desc}</div>
            <ArrowRight className="h-4 w-4 mt-3 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-2xl font-semibold">{stats.data?.cookedCount ?? 0}</div>
            <div className="text-xs text-muted-foreground">Pişirdiğin tarif</div>
          </div>
        </div>
        <Link to="/badges" className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:shadow-[var(--shadow-warm)] transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-warm)] text-primary-foreground">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-2xl font-semibold">{stats.data?.badgeCount ?? 0}</div>
            <div className="text-xs text-muted-foreground">Kazanılan rozet</div>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Önce bunu tüket</h2>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/pantry">Tümünü gör</Link></Button>
        </div>
        {stats.data?.expiring?.length ? (
          <ul className="divide-y divide-border">
            {stats.data.expiring.map((p) => {
              const days = p.expires_at ? Math.ceil((new Date(p.expires_at).getTime() - Date.now()) / 86_400_000) : null;
              const urgent = days != null && days <= 3;
              return (
                <li key={p.id} className="flex justify-between py-3">
                  <span>{p.name}</span>
                  <span className={`text-sm ${urgent ? "text-destructive" : "text-muted-foreground"}`}>
                    {p.expires_at} {days != null && `(${days} gün)`}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Son kullanma tarihi olan ürün eklemediniz. Buzdolabınıza ekleyin.</p>
        )}
      </div>
    </>
  );
}
