"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface MealItemRow {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: string;
}

interface MealRow {
  id: string;
  name: string;
  mealType: string;
  loggedAt: string;
  photoUrl: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  aiConfidence: string | null;
  aiCaveats: string;
  items: MealItemRow[];
}

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;

export function MealList({ meals, isLoading }: { meals: MealRow[]; isLoading: boolean }) {
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/meals/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meals"] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  if (meals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-8">
        No meals logged for this day yet.
      </p>
    );
  }

  const grouped = MEAL_ORDER.map((type) => ({
    type,
    rows: meals.filter((m) => m.mealType === type),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="space-y-5">
      {grouped.map(({ type, rows }) => (
        <section key={type}>
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{type}</h3>
          <ul className="space-y-2">
            {rows.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-md border bg-card p-3"
              >
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoUrl}
                    alt=""
                    className="h-12 w-12 rounded object-cover border"
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    🍽
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">{m.name}</span>
                    {m.aiConfidence && (
                      <Badge
                        variant={`confidence_${m.aiConfidence}` as "confidence_high" | "confidence_medium" | "confidence_low"}
                        className="text-[10px]"
                      >
                        AI {m.aiConfidence}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.calories} kcal · P {m.proteinG.toFixed(1)} · C {m.carbsG.toFixed(1)} · F{" "}
                    {m.fatG.toFixed(1)} ·{" "}
                    {new Date(m.loggedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remove.mutate(m.id)}
                  aria-label="Delete meal"
                  disabled={remove.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export type { MealRow };
