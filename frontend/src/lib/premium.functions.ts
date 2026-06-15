import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PlanInput = z.object({
  week_start: z.string().min(10).max(10),
  prompt: z.string().max(1000).optional(),
  servings: z.number().min(1).max(20).default(1),
  budget_per_day: z.number().min(0).max(2000).optional(),
  goals: z.object({
    kcal: z.number().min(800).max(6000).optional(),
    protein: z.number().min(0).max(400).optional(),
  }).optional(),
  preferences: z.object({
    no_electricity: z.boolean().optional(),
    odor_free: z.boolean().optional(),
    dislikes: z.array(z.string()).optional(),
  }).optional(),
  pantry: z.array(z.string()).optional(),
  auto_shopping: z.boolean().default(true),
});

type DayPlan = {
  day: string;
  breakfast: { title: string; kcal: number; protein: number; cost: number; time: number; ingredients: { name: string; amount?: string }[] };
  lunch: { title: string; kcal: number; protein: number; cost: number; time: number; ingredients: { name: string; amount?: string }[] };
  dinner: { title: string; kcal: number; protein: number; cost: number; time: number; ingredients: { name: string; amount?: string }[] };
  snack?: { title: string; kcal: number; protein: number };
};

async function callAi(system: string, user: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI anahtarı eksik");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 429) throw new Error("Çok sık istek, biraz bekleyin.");
  if (res.status === 402) throw new Error("AI kredisi bitti.");
  if (!res.ok) throw new Error(`AI hatası: ${res.status}`);
  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content ?? "{}";
  try { return JSON.parse(content); } catch { return {}; }
}

export const generateWeeklyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data, context }) => {
    const sys = `Sen Türk öğrenciler için 7 günlük yurt-mutfak yemek planı kuran asistansın.
Gerçekçi, ucuz, hızlı, az bulaşıklı tarifler öner. Aynı malzemeleri art arda öğünlerde kullanarak israfı azalt.
Yanıtı SADECE şu JSON şemasında ver (Türkçe alan değerleri):
{
  "days": [ // 7 öğe, Pazartesi-Pazar sırasıyla
    {
      "day": "Pazartesi",
      "breakfast": {"title": string, "kcal": number, "protein": number, "cost": number, "time": number, "ingredients": [{"name": string, "amount": string}]},
      "lunch": {...},
      "dinner": {...},
      "snack": {"title": string, "kcal": number, "protein": number}
    }
  ],
  "shopping_list": [{"name": string, "amount": string, "category": string}],
  "summary": {"total_cost": number, "avg_kcal_per_day": number, "avg_protein_per_day": number, "highlights": [string]}
}`;
    const userMsg = `Hafta başlangıcı: ${data.week_start}
Porsiyon: ${data.servings}
${data.budget_per_day ? `Günlük bütçe: ${data.budget_per_day}₺` : ""}
${data.goals?.kcal ? `Günlük kalori hedefi: ~${data.goals.kcal} kcal` : ""}
${data.goals?.protein ? `Günlük protein hedefi: ~${data.goals.protein} g` : ""}
${data.preferences?.no_electricity ? "Elektrik yok." : ""}
${data.preferences?.odor_free ? "Kokusuz olsun (oda arkadaşı dostu)." : ""}
${data.preferences?.dislikes?.length ? `Sevmedikleri: ${data.preferences.dislikes.join(", ")}` : ""}
${data.pantry?.length ? `Elindeki malzemeler: ${data.pantry.join(", ")}` : ""}
${data.prompt ? `Ek not: ${data.prompt}` : ""}`;

    const plan = await callAi(sys, userMsg);

    const { data: saved, error } = await context.supabase.from("meal_plans").upsert({
      user_id: context.userId,
      week_start: data.week_start,
      plan: plan as never,
      ai_meta: { goals: data.goals, preferences: data.preferences } as never,
    }, { onConflict: "user_id,week_start" }).select().single();
    if (error) throw new Error(error.message);

    if (data.auto_shopping && Array.isArray(plan.shopping_list)) {
      const have = new Set((data.pantry ?? []).map((p) => p.toLowerCase().trim()));
      const items = (plan.shopping_list as { name: string; amount?: string; category?: string }[])
        .filter((s) => s.name && !have.has(s.name.toLowerCase().trim()))
        .map((s) => ({
          user_id: context.userId,
          name: s.name,
          unit: s.amount ?? null,
          category: s.category ?? null,
        }));
      if (items.length) {
        await context.supabase.from("shopping_items").insert(items as never);
      }
    }

    return { id: saved.id, plan };
  });

const NutInput = z.object({
  recipe_id: z.string().uuid().optional(),
  ingredients: z.array(z.object({ name: z.string(), amount: z.string().optional() })),
  servings: z.number().min(1).max(20).default(1),
});

export const estimateNutrition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => NutInput.parse(d))
  .handler(async ({ data, context }) => {
    const sys = `Sen bir beslenme tahminleyicisin. Tarif için kalori ve makro tahmini ver.
Yanıt SADECE şu JSON şemasında olsun (porsiyon başına):
{"kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number, "confidence": "low"|"medium"|"high"}`;
    const userMsg = `Porsiyon: ${data.servings}
Malzemeler: ${data.ingredients.map((i) => `${i.amount ?? ""} ${i.name}`).join(", ")}`;
    const out = await callAi(sys, userMsg);
    const result = {
      kcal: Number(out.kcal) || 0,
      protein_g: Number(out.protein_g) || 0,
      carbs_g: Number(out.carbs_g) || 0,
      fat_g: Number(out.fat_g) || 0,
      confidence: out.confidence ?? "low",
    };
    if (data.recipe_id) {
      await context.supabase.from("recipes").update({
        estimated_calories: result.kcal,
        protein_g: result.protein_g,
        carbs_g: result.carbs_g,
        fat_g: result.fat_g,
      }).eq("id", data.recipe_id).eq("user_id", context.userId);
    }
    return result;
  });

const LogInput = z.object({
  log_date: z.string().min(10).max(10).optional(),
  meal: z.enum(["breakfast", "lunch", "dinner", "snack"]).default("snack"),
  recipe_id: z.string().uuid().optional(),
  servings: z.number().min(0.1).max(20).default(1),
  kcal: z.number().min(0).max(10000),
  protein: z.number().min(0).max(500).default(0),
  carbs: z.number().min(0).max(2000).default(0),
  fat: z.number().min(0).max(500).default(0),
  note: z.string().max(500).optional(),
});

export const logNutrition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LogInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("nutrition_logs").insert({
      user_id: context.userId,
      log_date: data.log_date ?? new Date().toISOString().slice(0, 10),
      meal: data.meal,
      recipe_id: data.recipe_id ?? null,
      servings: data.servings,
      kcal: data.kcal,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      note: data.note ?? null,
    }).select().single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

const DailyPickInput = z.object({
  pantry: z.array(z.string()).optional(),
  expiring: z.array(z.string()).optional(),
  mood: z.string().max(120).optional(),
});

export const dailyPick = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DailyPickInput.parse(d))
  .handler(async ({ data }) => {
    const sys = `Sen yurt mutfağı için "bugün ne pişirsem" önericisin. Tek bir öneri ver.
Yanıt SADECE şu JSON şemasında olsun:
{"title": string, "reason": string, "time_minutes": number, "kcal": number, "tags": [string]}`;
    const userMsg = `${data.mood ? `Ruh hali: ${data.mood}.` : ""}
${data.expiring?.length ? `Önce kullanmalı: ${data.expiring.join(", ")}.` : ""}
${data.pantry?.length ? `Mevcut: ${data.pantry.slice(0, 30).join(", ")}.` : ""}
Tek bir hızlı, gerçekçi öneri ver.`;
    const out = await callAi(sys, userMsg);
    return out;
  });

const BarcodeInput = z.object({ barcode: z.string().min(4).max(32).regex(/^[0-9A-Za-z]+$/) });

export const barcodeLookup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => BarcodeInput.parse(d))
  .handler(async ({ data }) => {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(data.barcode)}.json?fields=product_name,brands,image_thumb_url,quantity,nutriments,categories`;
    const res = await fetch(url, { headers: { "User-Agent": "YurttasMutfakta/1.0" } });
    if (!res.ok) throw new Error("Barkod bulunamadı");
    const j = await res.json();
    if (j.status !== 1 || !j.product) throw new Error("Ürün bulunamadı");
    const p = j.product;
    return {
      name: p.product_name ?? "",
      brand: p.brands ?? "",
      image_url: p.image_thumb_url ?? null,
      quantity: p.quantity ?? null,
      categories: (p.categories ?? "").split(",").map((s: string) => s.trim()).filter(Boolean).slice(0, 5),
      nutriments: {
        kcal_per_100g: p.nutriments?.["energy-kcal_100g"] ?? null,
        protein_per_100g: p.nutriments?.proteins_100g ?? null,
      },
    };
  });
