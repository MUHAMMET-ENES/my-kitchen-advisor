import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Lock, Globe, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/recipes")({
  head: () => ({ meta: [{ title: "Tarifler — Yurttaş Mutfakta" }] }),
  component: Recipes,
});

function Recipes() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["recipes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHeader
        title="Tariflerim"
        description="Kendi tariflerin ve AI ile ürettiklerin"
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/ai"><Sparkles className="h-4 w-4 mr-2" />AI ile üret</Link></Button>
            <Button asChild className="bg-[image:var(--gradient-warm)]"><Link to="/recipes/new"><Plus className="h-4 w-4 mr-2" />Yeni tarif</Link></Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="text-muted-foreground">Yükleniyor…</div>
      ) : !data?.length ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <h3 className="font-display text-xl font-semibold">Henüz tarif yok</h3>
          <p className="text-muted-foreground mt-2">İlk tarifini ekle veya AI'a yaptır.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button asChild variant="outline"><Link to="/recipes/new">Elle ekle</Link></Button>
            <Button asChild className="bg-[image:var(--gradient-warm)]"><Link to="/ai">AI ile üret</Link></Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((r) => (
            <Link
              key={r.id}
              to="/recipes/$id"
              params={{ id: r.id }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-warm)] transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display text-lg font-semibold leading-tight">{r.title}</h3>
                {r.visibility === "public" ? <Globe className="h-4 w-4 text-muted-foreground shrink-0" /> : <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>
              {r.description && <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>}
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                {r.time_minutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.time_minutes} dk</span>}
                {r.source === "ai" && <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground"><Sparkles className="h-3 w-3" />AI</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
