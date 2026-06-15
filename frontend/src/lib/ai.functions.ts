import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ConstraintsSchema = z.object({
  time_minutes: z.number().min(1).max(360).optional(),
  equipment: z.array(z.string()).optional(),
  no_electricity: z.boolean().optional(),
  microwave_only: z.boolean().optional(),
  one_pot: z.boolean().optional(),
  low_dishes: z.boolean().optional(),
  no_fridge: z.boolean().optional(),
  next_day_safe: z.boolean().optional(),
  odor_free: z.boolean().optional(),
  budget: z.number().min(0).max(10000).optional(),
  mode: z.enum(["normal", "exam", "comfort", "late_night", "high_protein"]).optional(),
  servings: z.number().min(1).max(20).optional(),
  dislikes: z.array(z.string()).optional(),
  prioritize_expiring: z.boolean().optional(),
}).optional();

const RecipeSchema = z.object({
  prompt: z.string().min(1).max(2000),
  pantry: z.array(z.string()).optional(),
  expiring: z.array(z.string()).optional(),
  context: ConstraintsSchema,
});

export const generateRecipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RecipeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI anahtarı eksik");

    const sys = `Sen "Yurttaş Mutfakta" adında, yurt mutfağında yaşayan Türk öğrenciler için tarif üreten bir asistansın.
Gerçekçi öğrenci kısıtlarını mutlaka dikkate al: kısıtlı bütçe, az ekipman, küçük alan, kampüs marketi malzemeleri, az bulaşık.
Eğer kullanıcının "yakında bozulacak malzemeleri" varsa onları öncelikle kullan.
Tarifin gerçekten o ekipmanla yapılabilir ve abartısız olmalı.

Yanıtını SADECE şu JSON şemasında ver (başka metin yok):
{"title": string, "description": string, "time_minutes": number, "ingredients": [{"name": string, "amount": string}], "steps": [string], "tags": [string], "equipment": [string], "estimated_cost": number, "estimated_calories": number, "satiety": number (1-5), "dish_load": number (1-5), "highlights": [string]}`;

    const userMsg = `Kullanıcı isteği: ${data.prompt}
${data.pantry?.length ? `\nElindeki malzemeler: ${data.pantry.join(", ")}` : ""}
${data.expiring?.length ? `\nÖncelikle kullan (yakında bozulacak): ${data.expiring.join(", ")}` : ""}
${data.context ? `\nKısıtlar/Bağlam: ${JSON.stringify(data.context)}` : ""}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Çok sık istek. Birazdan tekrar deneyin.");
    if (res.status === 402) throw new Error("AI kredisi tükendi.");
    if (!res.ok) throw new Error(`AI hatası: ${res.status}`);

    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? "{}";
    type RecipeOut = {
      title?: string; description?: string; time_minutes?: number;
      ingredients?: { name: string; amount?: string }[]; steps?: string[];
      tags?: string[]; equipment?: string[];
      estimated_cost?: number; estimated_calories?: number;
      satiety?: number; dish_load?: number; highlights?: string[];
    };
    let recipe: RecipeOut = {};
    try { recipe = JSON.parse(content) as RecipeOut; } catch { recipe = { title: "AI Tarif", description: content }; }

    await context.supabase.from("ai_history").insert({
      user_id: context.userId, prompt: data.prompt, response: recipe as unknown as never,
    });
    await context.supabase.from("search_history").insert({
      user_id: context.userId, query: data.prompt,
    });

    return recipe;
  });

const SaveSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  ingredients: z.array(z.object({ name: z.string(), amount: z.string().optional() })).default([]),
  steps: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  time_minutes: z.number().nullable().optional(),
  estimated_cost: z.number().nullable().optional(),
  estimated_calories: z.number().nullable().optional(),
  ai_meta: z.record(z.string(), z.unknown()).optional(),
});

export const saveAiRecipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("recipes").insert({
      user_id: context.userId,
      title: data.title,
      description: data.description ?? null,
      ingredients: data.ingredients,
      steps: data.steps,
      tags: data.tags,
      equipment: data.equipment,
      time_minutes: data.time_minutes ?? null,
      estimated_cost: data.estimated_cost ?? null,
      estimated_calories: data.estimated_calories ?? null,
      ai_meta: (data.ai_meta as never) ?? null,
      source: "ai",
    }).select().single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

// Award badges based on user activity
export const checkBadges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const sb = context.supabase;

    const [{ count: cookedCount }, { count: savedCount }, { count: pantryCount }, { data: existing }] = await Promise.all([
      sb.from("recipe_interactions").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("kind", "cooked"),
      sb.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", uid),
      sb.from("pantry_items").select("id", { count: "exact", head: true }).eq("user_id", uid),
      sb.from("badges").select("code").eq("user_id", uid),
    ]);

    const have = new Set((existing ?? []).map((b) => b.code));
    const toAward: { code: string; meta: Record<string, unknown> }[] = [];
    const rules: { code: string; cond: boolean; meta: Record<string, unknown> }[] = [
      { code: "first_recipe", cond: (savedCount ?? 0) >= 1, meta: { label: "İlk tarif" } },
      { code: "ten_recipes", cond: (savedCount ?? 0) >= 10, meta: { label: "10 tarif" } },
      { code: "first_cooked", cond: (cookedCount ?? 0) >= 1, meta: { label: "İlk pişirme" } },
      { code: "five_cooked", cond: (cookedCount ?? 0) >= 5, meta: { label: "Yurt aşçısı" } },
      { code: "twenty_cooked", cond: (cookedCount ?? 0) >= 20, meta: { label: "Yurt şefi" } },
      { code: "pantry_starter", cond: (pantryCount ?? 0) >= 5, meta: { label: "Buzdolabı hazır" } },
    ];

    for (const r of rules) {
      if (r.cond && !have.has(r.code)) toAward.push({ code: r.code, meta: r.meta });
    }
    if (toAward.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("badges").insert(toAward.map((b) => ({ user_id: uid, code: b.code, meta: b.meta as never })));
    }
    return { awarded: toAward.map((b) => b.code) };
  });

// Generate pantry-expiry notifications
export const refreshExpiryNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const sb = context.supabase;
    const today = new Date();
    const soon = new Date(today.getTime() + 3 * 86_400_000);
    const { data: items } = await sb.from("pantry_items").select("id, name, expires_at")
      .eq("user_id", uid).not("expires_at", "is", null)
      .lte("expires_at", soon.toISOString().slice(0, 10));

    if (!items?.length) return { created: 0 };

    const { data: existing } = await sb.from("notifications").select("link")
      .eq("user_id", uid).eq("kind", "expiry");
    const have = new Set((existing ?? []).map((n) => n.link));

    const toInsert = items
      .filter((i) => !have.has(`pantry:${i.id}`))
      .map((i) => {
        const days = Math.ceil((new Date(i.expires_at!).getTime() - today.getTime()) / 86_400_000);
        return {
          user_id: uid, kind: "expiry",
          title: days <= 0 ? `${i.name} bugün son` : `${i.name} ${days} gün içinde bozulacak`,
          body: "Önce bunu tüketmeyi düşün.",
          link: `pantry:${i.id}`,
        };
      });

    if (toInsert.length) await sb.from("notifications").insert(toInsert);
    return { created: toInsert.length };
  });
