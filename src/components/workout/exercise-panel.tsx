"use client";

import { useQuery } from "@tanstack/react-query";
import { useWorkoutStore } from "@/store/workout-store";
import { getMuscleGroup } from "@/lib/muscles";
import { Skeleton } from "@/components/ui/skeleton";
import { ExerciseCard } from "./exercise-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ExerciseRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ExercisePanel({ className }: { className?: string }) {
  const muscle = useWorkoutStore((s) => s.selectedMuscle);
  const select = useWorkoutStore((s) => s.selectMuscle);
  const group = muscle ? getMuscleGroup(muscle) : null;

  const { data, isLoading, isError, error } = useQuery<ExerciseRecord[]>({
    queryKey: ["exercises", muscle],
    queryFn: async () => {
      if (!muscle) return [];
      const r = await fetch(`/api/exercises?muscle=${muscle}`);
      if (!r.ok) throw new Error(`Failed to load exercises: ${r.status}`);
      return r.json();
    },
    enabled: !!muscle,
  });

  if (!muscle || !group) {
    return (
      <aside
        className={cn(
          "rounded-md border bg-card p-6 text-sm text-muted-foreground text-center",
          className,
        )}
      >
        Click a muscle on the mannequin (or pick one from the list) to see exercises ranked by
        evidence.
      </aside>
    );
  }

  return (
    <aside
      aria-label={`Exercises for ${group.label}`}
      className={cn("rounded-md border bg-card flex flex-col overflow-hidden", className)}
    >
      <header className="flex items-start justify-between gap-3 px-4 py-3 border-b bg-muted/30">
        <div className="min-w-0">
          <h2 className="font-semibold text-base">{group.label}</h2>
          <p className="text-xs text-muted-foreground leading-snug">{group.description}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => select(null)}
          aria-label="Close exercise panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        )}
        {isError && (
          <div className="text-sm text-destructive p-3 rounded-md border border-destructive/30 bg-destructive/5">
            {(error as Error).message}
          </div>
        )}
        {data?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No exercises seeded for this group yet. Run <code>npm run seed</code>.
          </p>
        )}
        {data?.map((ex) => (
          <ExerciseCard key={ex.slug} exercise={ex} />
        ))}
      </div>
    </aside>
  );
}
