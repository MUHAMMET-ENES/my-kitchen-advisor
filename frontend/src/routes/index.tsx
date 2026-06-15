import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, Package, ShoppingCart, BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yurttaş Mutfakta — Öğrenciler için akıllı mutfak asistanı" },
      { name: "description", content: "Yapay zeka destekli tarifler, israfsız kiler ve akıllı alışveriş — yurt mutfağına özel." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-warm)] text-primary-foreground shadow-[var(--shadow-warm)]">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold">Yurttaş <span className="text-primary">Mutfakta</span></span>
        </Link>
        <Button asChild variant="outline"><Link to="/auth">Giriş yap</Link></Button>
      </header>

      <section className="px-6 md:px-12 py-12 md:py-24 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground mb-6">
              <Sparkles className="h-3 w-3" /> Öğrenciler için, sıfırdan tasarlandı
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
              Yurt mutfağında <span className="text-primary">akıllı</span> yemek pişir
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Bütçen, zamanın, ekipmanın ve elindeki malzemelere göre yapay zeka sana tarif üretsin. Buzdolabını yönet, israfı azalt, parayı paylaş.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[image:var(--gradient-warm)] shadow-[var(--shadow-warm)]">
                <Link to="/auth">Hemen başla <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { i: Sparkles, t: "AI Tarif", d: "Eldeki malzemeden öneri" },
              { i: Package, t: "Buzdolabım", d: "SKT takibi, israf yok" },
              { i: BookOpen, t: "Tarif Havuzu", d: "Kendi tariflerini sakla" },
              { i: ShoppingCart, t: "Akıllı Liste", d: "Bütçeli alışveriş" },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-display text-lg font-semibold">{t}</div>
                <div className="text-sm text-muted-foreground mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 px-6 md:px-12 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Yurttaş Mutfakta
      </footer>
    </div>
  );
}
