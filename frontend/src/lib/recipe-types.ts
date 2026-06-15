export type Ingredient = { name: string; amount?: string };

export const visibilityOptions = [
  { value: "private", label: "Özel (sadece ben)" },
  { value: "shared", label: "Bağlantı ile paylaşıma açık" },
  { value: "public", label: "Herkese açık" },
] as const;
