import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, RefreshCw } from "lucide-react";
import { refreshExpiryNotifications } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Bildirimler" }] }),
  component: Notifications,
});

function Notifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const refreshFn = useServerFn(refreshExpiryNotifications);

  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const refresh = useMutation({
    mutationFn: async () => refreshFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => { if (user) refresh.mutate(); /* once on mount */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <>
      <PageHeader
        title="Bildirimler"
        description="Son kullanma uyarıları ve alışveriş hatırlatmaları"
        action={
          <Button variant="outline" onClick={() => refresh.mutate()} disabled={refresh.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refresh.isPending ? "animate-spin" : ""}`} />Yenile
          </Button>
        }
      />
      <div className="rounded-2xl border border-border bg-card">
        {!data?.length ? (
          <div className="p-12 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Bildirim yok.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((n) => (
              <li key={n.id} className={`p-4 flex items-start justify-between gap-4 ${n.is_read ? "opacity-60" : ""}`}>
                <div>
                  <div className="font-medium">{n.title}</div>
                  {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("tr-TR")}</div>
                </div>
                <div className="flex gap-1">
                  {!n.is_read && (
                    <Button variant="ghost" size="icon" onClick={() => markRead(n.id)}><Check className="h-4 w-4" /></Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => remove(n.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
