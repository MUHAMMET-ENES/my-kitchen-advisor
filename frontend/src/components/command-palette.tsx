import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Home, BookOpen, Package, ShoppingCart, Sparkles, Bookmark, Award, Bell, User, Settings, CalendarDays, Activity, Compass, Plus } from "lucide-react";

const COMMANDS: { label: string; to: string; icon: typeof Home; group: string; keywords?: string }[] = [
  { label: "Panel", to: "/dashboard", icon: Home, group: "Sayfa" },
  { label: "Haftalık plan", to: "/plan", icon: CalendarDays, group: "Sayfa", keywords: "menu plan meal" },
  { label: "Beslenme koçu", to: "/nutrition", icon: Activity, group: "Sayfa", keywords: "macro kalori protein" },
  { label: "Keşfet", to: "/discover", icon: Compass, group: "Sayfa", keywords: "topluluk sosyal" },
  { label: "Tariflerim", to: "/recipes", icon: BookOpen, group: "Sayfa" },
  { label: "Buzdolabım", to: "/pantry", icon: Package, group: "Sayfa" },
  { label: "Alışveriş", to: "/shopping", icon: ShoppingCart, group: "Sayfa" },
  { label: "AI Asistan", to: "/ai", icon: Sparkles, group: "Sayfa" },
  { label: "Kayıtlılar", to: "/saved", icon: Bookmark, group: "Sayfa" },
  { label: "Rozetler", to: "/badges", icon: Award, group: "Sayfa" },
  { label: "Bildirimler", to: "/notifications", icon: Bell, group: "Sayfa" },
  { label: "Profil", to: "/profile", icon: User, group: "Hesap" },
  { label: "Ayarlar", to: "/settings", icon: Settings, group: "Hesap" },
  { label: "Yeni tarif", to: "/recipes/new", icon: Plus, group: "Eylem" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const grouped = COMMANDS.reduce<Record<string, typeof COMMANDS>>((acc, c) => {
    (acc[c.group] ||= []).push(c);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-xl">
        <Command>
          <CommandInput placeholder="Sayfa ya da eylem ara…" />
          <CommandList>
            <CommandEmpty>Sonuç yok.</CommandEmpty>
            {Object.entries(grouped).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((c) => (
                  <CommandItem
                    key={c.to}
                    value={`${c.label} ${c.keywords ?? ""}`}
                    onSelect={() => { setOpen(false); navigate({ to: c.to }); }}
                  >
                    <c.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                    {c.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
