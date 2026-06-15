import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/lib/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Flame, ChefHat, Search, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_app/discover")({
  head: () => ({ meta: [{ title: "Keşfet — Yurttaş Mutfakta" }] }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"trending" | "new" | "quick" | "cheap">("trending");

  const recipesQ = useQuery({
    queryKey: ["discover", tab, q],
    queryFn: async () => {
      let query = supabase.from("recipes").select("id, title, description, image_url, time_minutes, estimated_cost, estimated_calories, tags, user_id, created_at")
        .eq("visibility", "public").limit(30);
      if (q) query = query.ilike("title", `%${q}%`);
      if (tab === "quick") query = query.lte("time_minutes", 20);
      if (tab === "cheap") query = query.lte("estimated_cost", 40);
      if (tab === "new") query = query.order("created_at", { ascending: false });
      else query = query.order("created_at", { ascending: false });
      const { data } = await query;
      return data ?? [];
    },
  });

  const ids = (recipesQ.data ?? []).map((r) => r.id);

  const likesQ = useQuery({
    queryKey: ["discover-likes", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("recipe_likes").select("recipe_id").in("recipe_id", ids);
      const counts: Record<string, number> = {};
      (data ?? []).forEach((l) => { counts[l.recipe_id] = (counts[l.recipe_id] ?? 0) + 1; });
      return counts;
    },
  });

  const authorIds = Array.from(new Set((recipesQ.data ?? []).map((r) => r.user_id)));
  const authorsQ = useQuery({
    queryKey: ["discover-authors", authorIds],
    enabled: authorIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", authorIds);
      const map: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      (data ?? []).forEach((p) => { map[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }; });
      return map;
    },
  });

  const sorted = (recipesQ.data ?? []).slice().sort((a, b) => {
    if (tab === "trending") return (likesQ.data?.[b.id] ?? 0) - (likesQ.data?.[a.id] ?? 0);
    return 0;
  });

  const TABS: { v: typeof tab; label: string; icon: typeof Heart }[] = [
    { v: "trending", label: "Trend", icon: TrendingUp },
    { v: "new", label: "Yeni", icon: Heart },
    { v: "quick", label: "20 dk altı", icon: Clock },
    { v: "cheap", label: "40₺ altı", icon: Flame },
  ];

  return (
    <>
      <PageHeader title="Keşfet" description="Diğer öğrencilerin paylaştığı yurt dostu tarifler" />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tarif ara…" className="pl-9" />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <Button key={t.v} variant={tab === t.v ? "default" : "outline"} size="sm"
              className={tab === t.v ? "bg-[image:var(--gradient-warm)]" : ""}
              onClick={() => setTab(t.v)}>
              <t.icon className="h-4 w-4 mr-1.5" />{t.label}
            </Button>
          ))}
        </div>
      </div>

      {recipesQ.isLoading ? (
        <div className="text-muted-foreground">Yükleniyor…</div>
      ) : !sorted.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Henüz herkese açık tarif yok. İlk paylaşan ol!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((r) => {
            const author = authorsQ.data?.[r.user_id];
            return (
              <Link key={r.id} to="/recipes/$id" params={{ id: r.id }}
                className="group rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-warm)] hover:-translate-y-0.5 transition-all">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-[image:var(--gradient-warm)] flex items-center justify-center">
                    <ChefHat className="h-10 w-10 text-primary-foreground/80" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-display font-semibold line-clamp-1">{r.title}</h3>
                  {r.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.description}</p>}
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {author?.avatar_url ? <img src={author.avatar_url} className="h-5 w-5 rounded-full" alt="" /> : <div className="h-5 w-5 rounded-full bg-secondary" />}
                      <span>{author?.full_name ?? "Şef"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.time_minutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.time_minutes}dk</span>}
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-rose-500" />{likesQ.data?.[r.id] ?? 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
