import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { barcodeLookup } from "@/lib/premium.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Barcode, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export function BarcodeAdd() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const lookup = useServerFn(barcodeLookup);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [product, setProduct] = useState<{
    name: string; brand: string; image_url: string | null; quantity: string | null;
  } | null>(null);

  const search = async () => {
    if (!code) return;
    setBusy(true);
    try {
      const p = await lookup({ data: { barcode: code } });
      setProduct({ name: p.name, brand: p.brand, image_url: p.image_url, quantity: p.quantity });
    } catch (e) {
      toast.error((e as Error).message);
      setProduct(null);
    } finally { setBusy(false); }
  };

  const add = async () => {
    if (!product || !user) return;
    const { error } = await supabase.from("pantry_items").insert({
      user_id: user.id,
      name: product.name || "Bilinmeyen ürün",
      brand: product.brand || null,
      barcode: code,
      image_url: product.image_url,
      unit: product.quantity ?? null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Buzdolabına eklendi");
    qc.invalidateQueries({ queryKey: ["pantry"] });
    setOpen(false); setCode(""); setProduct(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Barcode className="h-4 w-4 mr-2" />Barkod ile ekle</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Barkod ile ürün ekle</DialogTitle></DialogHeader>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9A-Za-z]/g, ""))}
            placeholder="Barkod numarası (8/12/13 hane)"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <Button onClick={search} disabled={busy || !code} className="bg-[image:var(--gradient-warm)]">
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Ara"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Açık Gıda Verileri (Open Food Facts) üzerinden sorgulanır.</p>

        {product && (
          <div className="mt-2 rounded-xl border border-border bg-card p-4 flex gap-3">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="h-16 w-16 object-cover rounded-lg" />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground"><Barcode className="h-6 w-6" /></div>
            )}
            <div className="flex-1">
              <div className="font-medium">{product.name || "—"}</div>
              <div className="text-xs text-muted-foreground">{product.brand} {product.quantity ? `· ${product.quantity}` : ""}</div>
              <Button size="sm" onClick={add} className="mt-2 bg-[image:var(--gradient-warm)]"><Plus className="h-3 w-3 mr-1" />Buzdolabına ekle</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
