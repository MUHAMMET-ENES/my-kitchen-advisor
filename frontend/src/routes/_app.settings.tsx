import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Ayarlar" }] }),
  component: Settings,
});

function Settings() {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();

  const clearAiHistory = async () => {
    if (!user) return;
    if (!confirm("Tüm AI geçmişin silinsin mi?")) return;
    await supabase.from("ai_history").delete().eq("user_id", user.id);
    await supabase.from("search_history").delete().eq("user_id", user.id);
    toast.success("Geçmiş silindi"); qc.invalidateQueries();
  };

  const clearNotifications = async () => {
    if (!user) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    toast.success("Bildirimler temizlendi"); qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <>
      <PageHeader title="Ayarlar" />
      <div className="max-w-2xl space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-2">Veri & gizlilik</h2>
          <p className="text-sm text-muted-foreground mb-4">Tariflerin, buzdolabın ve notların özeldir. Yalnızca senin tarafından oluşturulan paylaşım bağlantıları başkaları tarafından açılabilir.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={clearAiHistory}>AI geçmişimi sil</Button>
            <Button variant="outline" onClick={clearNotifications}>Bildirimleri temizle</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-2">Hesap</h2>
          <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
          <Button variant="outline" onClick={signOut}>Çıkış yap</Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold mb-2">Yurttaş Mutfakta hakkında</h2>
          <p className="text-sm text-muted-foreground">
            Yurt ve öğrenci mutfağına özel: kısıtlı bütçe, az ekipman, küçük alan ve atık azaltma odaklı bir AI mutfak asistanı.
          </p>
        </div>
      </div>
    </>
  );
}
