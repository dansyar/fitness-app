import { z } from "zod";

// AI meal-analysis response schema (mirrors AnalysisResult in types.ts).
export const AnalyzedItemSchema = z.object({
  name: z.string().min(1),
  estimatedGrams: z.number().nonnegative(),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  confidence: z.enum(["high", "medium", "low"]),
  notes: z.string().optional(),
});

export const AnalysisResultSchema = z.object({
  items: z.array(AnalyzedItemSchema).min(1),
  totals: z.object({
    calories: z.number().nonnegative(),
    proteinG: z.number().nonnegative(),
    carbsG: z.number().nonnegative(),
    fatG: z.number().nonnegative(),
  }),
  overallConfidence: z.enum(["high", "medium", "low"]),
  caveats: z.array(z.string()).default([]),
  suggestedClarifications: z.array(z.string()).default([]),
});

export const AnalyzeMealRequestSchema = z.object({
  imageUrl: z.string().url().optional(),
  description: z.string().max(2000).optional(),
}).refine((d) => d.imageUrl || d.description, {
  message: "Provide an image URL or a text description (or both).",
});

export const PlannedMealSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({ name: z.string(), grams: z.number().nonnegative() })),
  prep: z.string(),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
});

export const MealPlanResultSchema = z.object({
  name: z.string(),
  days: z.array(z.object({ meals: z.array(PlannedMealSchema).min(1) })).min(1),
});

export const GenerateMealPlanRequestSchema = z.object({
  timeframe: z.enum(["day", "week"]),
  mealsPerDay: z.number().int().min(1).max(8),
  restrictions: z.array(z.string()).default([]),
  targets: z.object({
    calories: z.number().int().positive(),
    proteinG: z.number().nonnegative(),
    carbsG: z.number().nonnegative(),
    fatG: z.number().nonnegative(),
  }),
  preferences: z.string().max(1000).optional(),
});

export const SaveMealRequestSchema = z.object({
  name: z.string().min(1),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  loggedAt: z.string().datetime().optional(),
  photoUrl: z.string().url().optional(),
  description: z.string().optional(),
  items: z.array(AnalyzedItemSchema).min(1),
  aiConfidence: z.enum(["high", "medium", "low"]).optional(),
  aiCaveats: z.array(z.string()).default([]),
});

export const SaveSessionRequestSchema = z.object({
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      orderIndex: z.number().int().nonnegative(),
      sets: z.array(
        z.object({
          setNumber: z.number().int().positive(),
          weightKg: z.number().nonnegative().optional(),
          reps: z.number().int().nonnegative(),
          rpe: z.number().min(1).max(10).optional(),
          completed: z.boolean().default(true),
        }),
      ),
    }),
  ),
});

export const UpdateProfileRequestSchema = z.object({
  units: z.enum(["metric", "imperial"]).optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  restrictions: z.array(z.string()).optional(),
});

export const UpdateMacroGoalRequestSchema = z.object({
  goal: z.enum(["maintain", "lean_bulk", "fat_loss", "aggressive_cut"]),
  calories: z.number().int().positive(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
});
