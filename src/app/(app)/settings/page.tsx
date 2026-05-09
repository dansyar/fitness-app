"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RESTRICTIONS = ["vegetarian", "vegan", "halal", "kosher", "gluten-free", "dairy-free", "nut-free"];

type Units = "metric" | "imperial";
type Goal = "maintain" | "lean_bulk" | "fat_loss" | "aggressive_cut";

interface MacroEstimate {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const CM_PER_IN = 2.54;
const LB_PER_KG = 2.2046226218;
const DEFAULT_AGE = 30;
const ACTIVITY_MULTIPLIER = 1.55;
const STANDARD_BMR_ADJUSTMENT = -78;

const GOAL_CONFIG: Record<Goal, { calorieOffset: number; proteinPerKg: number; fatPerKg: number }> = {
  maintain: { calorieOffset: 0, proteinPerKg: 1.8, fatPerKg: 0.8 },
  lean_bulk: { calorieOffset: 250, proteinPerKg: 2, fatPerKg: 0.8 },
  fat_loss: { calorieOffset: -450, proteinPerKg: 2.1, fatPerKg: 0.7 },
  aggressive_cut: { calorieOffset: -650, proteinPerKg: 2.2, fatPerKg: 0.65 },
};

function parsePositiveNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function roundToNearest(value: number, increment: number) {
  return Math.round(value / increment) * increment;
}

function formatNumberForInput(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return String(rounded);
}

function toStoredHeightCm(value: string, units: Units) {
  const height = parsePositiveNumber(value);
  if (!height) return null;
  return units === "imperial" ? height * CM_PER_IN : height;
}

function toStoredWeightKg(value: string, units: Units) {
  const weight = parsePositiveNumber(value);
  if (!weight) return null;
  return units === "imperial" ? weight / LB_PER_KG : weight;
}

function fromStoredHeightCm(value: number, units: Units) {
  return units === "imperial" ? value / CM_PER_IN : value;
}

function fromStoredWeightKg(value: number, units: Units) {
  return units === "imperial" ? value * LB_PER_KG : value;
}

function calculateMacroGoal({
  goal,
  heightCm,
  weightKg,
}: {
  goal: Goal;
  heightCm: number | null;
  weightKg: number | null;
}): MacroEstimate | null {
  if (!heightCm || !weightKg) return null;

  const config = GOAL_CONFIG[goal];
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * DEFAULT_AGE + STANDARD_BMR_ADJUSTMENT;
  const calories = Math.max(
    1200,
    roundToNearest(bmr * ACTIVITY_MULTIPLIER + config.calorieOffset, 25),
  );

  const proteinG = Math.round(weightKg * config.proteinPerKg);
  let fatG = Math.max(35, Math.round(weightKg * config.fatPerKg));
  let carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4);

  if (carbsG < 75) {
    carbsG = 75;
    fatG = Math.max(30, Math.round((calories - proteinG * 4 - carbsG * 4) / 9));
  }

  return { calories, proteinG, carbsG, fatG };
}

interface ProfileResponse {
  profile: {
    units: string;
    heightCm: number | null;
    weightKg: number | null;
    restrictions: string[];
  } | null;
  macroGoal: {
    goal: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  } | null;
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await fetch("/api/profile");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const [units, setUnits] = useState<Units>("metric");
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [goal, setGoal] = useState<Goal>("maintain");
  const [calories, setCalories] = useState(2400);
  const [proteinG, setProteinG] = useState(170);
  const [carbsG, setCarbsG] = useState(260);
  const [fatG, setFatG] = useState(75);

  useEffect(() => {
    if (!data) return;
    if (data.profile) {
      const profileUnits = (data.profile.units as Units) ?? "metric";
      setUnits(profileUnits);
      setHeightCm(
        data.profile.heightCm
          ? formatNumberForInput(fromStoredHeightCm(data.profile.heightCm, profileUnits))
          : "",
      );
      setWeightKg(
        data.profile.weightKg
          ? formatNumberForInput(fromStoredWeightKg(data.profile.weightKg, profileUnits))
          : "",
      );
      setRestrictions(data.profile.restrictions ?? []);
    }
    if (data.macroGoal) {
      setGoal(data.macroGoal.goal as Goal);
      setCalories(data.macroGoal.calories);
      setProteinG(data.macroGoal.proteinG);
      setCarbsG(data.macroGoal.carbsG);
      setFatG(data.macroGoal.fatG);
    }
  }, [data]);

  const calculatedMacroGoal = useMemo(
    () =>
      calculateMacroGoal({
        goal,
        heightCm: toStoredHeightCm(heightCm, units),
        weightKg: toStoredWeightKg(weightKg, units),
      }),
    [goal, heightCm, units, weightKg],
  );

  function handleUnitsChange(nextUnits: Units) {
    if (nextUnits === units) return;

    const storedHeight = toStoredHeightCm(heightCm, units);
    const storedWeight = toStoredWeightKg(weightKg, units);
    setUnits(nextUnits);
    setHeightCm(storedHeight ? formatNumberForInput(fromStoredHeightCm(storedHeight, nextUnits)) : "");
    setWeightKg(storedWeight ? formatNumberForInput(fromStoredWeightKg(storedWeight, nextUnits)) : "");
  }

  function applyCalculatedMacroGoal() {
    if (!calculatedMacroGoal) return;
    setCalories(calculatedMacroGoal.calories);
    setProteinG(calculatedMacroGoal.proteinG);
    setCarbsG(calculatedMacroGoal.carbsG);
    setFatG(calculatedMacroGoal.fatG);
  }

  const save = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile: {
            units,
            heightCm: toStoredHeightCm(heightCm, units) ?? undefined,
            weightKg: toStoredWeightKg(weightKg, units) ?? undefined,
            restrictions,
          },
          macroGoal: { goal, calories, proteinG, carbsG, fatG },
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error ?? "Save failed");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-lg font-semibold">Settings</h1>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Used for unit conversion, diet targets, and meal planning.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Units</Label>
                <Select value={units} onValueChange={(v) => handleUnitsChange(v as Units)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (kg / cm)</SelectItem>
                    <SelectItem value="imperial">Imperial (lb / in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="h">Height ({units === "imperial" ? "in" : "cm"})</Label>
                <Input id="h" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="w">Weight ({units === "imperial" ? "lb" : "kg"})</Label>
                <Input id="w" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>Dietary restrictions</Label>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div className="space-y-1.5">
                <CardTitle>Macro goals</CardTitle>
                <CardDescription>
                  Drives the diet rings and meal-plan generator. Auto-calculate from your profile
                  and goal, then tune any target.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={applyCalculatedMacroGoal}
                disabled={!calculatedMacroGoal}
              >
                <Calculator />
                Auto-calculate
              </Button>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Goal</Label>
                <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintain">Maintain</SelectItem>
                    <SelectItem value="lean_bulk">Lean bulk</SelectItem>
                    <SelectItem value="fat_loss">Fat loss</SelectItem>
                    <SelectItem value="aggressive_cut">Aggressive cut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Calories</Label>
                <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Protein (g)</Label>
                <Input type="number" value={proteinG} onChange={(e) => setProteinG(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Carbs (g)</Label>
                <Input type="number" value={carbsG} onChange={(e) => setCarbsG(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Fat (g)</Label>
                <Input type="number" value={fatG} onChange={(e) => setFatG(Number(e.target.value) || 0)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2">
            {save.isError && (
              <span className="text-sm text-destructive">{(save.error as Error).message}</span>
            )}
            {save.isSuccess && <span className="text-sm text-muted-foreground">Saved</span>}
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
