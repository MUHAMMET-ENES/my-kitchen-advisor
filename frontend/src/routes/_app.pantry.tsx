import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Snowflake } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/pantry")({
  head: () => ({ meta: [{ title: "Buzdolabım" }] }),
  component: Pantry,
});

function Pantry() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [exp, setExp] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["pantry", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("pantry_items").select("*").eq("user_id", user!.id)
        .order("expires_at", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const add = async () => {
    if (!name || !user) return;
    const { error } = await supabase.from("pantry_items").insert({
      user_id: user.id, name, quantity: qty ? Number(qty) : null, unit: unit || null, expires_at: exp || null,
    });
    if (error) { toast.error(error.message); return; }
    setName(""); setQty(""); setUnit(""); setExp("");
    qc.invalidateQueries({ queryKey: ["pantry"] });
  };

  const remove = async (id: string) => {
    await supabase.from("pantry_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["pantry"] });
  };

  return (
    <>
      <PageHeader title="Buzdolabım" description="Eldeki malzemeler, son kullanma tarihleri, kalan yemekler" />

      <div className="rounded-2xl border border-border bg-card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2"><Label>Ürün</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Yumurta" /></div>
          <div><Label>Miktar</Label><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
          <div><Label>Birim</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="adet" /></div>
          <div><Label>SKT</Label><Input type="date" value={exp} onChange={(e) => setExp(e.target.value)} /></div>
        </div>
        <Button onClick={add} disabled={!name} className="mt-4 bg-[image:var(--gradient-warm)]"><Plus className="h-4 w-4 mr-2" />Ekle</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="p-6 text-muted-foreground">Yükleniyor…</div>
        ) : !data?.length ? (
          <div className="p-6 text-muted-foreground">Buzdolabınız boş. Üstten ürün ekleyin.</div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((p) => {
              const daysLeft = p.expires_at ? Math.ceil((new Date(p.expires_at).getTime() - Date.now()) / 86_400_000) : null;
              const urgent = daysLeft !== null && daysLeft <= 3;
              return (
                <li key={p.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${urgent ? "bg-destructive/15 text-destructive" : "bg-secondary text-primary"}`}>
                      <Snowflake className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.quantity ?? ""} {p.unit ?? ""} {p.expires_at && `· SKT: ${p.expires_at}${urgent ? ` (${daysLeft} gün)` : ""}`}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
