"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExerciseRecord } from "@/lib/types";

export function TechniqueDialog({
  exercise,
  open,
  onOpenChange,
}: {
  exercise: ExerciseRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
          <DialogDescription className="capitalize">
            Targets {exercise.primaryMuscle.replace(/_/g, " ")} ·{" "}
            {exercise.equipment} · {exercise.difficulty}
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-2">
          <h3 className="text-sm font-medium">Setup & execution</h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
            {exercise.techniqueSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {exercise.commonMistakes.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-medium">Common mistakes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {exercise.commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </section>
        )}

        {exercise.safetyNotes && (
          <section className="space-y-1 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-900 dark:text-amber-200">
            <strong>Safety:</strong> {exercise.safetyNotes}
          </section>
        )}

        <section className="grid grid-cols-3 gap-2 text-xs">
          {(["strength", "hypertrophy", "endurance"] as const).map((g) => {
            const sr = exercise.setsRepsByGoal[g];
            return (
              <div key={g} className="rounded-md border p-2">
                <div className="text-muted-foreground capitalize">{g}</div>
                <div className="font-medium">
                  {sr.sets} × {sr.reps}
                </div>
              </div>
            );
          })}
        </section>
      </DialogContent>
    </Dialog>
  );
}
