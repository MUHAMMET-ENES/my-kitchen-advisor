import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageCircle, Send, Trash2 } from "lucide-react";

export function RecipeComments({ recipeId }: { recipeId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const q = useQuery({
    queryKey: ["comments", recipeId],
    queryFn: async () => {
      const { data } = await supabase.from("recipe_comments").select("id, body, user_id, created_at")
        .eq("recipe_id", recipeId).order("created_at", { ascending: false });
      const ids = Array.from(new Set((data ?? []).map((c) => c.user_id)));
      const profiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (ids.length) {
        const { data: ps } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids);
        (ps ?? []).forEach((p) => { profiles[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }; });
      }
      return { items: data ?? [], profiles };
    },
  });

  const submit = async () => {
    if (!user || !body.trim()) return;
    const { error } = await supabase.from("recipe_comments").insert({ user_id: user.id, recipe_id: recipeId, body: body.trim() });
    if (error) { toast.error(error.message); return; }
    setBody("");
    qc.invalidateQueries({ queryKey: ["comments", recipeId] });
  };

  const remove = async (id: string) => {
    await supabase.from("recipe_comments").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["comments", recipeId] });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Yorumlar ({q.data?.items.length ?? 0})</h2>
      </div>
      {user && (
        <div className="flex gap-2 mb-4">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Yorum yaz…" rows={2} className="flex-1" />
          <Button onClick={submit} disabled={!body.trim()} className="bg-[image:var(--gradient-warm)] self-end"><Send className="h-4 w-4" /></Button>
        </div>
      )}
      <ul className="space-y-3">
        {(q.data?.items ?? []).map((c) => {
          const p = q.data?.profiles[c.user_id];
          return (
            <li key={c.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
              {p?.avatar_url ? <img src={p.avatar_url} alt="" className="h-8 w-8 rounded-full" /> : <div className="h-8 w-8 rounded-full bg-secondary" />}
              <div className="flex-1">
                <div className="text-sm font-medium">{p?.full_name ?? "Şef"} <span className="text-xs text-muted-foreground font-normal ml-1">{new Date(c.created_at).toLocaleDateString("tr-TR")}</span></div>
                <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap">{c.body}</p>
              </div>
              {c.user_id === user?.id && (
                <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </li>
          );
        })}
        {!q.data?.items.length && <li className="text-sm text-muted-foreground">Henüz yorum yok.</li>}
      </ul>
    </div>
  );
}

export function LikeButton({ recipeId }: { recipeId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["likes", recipeId],
    queryFn: async () => {
      const [{ count }, { data: mine }] = await Promise.all([
        supabase.from("recipe_likes").select("user_id", { count: "exact", head: true }).eq("recipe_id", recipeId),
        user ? supabase.from("recipe_likes").select("user_id").eq("recipe_id", recipeId).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      return { count: count ?? 0, liked: !!mine };
    },
  });

  const toggle = async () => {
    if (!user) return;
    if (q.data?.liked) {
      await supabase.from("recipe_likes").delete().eq("user_id", user.id).eq("recipe_id", recipeId);
    } else {
      await supabase.from("recipe_likes").insert({ user_id: user.id, recipe_id: recipeId });
    }
    qc.invalidateQueries({ queryKey: ["likes", recipeId] });
  };

  return (
    <button onClick={toggle} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary transition-colors">
      <span className={q.data?.liked ? "text-rose-500" : "text-muted-foreground"}>♥</span>
      <span>{q.data?.count ?? 0}</span>
    </button>
  );
}
