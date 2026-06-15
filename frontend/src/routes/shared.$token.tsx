import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bookmark, ChefHat, Clock, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shared/$token")({
  head: () => ({ meta: [{ title: "Paylaşılan tarif" }] }),
  component: SharedRecipe,
});

function SharedRecipe() {
  const { token } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["share", token],
    queryFn: async () => {
      const { data: share } = await supabase.from("recipe_shares").select("recipe_id").eq("share_token", token).maybeSingle();
      if (!share) return null;
      const { data: r } = await supabase.from("recipes").select("*").eq("id", share.recipe_id).maybeSingle();
      return r;
    },
  });

  const copyRecipe = async (asRemix: boolean) => {
    if (!data || !user) throw new Error("Önce giriş yap");
    const { data: row, error } = await supabase.from("recipes").insert({
      user_id: user.id,
      title: asRemix ? `${data.title} (remix)` : data.title,
      description: data.description,
      ingredients: data.ingredients, steps: data.steps, tags: data.tags, equipment: data.equipment,
      time_minutes: data.time_minutes,
      estimated_cost: data.estimated_cost, estimated_calories: data.estimated_calories,
      source: asRemix ? "remix" : "shared",
    }).select().single();
    if (error) throw error;
    if (asRemix && data) {
      await supabase.from("recipe_remixes").insert({
        source_recipe_id: data.id, remix_recipe_id: row.id, user_id: user.id,
      });
    }
    return row;
  };

  const saveCopy = useMutation({
    mutationFn: () => copyRecipe(false),
    onSuccess: (row) => { toast.success("Hesabına kopyalandı"); navigate({ to: "/recipes/$id", params: { id: row.id } }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remix = useMutation({
    mutationFn: () => copyRecipe(true),
    onSuccess: (row) => { toast.success("Remix oluşturuldu, düzenleyebilirsin"); navigate({ to: "/recipes/$id", params: { id: row.id } }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Yükleniyor…</div>;
  if (!data) return <div className="p-12 text-center">Tarif bulunamadı</div>;

  const ingredients = (data.ingredients as { name: string; amount?: string }[]) ?? [];
  const steps = (data.steps as string[]) ?? [];

  return (
    <div className="min-h-screen px-4 md:px-8 py-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8 flex-wrap gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-warm)] text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold">Yurttaş Mutfakta</span>
        </Link>
        {user ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => remix.mutate()} disabled={remix.isPending}>
              <Copy className="h-4 w-4 mr-2" />Remix yap
            </Button>
            <Button onClick={() => saveCopy.mutate()} disabled={saveCopy.isPending}>
              <Bookmark className="h-4 w-4 mr-2" />Hesabıma kaydet
            </Button>
          </div>
        ) : (
          <Button asChild><Link to="/auth">Giriş yap</Link></Button>
        )}
      </header>

      <article className="max-w-4xl mx-auto rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-warm)]">
        {data.image_url && <img src={data.image_url} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />}
        <h1 className="font-display text-4xl font-semibold tracking-tight">{data.title}</h1>
        {data.description && <p className="text-muted-foreground mt-2">{data.description}</p>}
        {data.time_minutes && (
          <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />{data.time_minutes} dakika
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div>
            <h2 className="font-display text-lg font-semibold mb-2">Malzemeler</h2>
            <ul className="space-y-1 text-sm">{ingredients.map((i, k) => <li key={k}>• {i.amount ? `${i.amount} ` : ""}{i.name}</li>)}</ul>
          </div>
          <div className="md:col-span-2">
            <h2 className="font-display text-lg font-semibold mb-2">Adımlar</h2>
            <ol className="space-y-2 text-sm">
              {steps.map((s, k) => (
                <li key={k} className="flex gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-warm)] text-primary-foreground text-xs font-semibold">{k + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </article>
    </div>
  );
}
