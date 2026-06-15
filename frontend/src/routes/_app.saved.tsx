import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/_app/saved")({
  head: () => ({ meta: [{ title: "Kayıtlılar" }] }),
  component: Saved,
});

function Saved() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["saved", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_recipes")
        .select("recipe_id, recipes(id, title, description, time_minutes)")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader title="Kayıtlı tarifler" description="Başka kullanıcılardan kaydettiklerin" />
      {!data?.length ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
          Henüz kayıtlı tarif yok.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((s) => {
            const r = s.recipes as { id: string; title: string; description: string | null; time_minutes: number | null } | null;
            if (!r) return null;
            return (
              <Link key={r.id} to="/recipes/$id" params={{ id: r.id }} className="rounded-2xl border border-border bg-card p-5 hover:shadow-[var(--shadow-warm)] transition-all">
                <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                {r.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{r.description}</p>}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
