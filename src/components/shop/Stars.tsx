import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarsProps {
  /** Average rating, 0–5. Halves are rounded to the nearest whole star. */
  rating: number;
  size?: number;
  className?: string;
}

export function Stars({ rating, size = 14, className }: StarsProps) {
  const filled = Math.round(rating);

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= filled
              ? "fill-izhaana-gold text-izhaana-gold"
              : "text-izhaana-charcoal/25"
          }
        />
      ))}
    </span>
  );
}
