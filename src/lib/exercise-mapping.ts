import type { Exercise as PrismaExercise } from "@prisma/client";
import type { ExerciseRecord, ScoreBreakdown, SetsRepsByGoal, Citation } from "./types";
import type { MuscleGroupId } from "./muscles";

/**
 * Convert a Prisma Exercise row (which stores nested data as JSON strings for
 * SQLite compatibility) into a strongly typed ExerciseRecord.
 */
export function toExerciseRecord(row: PrismaExercise): ExerciseRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    primaryMuscle: row.primaryMuscle as MuscleGroupId,
    secondaryMuscles: JSON.parse(row.secondaryMuscles) as MuscleGroupId[],
    equipment: row.equipment as ExerciseRecord["equipment"],
    difficulty: row.difficulty as ExerciseRecord["difficulty"],
    setsRepsByGoal: JSON.parse(row.setsRepsByGoal) as SetsRepsByGoal,
    restSeconds: row.restSeconds,
    researchScore: row.researchScore,
    scoreBreakdown: JSON.parse(row.scoreBreakdown) as ScoreBreakdown,
    evidenceCitations: JSON.parse(row.evidenceCitations) as Citation[],
    techniqueSteps: JSON.parse(row.techniqueSteps) as string[],
    commonMistakes: JSON.parse(row.commonMistakes) as string[],
    safetyNotes: row.safetyNotes,
    videoUrl: row.videoUrl,
  };
}

export function computeResearchScore(b: ScoreBreakdown): number {
  // Components are weighted by their max so the total is on a 0-10 scale.
  const total = b.emg + b.hypertrophyMeta + b.replication + b.practical;
  return Math.round(total * 10) / 10;
}
