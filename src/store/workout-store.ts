"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MuscleGroupId } from "@/lib/muscles";
import type { ExerciseRecord } from "@/lib/types";

export interface DraftSet {
  setNumber: number;
  weightKg?: number;
  reps: number;
  rpe?: number;
  completed: boolean;
}

export interface DraftSessionExercise {
  exercise: ExerciseRecord;
  orderIndex: number;
  sets: DraftSet[];
}

interface WorkoutState {
  selectedMuscle: MuscleGroupId | null;
  selectMuscle: (m: MuscleGroupId | null) => void;
  hoveredMuscle: MuscleGroupId | null;
  setHoveredMuscle: (m: MuscleGroupId | null) => void;
  cameraView: "front" | "back";
  setCameraView: (v: "front" | "back") => void;
  todaysExercises: DraftSessionExercise[];
  addExercise: (e: ExerciseRecord) => void;
  removeExercise: (slug: string) => void;
  reorderExercises: (slugs: string[]) => void;
  addSet: (slug: string) => void;
  updateSet: (slug: string, setNumber: number, patch: Partial<DraftSet>) => void;
  removeSet: (slug: string, setNumber: number) => void;
  clearSession: () => void;
}

const defaultSet = (n: number): DraftSet => ({
  setNumber: n,
  reps: 0,
  completed: false,
});

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      selectedMuscle: null,
      selectMuscle: (m) => set({ selectedMuscle: m }),
      hoveredMuscle: null,
      setHoveredMuscle: (m) => set({ hoveredMuscle: m }),
      cameraView: "front",
      setCameraView: (v) => set({ cameraView: v }),
      todaysExercises: [],
      addExercise: (e) =>
        set((s) => {
          if (s.todaysExercises.find((x) => x.exercise.slug === e.slug)) return s;
          return {
            todaysExercises: [
              ...s.todaysExercises,
              {
                exercise: e,
                orderIndex: s.todaysExercises.length,
                sets: [defaultSet(1), defaultSet(2), defaultSet(3)],
              },
            ],
          };
        }),
      removeExercise: (slug) =>
        set((s) => ({
          todaysExercises: s.todaysExercises
            .filter((e) => e.exercise.slug !== slug)
            .map((e, i) => ({ ...e, orderIndex: i })),
        })),
      reorderExercises: (slugs) =>
        set((s) => ({
          todaysExercises: slugs
            .map((slug, idx) => {
              const found = s.todaysExercises.find((e) => e.exercise.slug === slug);
              return found ? { ...found, orderIndex: idx } : null;
            })
            .filter((x): x is DraftSessionExercise => x !== null),
        })),
      addSet: (slug) =>
        set((s) => ({
          todaysExercises: s.todaysExercises.map((e) => {
            if (e.exercise.slug !== slug) return e;
            const next = e.sets.length + 1;
            return { ...e, sets: [...e.sets, defaultSet(next)] };
          }),
        })),
      updateSet: (slug, setNumber, patch) =>
        set((s) => ({
          todaysExercises: s.todaysExercises.map((e) => {
            if (e.exercise.slug !== slug) return e;
            return {
              ...e,
              sets: e.sets.map((st) => (st.setNumber === setNumber ? { ...st, ...patch } : st)),
            };
          }),
        })),
      removeSet: (slug, setNumber) =>
        set((s) => ({
          todaysExercises: s.todaysExercises.map((e) => {
            if (e.exercise.slug !== slug) return e;
            return {
              ...e,
              sets: e.sets
                .filter((st) => st.setNumber !== setNumber)
                .map((st, i) => ({ ...st, setNumber: i + 1 })),
            };
          }),
        })),
      clearSession: () => set({ todaysExercises: [] }),
    }),
    {
      name: "workout-session-draft",
      partialize: (s) => ({ todaysExercises: s.todaysExercises, cameraView: s.cameraView }),
    },
  ),
);
