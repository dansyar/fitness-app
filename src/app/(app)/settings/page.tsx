"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RESTRICTIONS = ["vegetarian", "vegan", "halal", "kosher", "gluten-free", "dairy-free", "nut-free"];

interface ProfileResponse {
  profile: {
    gender: string;
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

  const [gender, setGender] = useState<"male" | "female">("male");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [goal, setGoal] = useState<"maintain" | "lean_bulk" | "fat_loss" | "aggressive_cut">("maintain");
  const [calories, setCalories] = useState(2400);
  const [proteinG, setProteinG] = useState(170);
  const [carbsG, setCarbsG] = useState(260);
  const [fatG, setFatG] = useState(75);

  useEffect(() => {
    if (!data) return;
    if (data.profile) {
      setGender((data.profile.gender as "male" | "female") ?? "male");
      setUnits((data.profile.units as "metric" | "imperial") ?? "metric");
      setHeightCm(data.profile.heightCm ? String(data.profile.heightCm) : "");
      setWeightKg(data.profile.weightKg ? String(data.profile.weightKg) : "");
      setRestrictions(data.profile.restrictions ?? []);
    }
    if (data.macroGoal) {
      setGoal(data.macroGoal.goal as typeof goal);
      setCalories(data.macroGoal.calories);
      setProteinG(data.macroGoal.proteinG);
      setCarbsG(data.macroGoal.carbsG);
      setFatG(data.macroGoal.fatG);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile: {
            gender,
            units,
            heightCm: heightCm ? Number(heightCm) : undefined,
            weightKg: weightKg ? Number(weightKg) : undefined,
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
              <CardDescription>Used by the mannequin and AI prompts.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as "male" | "female")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Units</Label>
                <Select value={units} onValueChange={(v) => setUnits(v as "metric" | "imperial")}>
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
                <Label htmlFor="h">Height (cm)</Label>
                <Input id="h" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="w">Weight (kg)</Label>
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
            <CardHeader>
              <CardTitle>Macro goals</CardTitle>
              <CardDescription>
                Drives the diet rings and meal-plan generator. Adjust calories first; protein
                should sit at 1.6-2.2g/kg of bodyweight.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Goal</Label>
                <Select value={goal} onValueChange={(v) => setGoal(v as typeof goal)}>
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
