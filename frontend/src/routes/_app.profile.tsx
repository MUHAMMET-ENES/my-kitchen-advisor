import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Award, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const EQUIPMENT = ["Ocak", "Mikrodalga", "Tost makinesi", "Su ısıtıcısı", "Fırın", "Air fryer"];

type Prefs = {
  default_servings?: number;
  equipment?: string[];
  dislikes?: string[];
  constraints?: string[];
  theme?: string;
};

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profil" }] }),
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const badgesQ = useQuery({
    queryKey: ["badges-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("badges").select("id", { count: "exact", head: true }).eq("user_id", user!.id);
      return count ?? 0;
    },
  });

  const [name, setName] = useState("");
  const [servings, setServings] = useState("1");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState("");

  useEffect(() => {
    if (!data) return;
    setName(data.full_name ?? "");
    const p = (data.preferences as Prefs) ?? {};
    setServings(String(p.default_servings ?? 1));
    setEquipment(p.equipment ?? []);
    setDislikes((p.dislikes ?? []).join(", "));
  }, [data]);

  const save = async () => {
    if (!user) return;
    const prefs: Prefs = {
      default_servings: Number(servings),
      equipment,
      dislikes: dislikes.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const { error } = await supabase.from("profiles").update({
      full_name: name,
      preferences: prefs,
    }).eq("id", user.id);
    if (error) toast.error(error.message);
    else { toast.success("Kaydedildi"); qc.invalidateQueries({ queryKey: ["profile"] }); }
  };

  const toggleEq = (e: string) => setEquipment((p) => p.includes(e) ? p.filter((x) => x !== e) : [...p, e]);

  return (
    <>
      <PageHeader title="Profil" description="Bilgilerin ve tercihlerin" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold">Hesap</h2>
            <div><Label>Ad</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>E-posta</Label><Input value={user?.email ?? ""} disabled /></div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold">Tercihler</h2>
            <div>
              <Label>Varsayılan porsiyon</Label>
              <Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Sahip olduğun ekipman</Label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEq(e)}
                    className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                      equipment.includes(e) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Sevmediğin malzemeler (virgülle ayır)</Label>
              <Input value={dislikes} onChange={(e) => setDislikes(e.target.value)} placeholder="mantar, balık" />
            </div>
            <Button onClick={save} className="bg-[image:var(--gradient-warm)]">Kaydet</Button>
          </div>
        </div>

        <div className="space-y-4">
          <Link to="/badges" className="block rounded-2xl border border-border bg-[image:var(--gradient-warm)] text-primary-foreground p-6 shadow-[var(--shadow-warm)] hover:-translate-y-0.5 transition-transform">
            <Award className="h-8 w-8 mb-2" />
            <div className="font-display text-2xl font-semibold">{badgesQ.data ?? 0} rozet</div>
            <div className="text-sm opacity-90 mt-1">Tüm rozetleri gör</div>
            <ArrowRight className="h-4 w-4 mt-3" />
          </Link>
        </div>
      </div>
    </>
  );
}
