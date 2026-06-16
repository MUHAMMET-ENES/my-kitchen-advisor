import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Trash2, Share2, Bookmark, ChefHat, Heart, ShoppingCart, Flag } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StarRating } from "@/components/star-rating";
import { RecipeImageUpload } from "@/components/recipe-image-upload";
import { checkBadges } from "@/lib/ai.functions";
import { RecipeComments, LikeButton } from "@/components/recipe-comments";

const SUB_LABELS: { key: string; label: string }[] = [
  { key: "satiety", label: "Doyuruculuk" },
  { key: "dishes", label: "Az bulaşık" },
  { key: "cost", label: "Bütçe dostu" },
  { key: "speed", label: "Hız/Pratiklik" },
  { key: "taste", label: "Tat" },
  { key: "access", label: "Malzeme bulunabilirliği" },
  { key: "odor", label: "Kokusuz" },
  { key: "portable", label: "Taşınabilir" },
];

export const Route = createFileRoute("/_app/recipes/$id")({
  head: () => ({ meta: [{ title: "Tarif" }] }),
  component: RecipeDetail,
});

function RecipeDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const badgeFn = useServerFn(checkBadges);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [overall, setOverall] = useState(0);
  const [subs, setSubs] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  const recipeQ = useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const ratingsQ = useQuery({
    queryKey: ["ratings", id],
    queryFn: async () => {
      const { data } = await supabase.from("recipe_ratings").select("*").eq("recipe_id", id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const interactionsQ = useQuery({
    queryKey: ["interactions", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("recipe_interactions").select("kind")
        .eq("recipe_id", id).eq("user_id", user!.id);
      return new Set((data ?? []).map((d) => d.kind));
    },
  });

  // load own rating into form
  useEffect(() => {
    const mine = ratingsQ.data?.find((r) => r.user_id === user?.id);
    if (mine) {
      setOverall(Number(mine.overall));
      setSubs((mine.sub_scores as Record<string, number>) ?? {});
      setComment(mine.comment ?? "");
    }
  }, [ratingsQ.data, user?.id]);

  const remove = async () => {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Tarif silindi");
    qc.invalidateQueries({ queryKey: ["recipes"] });
    navigate({ to: "/recipes" });
  };

  const share = async () => {
    const { data: s, error } = await supabase.from("recipe_shares").insert({ recipe_id: id }).select().single();
    if (error) { toast.error(error.message); return; }
    const url = `${window.location.origin}/shared/${s.share_token}`;
    setShareUrl(url);
    await navigator.clipboard.writeText(url).catch(() => {});
    toast.success("Paylaşım bağlantısı panoya kopyalandı");
  };

  const toggleInteraction = async (kind: "cooked" | "liked" | "rejected") => {
    if (!user) return;
    const has = interactionsQ.data?.has(kind);
    if (has) {
      await supabase.from("recipe_interactions").delete()
        .eq("user_id", user.id).eq("recipe_id", id).eq("kind", kind);
    } else {
      await supabase.from("recipe_interactions").insert({ user_id: user.id, recipe_id: id, kind });
      if (kind === "cooked") {
        toast.success("Pişirme kaydedildi");
        const res = await badgeFn();
        if (res.awarded.length) toast.success(`🎉 Yeni rozet: ${res.awarded.join(", ")}`);
      }
    }
    qc.invalidateQueries({ queryKey: ["interactions", id] });
  };

  const addToShopping = async () => {
    if (!recipeQ.data || !user) return;
    const items = (recipeQ.data.ingredients as { name: string; amount?: string }[]) ?? [];
    if (!items.length) { toast.error("Malzeme yok"); return; }
    const { data: pantry } = await supabase.from("pantry_items").select("name").eq("user_id", user.id);
    const have = new Set((pantry ?? []).map((p) => p.name.toLowerCase().trim()));
    const missing = items.filter((i) => !have.has(i.name.toLowerCase().trim()));
    if (!missing.length) { toast.success("Hepsi zaten buzdolabında"); return; }
    await supabase.from("shopping_items").insert(
      missing.map((m) => ({ user_id: user.id, name: m.name, unit: m.amount ?? null }))
    );
    toast.success(`${missing.length} ürün listeye eklendi`);
  };

  const submitRating = async () => {
    if (!user || !overall) { toast.error("Genel puan ver"); return; }
    const { error } = await supabase.from("recipe_ratings").upsert({
      user_id: user.id, recipe_id: id, overall, sub_scores: subs, comment: comment || null,
    }, { onConflict: "recipe_id,user_id" });
    if (error) { toast.error(error.message); return; }
    toast.success("Değerlendirme kaydedildi");
    qc.invalidateQueries({ queryKey: ["ratings", id] });
  };

  const updateImage = async (url: string | null) => {
    await supabase.from("recipes").update({ image_url: url }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["recipe", id] });
  };

  const report = async () => {
    if (!user) return;
    const reason = prompt("Neden bu tarifi raporluyorsun?");
    if (!reason) return;
    await supabase.from("content_reports").insert({
      reporter_id: user.id, target_kind: "recipe", target_id: id, reason,
    });
    toast.success("Raporun alındı, otomatik incelemeye geçti");
  };

  if (recipeQ.isLoading) return <div className="text-muted-foreground">Yükleniyor…</div>;
  const data = recipeQ.data;
  if (!data) return <div>Tarif bulunamadı</div>;

  const ingredients = (data.ingredients as { name: string; amount?: string }[]) ?? [];
  const steps = (data.steps as string[]) ?? [];
  const isOwner = data.user_id === user?.id;
  const avgOverall = ratingsQ.data?.length
    ? ratingsQ.data.reduce((s, r) => s + Number(r.overall), 0) / ratingsQ.data.length
    : 0;

  return (
    <>
      <PageHeader
        title={data.title}
        description={data.description ?? undefined}
        action={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={share}><Share2 className="h-4 w-4 mr-2" />Paylaş</Button>
            <Button variant="outline" onClick={addToShopping}><ShoppingCart className="h-4 w-4 mr-2" />Listeye ekle</Button>
            {isOwner ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline"><Trash2 className="h-4 w-4 mr-2" />Sil</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tarifi sil?</AlertDialogTitle>
                    <AlertDialogDescription>Bu işlem geri alınamaz.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={remove}>Sil</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="outline" onClick={report}><Flag className="h-4 w-4 mr-2" />Bildir</Button>
            )}
          </div>
        }
      />

      {shareUrl && (
        <div className="mb-4 rounded-lg border border-border bg-secondary px-4 py-2 text-sm">
          Paylaşım bağlantısı: <a href={shareUrl} className="underline">{shareUrl}</a>
        </div>
      )}

      {/* Quick interactions */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={interactionsQ.data?.has("cooked") ? "default" : "outline"}
          size="sm"
          onClick={() => toggleInteraction("cooked")}
          className={interactionsQ.data?.has("cooked") ? "bg-[image:var(--gradient-warm)]" : ""}
        >
          <ChefHat className="h-4 w-4 mr-2" />Pişirdim
        </Button>
        <Button
          variant={interactionsQ.data?.has("liked") ? "default" : "outline"}
          size="sm"
          onClick={() => toggleInteraction("liked")}
        >
          <Heart className="h-4 w-4 mr-2" />Beğendim
        </Button>
        <LikeButton recipeId={id} />
        {avgOverall > 0 && (
          <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
            <StarRating value={Math.round(avgOverall)} /> ({ratingsQ.data?.length})
          </div>
        )}
      </div>

      {data.image_url && (
        <img src={data.image_url} alt={data.title} className="w-full h-64 object-cover rounded-2xl mb-6 border border-border" />
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-3">Malzemeler</h2>
          <ul className="space-y-2 text-sm">
            {ingredients.map((i, k) => (
              <li key={k} className="flex gap-2">
                <Bookmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{i.amount ? `${i.amount} ` : ""}{i.name}</span>
              </li>
            ))}
          </ul>
          {data.time_minutes && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />{data.time_minutes} dakika
            </div>
          )}
          {(data.estimated_cost != null || data.estimated_calories != null) && (
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              {data.estimated_cost != null && <div>Tahmini maliyet: ~{data.estimated_cost}₺</div>}
              {data.estimated_calories != null && <div>Tahmini kalori: ~{data.estimated_calories}</div>}
            </div>
          )}
          {data.tags?.length ? (
            <div className="flex flex-wrap gap-1 mt-4">
              {data.tags.map((t: string) => (
                <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{t}</span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-3">Adımlar</h2>
            <ol className="space-y-3 text-sm">
              {steps.map((s, k) => (
                <li key={k} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-warm)] text-primary-foreground text-xs font-semibold">{k + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {isOwner && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold mb-3">Kapak görseli</h2>
              <RecipeImageUpload value={data.image_url} onChange={updateImage} />
            </div>
          )}

          {/* Rating form */}
          {user && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold mb-3">Değerlendir</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-1">Genel puan</div>
                  <StarRating value={overall} onChange={setOverall} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {SUB_LABELS.map((s) => (
                    <div key={s.key}>
                      <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                      <StarRating value={subs[s.key] ?? 0} onChange={(v) => setSubs((p) => ({ ...p, [s.key]: v }))} />
                    </div>
                  ))}
                </div>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Yorum (isteğe bağlı)" rows={3} />
                <Button onClick={submitRating} className="bg-[image:var(--gradient-warm)]">Değerlendirmeyi kaydet</Button>
              </div>
            </div>
          )}

          {ratingsQ.data?.length ? (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold mb-3">Yorumlar ({ratingsQ.data.length})</h2>
              <ul className="space-y-3">
                {ratingsQ.data.map((r) => (
                  <li key={r.id} className="border-b border-border pb-3 last:border-0">
                    <StarRating value={Math.round(Number(r.overall))} />
                    {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
