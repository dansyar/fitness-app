"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, ChefHat } from "lucide-react";
import { MacroRings, type MacroTotals } from "@/components/diet/macro-rings";
import { MealList, type MealRow } from "@/components/diet/meal-list";
import { LogMealDialog } from "@/components/diet/log-meal-dialog";
import { isoDay } from "@/lib/utils";

interface ProfileResponse {
  profile: { gender: string; restrictions: string[] } | null;
  macroGoal: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  } | null;
}

export default function DietPage() {
  const [date, setDate] = useState(() => new Date());
  const dayKey = isoDay(date);

  const { data: profileData } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await fetch("/api/profile");
      if (!r.ok) throw new Error("Failed to load profile");
      return r.json();
    },
  });

  const { data: meals = [], isLoading } = useQuery<MealRow[]>({
    queryKey: ["meals", dayKey],
    queryFn: async () => {
      const r = await fetch(`/api/meals?date=${dayKey}`);
      if (!r.ok) throw new Error("Failed to load meals");
      return r.json();
    },
  });

  const target: MacroTotals = profileData?.macroGoal ?? {
    calories: 2400,
    proteinG: 170,
    carbsG: 260,
    fatG: 75,
  };

  const current: MacroTotals = meals.reduce<MacroTotals>(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: acc.proteinG + m.proteinG,
      carbsG: acc.carbsG + m.carbsG,
      fatG: acc.fatG + m.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => shiftDate(setDate, -1)}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold tabular-nums">{formatDay(date)}</h1>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => shiftDate(setDate, 1)}
            aria-label="Next day"
            disabled={dayKey === isoDay(new Date())}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/diet/plans">
              <ChefHat className="h-4 w-4" />
              Plans
            </Link>
          </Button>
          <LogMealDialog
            defaultDate={date}
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                Log meal
              </Button>
            }
          />
        </div>
      </header>

      <MacroRings current={current} target={target} />

      <MealList meals={meals} isLoading={isLoading} />
    </div>
  );
}

function shiftDate(setter: (d: Date) => void, delta: number) {
  setter(new Date(Date.now() + delta * 24 * 60 * 60 * 1000));
}

function formatDay(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}
