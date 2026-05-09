"use client";

import { useState } from "react";
import { useWorkoutStore } from "@/store/workout-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus, Trash2, Save, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function SessionDock() {
  const exercises = useWorkoutStore((s) => s.todaysExercises);
  const [open, setOpen] = useState(false);
  const clearSession = useWorkoutStore((s) => s.clearSession);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const addSet = useWorkoutStore((s) => s.addSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const qc = useQueryClient();

  const finalize = useMutation({
    mutationFn: async () => {
      const payload = {
        startedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        endedAt: new Date().toISOString(),
        exercises: exercises.map((e, i) => ({
          exerciseId: e.exercise.id,
          orderIndex: i,
          sets: e.sets
            .filter((s) => s.reps > 0)
            .map((s) => ({
              setNumber: s.setNumber,
              weightKg: s.weightKg,
              reps: s.reps,
              rpe: s.rpe,
              completed: true,
            })),
        })),
      };
      const r = await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(`Save failed (${r.status})`);
      return r.json();
    },
    onSuccess: () => {
      clearSession();
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  if (exercises.length === 0) return null;

  const totalSets = exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.reps > 0).length,
    0,
  );

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-14 md:bottom-0 z-30 border-t bg-background/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-transform",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between py-3 text-sm"
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">Today&rsquo;s session</span>
            <span className="text-muted-foreground">
              {exercises.length} exercise{exercises.length === 1 ? "" : "s"} · {totalSets} working
              set{totalSets === 1 ? "" : "s"}
            </span>
          </div>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>

        {open && (
          <div className="pb-4 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {exercises.map((e) => (
              <div key={e.exercise.slug} className="rounded-md border bg-card p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{e.exercise.name}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">
                      {e.exercise.primaryMuscle.replace(/_/g, " ")} · {e.exercise.equipment}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeExercise(e.exercise.slug)}
                    aria-label="Remove exercise"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-1">Set</div>
                    <div className="col-span-4">Weight (kg)</div>
                    <div className="col-span-3">Reps</div>
                    <div className="col-span-3">RPE</div>
                    <div className="col-span-1" />
                  </div>
                  {e.sets.map((s) => (
                    <div key={s.setNumber} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1 text-sm tabular-nums">{s.setNumber}</div>
                      <Input
                        className="col-span-4 h-8"
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        value={s.weightKg ?? ""}
                        onChange={(ev) =>
                          updateSet(e.exercise.slug, s.setNumber, {
                            weightKg: ev.target.value === "" ? undefined : Number(ev.target.value),
                          })
                        }
                      />
                      <Input
                        className="col-span-3 h-8"
                        type="number"
                        inputMode="numeric"
                        value={s.reps || ""}
                        onChange={(ev) =>
                          updateSet(e.exercise.slug, s.setNumber, {
                            reps: Number(ev.target.value) || 0,
                          })
                        }
                      />
                      <Input
                        className="col-span-3 h-8"
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        min={1}
                        max={10}
                        value={s.rpe ?? ""}
                        onChange={(ev) =>
                          updateSet(e.exercise.slug, s.setNumber, {
                            rpe: ev.target.value === "" ? undefined : Number(ev.target.value),
                          })
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="col-span-1 h-8 w-8"
                        onClick={() => removeSet(e.exercise.slug, s.setNumber)}
                        aria-label="Remove set"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => addSet(e.exercise.slug)}
                  className="text-xs h-7"
                >
                  <Plus className="h-3 w-3" />
                  Add set
                </Button>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => clearSession()}>
                Discard
              </Button>
              <Button
                size="sm"
                onClick={() => finalize.mutate()}
                disabled={finalize.isPending || totalSets === 0}
              >
                <Save className="h-3.5 w-3.5" />
                {finalize.isPending ? "Saving…" : "End session"}
              </Button>
            </div>
            {finalize.isError && (
              <p className="text-xs text-destructive">{(finalize.error as Error).message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
