"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2, ChevronLeft } from "lucide-react";
import type { MealPlanResult } from "@/lib/types";

const RESTRICTIONS = ["vegetarian", "vegan", "halal", "kosher", "gluten-free", "dairy-free", "nut-free"];

interface ProfileResponse {
  profile: { restrictions: string[] } | null;
  macroGoal: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  } | null;
}

export default function PlansPage() {
  const { data: profileData } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await fetch("/api/profile");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const [timeframe, setTimeframe] = useState<"day" | "week">("day");
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");
  const [plan, setPlan] = useState<MealPlanResult | null>(null);

  const target = profileData?.macroGoal ?? {
    calories: 2400,
    proteinG: 170,
    carbsG: 260,
    fatG: 75,
  };
  const profileRestrictions = profileData?.profile?.restrictions ?? [];

  const generate = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          timeframe,
          mealsPerDay,
          restrictions: Array.from(new Set([...profileRestrictions, ...restrictions])),
          targets: target,
          preferences: preferences.trim() || undefined,
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? "Generation failed");
      return json as { planId: string; plan: MealPlanResult };
    },
    onSuccess: ({ plan }) => setPlan(plan),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Back">
          <Link href="/diet">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Meal plans</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate a plan</CardTitle>
          <CardDescription>
            Targets pull from your /settings goals; you can override restrictions per plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Timeframe</Label>
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as "day" | "week")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">1 day</SelectItem>
                <SelectItem value="week">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Meals per day</Label>
            <Input
              type="number"
              min={1}
              max={6}
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(Number(e.target.value) || 3)}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Restrictions (additional)</Label>
            <div className="flex flex-wrap gap-2">
              {RESTRICTIONS.map((r) => {
                const active = restrictions.includes(r);
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() =>
                      setRestrictions((prev) =>
                        active ? prev.filter((x) => x !== r) : [...prev, r],
                      )
                    }
                    className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-secondary"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
            {profileRestrictions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Profile-level restrictions always apply: {profileRestrictions.join(", ")}.
              </p>
            )}
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="prefs">Preferences (optional)</Label>
            <Textarea
              id="prefs"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="prefer mediterranean cuisines, no fish"
            />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Targets: {target.calories} kcal · {target.proteinG}g P · {target.carbsG}g C ·{" "}
              {target.fatG}g F
            </p>
            <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
              {generate.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
          {generate.isError && (
            <p className="text-xs text-destructive sm:col-span-2">
              {(generate.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>

      {generate.isPending && <Skeleton className="h-64 w-full" />}

      {plan && (
        <section className="space-y-4">
          <h2 className="font-semibold">{plan.name}</h2>
          {plan.days.map((day, di) => (
            <div key={di} className="space-y-2">
              {plan.days.length > 1 && (
                <h3 className="text-sm font-medium">Day {di + 1}</h3>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                {day.meals.map((m, mi) => (
                  <Card key={mi}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{m.name}</CardTitle>
                      <CardDescription>
                        {m.calories} kcal · P {m.proteinG.toFixed(1)} · C {m.carbsG.toFixed(1)} · F{" "}
                        {m.fatG.toFixed(1)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {m.ingredients.map((i, ii) => (
                          <Badge key={ii} variant="outline" className="font-normal">
                            {i.name} · {i.grams}g
                          </Badge>
                        ))}
                      </div>
                      <p className="text-muted-foreground">{m.prep}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
