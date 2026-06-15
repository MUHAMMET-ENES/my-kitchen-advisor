import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/shopping")({
  head: () => ({ meta: [{ title: "Alışveriş" }] }),
  component: Shopping,
});

function Shopping() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");

  const { data } = useQuery({
    queryKey: ["shopping", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("shopping_items").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const add = async () => {
    if (!name || !user) return;
    await supabase.from("shopping_items").insert({ user_id: user.id, name, estimated_cost: cost ? Number(cost) : null });
    setName(""); setCost("");
    qc.invalidateQueries({ queryKey: ["shopping"] });
  };

  const toggle = async (id: string, val: boolean) => {
    await supabase.from("shopping_items").update({ is_done: val }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["shopping"] });
  };

  const remove = async (id: string) => {
    await supabase.from("shopping_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["shopping"] });
  };

  const total = (data ?? []).reduce((s, i) => s + (i.estimated_cost ?? 0), 0);

  const splitShare = () => {
    const persons = prompt("Kaç kişiye böleceğiz?");
    const n = persons ? Math.max(1, parseInt(persons)) : 1;
    const per = (total / n).toFixed(2);
    const msg = `Bu haftaki alışveriş: ${total.toFixed(2)}₺ · ${n} kişi · kişi başı ${per}₺`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <PageHeader title="Alışveriş" description="Listeni hazırla, kişi başı borcu WhatsApp ile paylaş" />

      <div className="rounded-2xl border border-border bg-card p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ürün adı" /></div>
        <div className="w-32"><Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="₺" /></div>
        <Button onClick={add} disabled={!name} className="bg-[image:var(--gradient-warm)]"><Plus className="h-4 w-4 mr-2" />Ekle</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="font-display text-lg font-semibold">Toplam: <span className="text-primary">{total.toFixed(2)} ₺</span></div>
          <Button variant="outline" size="sm" onClick={splitShare}><MessageCircle className="h-4 w-4 mr-2" />WhatsApp'tan paylaş</Button>
        </div>
        {!data?.length ? (
          <div className="p-6 text-muted-foreground">Liste boş.</div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((it) => (
              <li key={it.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Checkbox checked={it.is_done} onCheckedChange={(v) => toggle(it.id, !!v)} />
                  <div>
                    <div className={it.is_done ? "line-through text-muted-foreground" : ""}>{it.name}</div>
                    {it.estimated_cost != null && <div className="text-xs text-muted-foreground">{it.estimated_cost} ₺</div>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
