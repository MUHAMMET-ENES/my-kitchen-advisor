import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value, onChange, size = 5,
}: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: size }).map((_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i + 1)}
            disabled={!onChange}
            className={cn("transition-transform", onChange && "hover:scale-110 cursor-pointer", !onChange && "cursor-default")}
            aria-label={`${i + 1} yıldız`}
          >
            <Star className={cn("h-5 w-5", filled ? "fill-primary text-primary" : "text-muted-foreground/40")} />
          </button>
        );
      })}
    </div>
  );
}
