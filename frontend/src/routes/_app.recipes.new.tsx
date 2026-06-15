import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/lib/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RecipeImageUpload } from "@/components/recipe-image-upload";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/recipes/new")({
  head: () => ({ meta: [{ title: "Yeni tarif" }] }),
  component: NewRecipe,
});

function NewRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [time, setTime] = useState("");
  const [cost, setCost] = useState("");
  const [calories, setCalories] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!title || !user) return;
    setBusy(true);
    const { data, error } = await supabase.from("recipes").insert({
      user_id: user.id,
      title, description: desc,
      time_minutes: time ? Number(time) : null,
      estimated_cost: cost ? Number(cost) : null,
      estimated_calories: calories ? Number(calories) : null,
      image_url: image,
      ingredients: ingredients.split("\n").filter(Boolean).map((l) => ({ name: l })),
      steps: steps.split("\n").filter(Boolean),
      source: "manual",
    }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Tarif eklendi");
    navigate({ to: "/recipes/$id", params: { id: data.id } });
  };

  return (
    <>
      <PageHeader title="Yeni tarif" description="Kendi tarifini ekle" />
      <div className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
        <div><Label>Başlık</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label>Açıklama</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Süre (dk)</Label><Input type="number" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div><Label>Maliyet (₺)</Label><Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
          <div><Label>Kalori</Label><Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} /></div>
        </div>
        <div>
          <Label>Malzemeler (her satıra bir tane)</Label>
          <Textarea rows={6} value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="2 yumurta&#10;1 dilim ekmek" />
        </div>
        <div>
          <Label>Adımlar (her satıra bir tane)</Label>
          <Textarea rows={6} value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="Yumurtaları kır...&#10;Ekmeği kızart..." />
        </div>
        <RecipeImageUpload value={image} onChange={setImage} label="Kapak görseli" />
        <Button onClick={save} disabled={busy || !title} className="bg-[image:var(--gradient-warm)]">Kaydet</Button>
      </div>
    </>
  );
}
