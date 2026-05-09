"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { MUSCLE_GROUPS } from "@/lib/muscles";

interface Stats {
  sessionsByDay: Record<string, number>;
  setsByMuscle: Record<string, number>;
  totalVolumeKg: number;
  sessionCount: number;
  mealCount: number;
  dailyCalories: Record<string, { calories: number; proteinG: number }>;
}

export default function HistoryPage() {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const r = await fetch("/api/stats");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-lg font-semibold">History — last 30 days</h1>

      {isLoading || !data ? (
        <div className="grid sm:grid-cols-3 gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <>
          <section className="grid sm:grid-cols-3 gap-3">
            <StatCard label="Workouts" value={data.sessionCount} unit="sessions" />
            <StatCard label="Total volume" value={data.totalVolumeKg.toLocaleString()} unit="kg" />
            <StatCard label="Meals logged" value={data.mealCount} unit="entries" />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Working sets by muscle</CardTitle>
              <CardDescription>
                Aim for ~10–20 weekly hard sets per muscle group for hypertrophy (Schoenfeld 2017).
                30 days shown.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {MUSCLE_GROUPS.map((g) => {
                const count = data.setsByMuscle[g.id] ?? 0;
                const weekly = (count / 30) * 7;
                const pct = Math.min(100, (weekly / 20) * 100);
                return (
                  <div key={g.id} className="text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{g.label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {count} sets · ~{weekly.toFixed(1)}/wk
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training frequency</CardTitle>
              <CardDescription>Sessions per day in the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <DayHeatmap days={data.sessionsByDay} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily intake</CardTitle>
              <CardDescription>Calories and protein logged per day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {Object.entries(data.dailyCalories).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No meals logged yet.</p>
              ) : (
                Object.entries(data.dailyCalories)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([day, v]) => (
                    <div key={day} className="text-sm flex justify-between">
                      <span className="text-muted-foreground">{day}</span>
                      <span className="tabular-nums">
                        {v.calories} kcal · {v.proteinG}g protein
                      </span>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: number | string; unit: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-3xl font-semibold tabular-nums">
          {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DayHeatmap({ days }: { days: Record<string, number> }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, count: days[key] ?? 0, label: d.toLocaleDateString() };
  });
  return (
    <div className="grid grid-cols-15 gap-1.5" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
      {cells.map((c) => (
        <div
          key={c.key}
          title={`${c.label}: ${c.count} sessions`}
          className={`aspect-square rounded-sm border ${cellClass(c.count)}`}
        />
      ))}
    </div>
  );
}

function cellClass(count: number): string {
  if (count === 0) return "bg-muted";
  if (count === 1) return "bg-primary/40";
  if (count === 2) return "bg-primary/70";
  return "bg-primary";
}
