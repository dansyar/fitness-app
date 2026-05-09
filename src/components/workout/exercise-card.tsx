"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Eye } from "lucide-react";
import { ScorePopover } from "./score-popover";
import { TechniqueDialog } from "./technique-dialog";
import type { ExerciseRecord } from "@/lib/types";
import { useWorkoutStore } from "@/store/workout-store";
import { useState } from "react";

export function ExerciseCard({ exercise }: { exercise: ExerciseRecord }) {
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const inSession = useWorkoutStore((s) =>
    s.todaysExercises.some((e) => e.exercise.slug === exercise.slug),
  );
  const [techniqueOpen, setTechniqueOpen] = useState(false);

  const hyp = exercise.setsRepsByGoal.hypertrophy;
  const scorePct = (exercise.researchScore / 10) * 100;
  const restMin = Math.round(exercise.restSeconds / 60);
  const restLabel =
    exercise.restSeconds < 90
      ? `${exercise.restSeconds}s rest`
      : `${restMin}–${restMin + 1} min rest`;

  const rationale = buildRationale(exercise);

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <h3 className="font-medium leading-tight truncate">{exercise.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {exercise.equipment}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {exercise.difficulty}
                </Badge>
              </div>
            </div>
            <ScorePopover
              score={exercise.researchScore}
              breakdown={exercise.scoreBreakdown}
              citations={exercise.evidenceCitations}
            >
              <span className="font-semibold tabular-nums whitespace-nowrap">
                {exercise.researchScore.toFixed(1)} / 10
              </span>
            </ScorePopover>
          </div>

          <Progress value={scorePct} className="h-1.5" />

          <p className="text-sm text-muted-foreground leading-relaxed">{rationale}</p>

          <div className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">
              {hyp.sets} × {hyp.reps}
            </span>{" "}
            · {restLabel}
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => setTechniqueOpen(true)}>
              <Eye className="h-3.5 w-3.5" />
              View technique
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => addExercise(exercise)}
              disabled={inSession}
            >
              <Plus className="h-3.5 w-3.5" />
              {inSession ? "Added" : "Add to session"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <TechniqueDialog exercise={exercise} open={techniqueOpen} onOpenChange={setTechniqueOpen} />
    </>
  );
}

function buildRationale(e: ExerciseRecord): string {
  const b = e.scoreBreakdown;
  const strongest = [
    { label: "high direct activation", v: b.emg, max: 3 },
    { label: "strong hypertrophy evidence", v: b.hypertrophyMeta, max: 3 },
    { label: "well-replicated", v: b.replication, max: 2 },
    { label: "high practical transfer", v: b.practical, max: 2 },
  ]
    .filter((x) => x.v / x.max >= 0.75)
    .map((x) => x.label);

  if (strongest.length === 0) {
    return `${e.name} is a useful but less-studied option for ${e.primaryMuscle.replace(/_/g, " ")}.`;
  }
  return `${capitalize(strongest.slice(0, 2).join(" and "))}; pairs ${e.primaryMuscle.replace(/_/g, " ")} loading with ${e.equipment} mechanics.`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
