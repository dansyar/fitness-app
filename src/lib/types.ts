import type { MuscleGroupId } from "./muscles";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "kettlebell"
  | "smith";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Goal = "strength" | "hypertrophy" | "endurance";

export interface SetsReps {
  sets: number;
  reps: string; // can be "5" or "8-12"
}

export type SetsRepsByGoal = Record<Goal, SetsReps>;

export interface ScoreBreakdown {
  /** EMG / direct activation evidence: 0-3 */
  emg: number;
  /** Hypertrophy meta-analysis evidence: 0-3 */
  hypertrophyMeta: number;
  /** Replication / sample size: 0-2 */
  replication: number;
  /** Practical efficacy in trained populations: 0-2 */
  practical: number;
}

export interface Citation {
  author: string;
  year: number;
  title: string;
  journal: string;
  summary: string;
}

export interface ExerciseRecord {
  id: string;
  slug: string;
  name: string;
  primaryMuscle: MuscleGroupId;
  secondaryMuscles: MuscleGroupId[];
  equipment: Equipment;
  difficulty: Difficulty;
  setsRepsByGoal: SetsRepsByGoal;
  restSeconds: number;
  researchScore: number;
  scoreBreakdown: ScoreBreakdown;
  evidenceCitations: Citation[];
  techniqueSteps: string[];
  commonMistakes: string[];
  safetyNotes: string;
  videoUrl: string | null;
}

export interface AnalyzedItem {
  name: string;
  estimatedGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: "high" | "medium" | "low";
  notes?: string;
}

export interface AnalysisResult {
  items: AnalyzedItem[];
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  overallConfidence: "high" | "medium" | "low";
  caveats: string[];
  suggestedClarifications: string[];
}

export interface PlannedMeal {
  name: string;
  ingredients: { name: string; grams: number }[];
  prep: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealPlanResult {
  name: string;
  days: { meals: PlannedMeal[] }[];
}
