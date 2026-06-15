import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Giriş — Yurttaş Mutfakta" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const signInEmail = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/dashboard" });
  };

  const signUpEmail = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Hesap oluşturuldu. Devam edebilirsiniz.");
  };

  const resetReq = async () => {
    if (!email) { toast.error("E-posta gerekli"); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Sıfırlama bağlantısı e-postana gönderildi"); setForgot(false); }
  };

  const google = async () => {
    setBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (r.error) { toast.error("Google ile giriş başarısız"); setBusy(false); return; }
    if (r.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-warm)] mb-4">
            <ChefHat className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-semibold">Yurttaş Mutfakta</h1>
          <p className="text-sm text-muted-foreground mt-1">Yurt mutfağına hoş geldin</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-warm)]">
          {forgot ? (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold">Şifremi unuttum</h2>
              <div><Label>E-posta</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <Button onClick={resetReq} disabled={busy} className="w-full bg-[image:var(--gradient-warm)]">Sıfırlama bağlantısı gönder</Button>
              <Button variant="ghost" className="w-full" onClick={() => setForgot(false)}>Geri</Button>
            </div>
          ) : (
            <>
              <Button onClick={google} disabled={busy} variant="outline" className="w-full mb-4">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google ile devam et
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">veya e-posta ile</span></div>
              </div>

              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Giriş</TabsTrigger>
                  <TabsTrigger value="signup">Kayıt</TabsTrigger>
                </TabsList>
                <TabsContent value="signin" className="space-y-3 mt-4">
                  <div><Label>E-posta</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div><Label>Şifre</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                  <Button onClick={signInEmail} disabled={busy} className="w-full bg-[image:var(--gradient-warm)]">Giriş yap</Button>
                  <button onClick={() => setForgot(true)} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">Şifremi unuttum</button>
                </TabsContent>
                <TabsContent value="signup" className="space-y-3 mt-4">
                  <div><Label>Ad</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div><Label>E-posta</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div><Label>Şifre</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                  <Button onClick={signUpEmail} disabled={busy} className="w-full bg-[image:var(--gradient-warm)]">Hesap oluştur</Button>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
