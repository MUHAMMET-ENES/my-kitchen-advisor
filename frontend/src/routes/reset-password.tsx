import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Şifre sıfırla" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const update = async () => {
    if (password.length < 6) { toast.error("En az 6 karakter olmalı"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Şifre güncellendi"); navigate({ to: "/dashboard" }); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-warm)] mb-4">
            <ChefHat className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-semibold">Yeni şifre</h1>
          <p className="text-sm text-muted-foreground mt-1">Yeni şifreni belirle</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-warm)] space-y-4">
          <div><Label>Yeni şifre</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button onClick={update} disabled={busy} className="w-full bg-[image:var(--gradient-warm)]">Şifreyi güncelle</Button>
        </div>
      </div>
    </div>
  );
}
