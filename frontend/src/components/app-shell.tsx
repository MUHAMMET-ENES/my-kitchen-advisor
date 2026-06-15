import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, BookOpen, Package, ShoppingCart, Sparkles, Bookmark, User, Settings, LogOut, ChefHat, Menu, X, Bell, Award,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Panel", icon: Home },
  { to: "/recipes", label: "Tarifler", icon: BookOpen },
  { to: "/pantry", label: "Buzdolabım", icon: Package },
  { to: "/shopping", label: "Alışveriş", icon: ShoppingCart },
  { to: "/ai", label: "AI Asistan", icon: Sparkles },
  { to: "/saved", label: "Kayıtlılar", icon: Bookmark },
  { to: "/badges", label: "Rozetler", icon: Award },
] as const;

const BOTTOM_NAV = [
  { to: "/profile", label: "Profil", icon: User },
  { to: "/settings", label: "Ayarlar", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const unreadQ = useQuery({
    queryKey: ["notif-unread", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true })
        .eq("user_id", user!.id).eq("is_read", false);
      return count ?? 0;
    },
    refetchInterval: 60_000,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-warm)]">
                <ChefHat className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight">
                Yurttaş <span className="text-primary">Mutfakta</span>
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.slice(0, 4).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  location.startsWith(n.to)
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/notifications" className="relative">
                  <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
                  {(unreadQ.data ?? 0) > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Link>
                <span className="hidden sm:inline text-sm text-muted-foreground">{user.email}</span>
                <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button asChild size="sm"><Link to="/auth">Giriş yap</Link></Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-16 left-0 z-30 w-64 transform border-r border-border/60 bg-sidebar p-4 transition-transform md:static md:inset-y-0 md:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => {
              const Active = location === n.to || location.startsWith(n.to + "/");
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    Active
                      ? "bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-soft)]"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
            <div className="my-3 h-px bg-border" />
            {BOTTOM_NAV.map((n) => {
              const Active = location.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    Active ? "bg-secondary text-secondary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      <footer className="border-t border-border/60 bg-card/50 px-4 md:px-8 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Yurttaş Mutfakta · Öğrenciler için akıllı mutfak asistanı
      </footer>
    </div>
  );
}
