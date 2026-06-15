import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function RecipeImageUpload({
  value, onChange, label = "Görsel",
}: { value: string | null; onChange: (url: string | null) => void; label?: string }) {
  const { user } = useAuth();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => ref.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !user) return;
    if (!ALLOWED.includes(f.type)) { toast.error("Sadece JPG/PNG/WEBP"); return; }
    if (f.size > MAX_BYTES) { toast.error("En fazla 5MB"); return; }
    setBusy(true);
    const path = `${user.id}/${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("recipe-images").upload(path, f, { upsert: false });
    if (error) { toast.error(error.message); setBusy(false); return; }
    const { data: signed } = await supabase.storage.from("recipe-images").createSignedUrl(path, 60 * 60 * 24 * 365);
    setBusy(false);
    if (signed?.signedUrl) {
      onChange(signed.signedUrl);
      toast.success("Görsel yüklendi");
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-32 rounded-xl object-cover border border-border" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={pick} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImagePlus className="h-4 w-4 mr-2" />}
          {busy ? "Yükleniyor…" : "Görsel ekle"}
        </Button>
      )}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
    </div>
  );
}
