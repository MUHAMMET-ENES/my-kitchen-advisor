import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Sparkles, Package, BookOpen, ShoppingCart, AlertTriangle, ArrowRight, Award, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Panel — Yurttaş Mutfakta" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  const stats = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [recipes, pantry, shopping, expiring, cooked, badges] = await Promise.all([
        supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("pantry_items").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("shopping_items").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("is_done", false),
        supabase.from("pantry_items").select("id, name, expires_at").eq("user_id", user!.id).not("expires_at", "is", null).order("expires_at").limit(5),
        supabase.from("recipe_interactions").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("kind", "cooked"),
        supabase.from("badges").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      return {
        recipeCount: recipes.count ?? 0,
        pantryCount: pantry.count ?? 0,
        shoppingCount: shopping.count ?? 0,
        expiring: expiring.data ?? [],
        cookedCount: cooked.count ?? 0,
        badgeCount: badges.count ?? 0,
      };
    },
  });

  const cards: { to: string; title: string; desc: string; icon: typeof Sparkles; gradient?: boolean }[] = [
    { to: "/ai", title: "AI ile tarif üret", desc: "Elindekilerle hızlı öneri", icon: Sparkles, gradient: true },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className={`group rounded-2xl border border-border p-5 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-warm)] hover:-translate-y-0.5 ${
              c.gradient ? "bg-[image:var(--gradient-warm)] text-primary-foreground border-transparent" : "bg-card"
            }`}
          >
            <c.icon className="h-6 w-6 mb-3" />
            <div className="font-display text-lg font-semibold">{c.title}</div>
            <div className={`text-sm mt-1 ${c.gradient ? "opacity-90" : "text-muted-foreground"}`}>{c.desc}</div>
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
