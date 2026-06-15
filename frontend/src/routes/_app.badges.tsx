import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Award, Lock } from "lucide-react";

const ALL_BADGES = [
  { code: "first_recipe", label: "İlk tarif", desc: "İlk tarifini kaydet" },
  { code: "ten_recipes", label: "Tarif koleksiyoncusu", desc: "10 tarife ulaş" },
  { code: "first_cooked", label: "İlk pişirme", desc: "İlk tarifini pişir" },
  { code: "five_cooked", label: "Yurt aşçısı", desc: "5 tarif pişir" },
  { code: "twenty_cooked", label: "Yurt şefi", desc: "20 tarif pişir" },
  { code: "pantry_starter", label: "Buzdolabı hazır", desc: "5 ürün ekle" },
];

export const Route = createFileRoute("/_app/badges")({
  head: () => ({ meta: [{ title: "Rozetler" }] }),
  component: Badges,
});

function Badges() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["badges", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("badges").select("*").eq("user_id", user!.id);
      return new Set((data ?? []).map((b) => b.code));
    },
  });

  return (
    <>
      <PageHeader title="Rozetler" description="Mutfak yolculuğunda kazandıkların" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ALL_BADGES.map((b) => {
          const earned = data?.has(b.code);
          return (
            <div
              key={b.code}
              className={`rounded-2xl border p-5 text-center shadow-[var(--shadow-soft)] ${
                earned ? "border-primary bg-[image:var(--gradient-warm)] text-primary-foreground" : "border-border bg-card opacity-70"
              }`}
            >
              <div className="flex justify-center mb-2">
                {earned ? <Award className="h-10 w-10" /> : <Lock className="h-10 w-10 text-muted-foreground" />}
              </div>
              <div className="font-display font-semibold">{b.label}</div>
              <div className={`text-xs mt-1 ${earned ? "opacity-90" : "text-muted-foreground"}`}>{b.desc}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
