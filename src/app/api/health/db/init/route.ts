import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SEED_EXERCISES } from "@/data/exercises";
import { computeResearchScore } from "@/lib/exercise-mapping";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`,
  `CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken")`,
  `CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token")`,
  `CREATE TABLE IF NOT EXISTS "Profile" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'male',
    "units" TEXT NOT NULL DEFAULT 'metric',
    "heightCm" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "restrictions" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "Profile"("userId")`,
  `CREATE TABLE IF NOT EXISTS "MacroGoal" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL DEFAULT 'maintain',
    "calories" INTEGER NOT NULL DEFAULT 2400,
    "proteinG" INTEGER NOT NULL DEFAULT 170,
    "carbsG" INTEGER NOT NULL DEFAULT 260,
    "fatG" INTEGER NOT NULL DEFAULT 75,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MacroGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MacroGoal_userId_key" ON "MacroGoal"("userId")`,
  `CREATE TABLE IF NOT EXISTS "Exercise" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryMuscle" TEXT NOT NULL,
    "secondaryMuscles" TEXT NOT NULL DEFAULT '[]',
    "equipment" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "setsRepsByGoal" TEXT NOT NULL,
    "restSeconds" INTEGER NOT NULL,
    "researchScore" DOUBLE PRECISION NOT NULL,
    "scoreBreakdown" TEXT NOT NULL,
    "evidenceCitations" TEXT NOT NULL DEFAULT '[]',
    "techniqueSteps" TEXT NOT NULL DEFAULT '[]',
    "commonMistakes" TEXT NOT NULL DEFAULT '[]',
    "safetyNotes" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Exercise_slug_key" ON "Exercise"("slug")`,
  `CREATE TABLE IF NOT EXISTS "WorkoutSession" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "notes" TEXT,
    CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "SessionExercise" (
    "id" TEXT PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SessionExercise_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "SessionSet" (
    "id" TEXT PRIMARY KEY,
    "sessionExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "reps" INTEGER NOT NULL,
    "rpe" DOUBLE PRECISION,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "SessionSet_sessionExerciseId_fkey" FOREIGN KEY ("sessionExerciseId") REFERENCES "SessionExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Meal" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mealType" TEXT NOT NULL DEFAULT 'snack',
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "description" TEXT,
    "calories" INTEGER NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "carbsG" DOUBLE PRECISION NOT NULL,
    "fatG" DOUBLE PRECISION NOT NULL,
    "aiConfidence" TEXT,
    "aiCaveats" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "MealItem" (
    "id" TEXT PRIMARY KEY,
    "mealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "estimatedGrams" DOUBLE PRECISION NOT NULL,
    "calories" INTEGER NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "carbsG" DOUBLE PRECISION NOT NULL,
    "fatG" DOUBLE PRECISION NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'medium',
    "notes" TEXT,
    CONSTRAINT "MealItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "MealPlan" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "mealsPerDay" INTEGER NOT NULL,
    "restrictions" TEXT NOT NULL DEFAULT '[]',
    "targets" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "MealPlanMeal" (
    "id" TEXT PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL DEFAULT 0,
    "mealIndex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "prep" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "carbsG" DOUBLE PRECISION NOT NULL,
    "fatG" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "MealPlanMeal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
];

async function createSchema() {
  for (const statement of schemaStatements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

async function seedExercises() {
  for (const ex of SEED_EXERCISES) {
    const computedScore = computeResearchScore(ex.scoreBreakdown);
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      create: {
        slug: ex.slug,
        name: ex.name,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: JSON.stringify(ex.secondaryMuscles),
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        setsRepsByGoal: JSON.stringify(ex.setsRepsByGoal),
        restSeconds: ex.restSeconds,
        researchScore: computedScore,
        scoreBreakdown: JSON.stringify(ex.scoreBreakdown),
        evidenceCitations: JSON.stringify(ex.evidenceCitations),
        techniqueSteps: JSON.stringify(ex.techniqueSteps),
        commonMistakes: JSON.stringify(ex.commonMistakes),
        safetyNotes: ex.safetyNotes,
        videoUrl: ex.videoUrl ?? null,
      },
      update: {
        name: ex.name,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: JSON.stringify(ex.secondaryMuscles),
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        setsRepsByGoal: JSON.stringify(ex.setsRepsByGoal),
        restSeconds: ex.restSeconds,
        researchScore: computedScore,
        scoreBreakdown: JSON.stringify(ex.scoreBreakdown),
        evidenceCitations: JSON.stringify(ex.evidenceCitations),
        techniqueSteps: JSON.stringify(ex.techniqueSteps),
        commonMistakes: JSON.stringify(ex.commonMistakes),
        safetyNotes: ex.safetyNotes,
        videoUrl: ex.videoUrl ?? null,
      },
    });
  }
}

export async function GET() {
  try {
    await createSchema();
    await seedExercises();
    const exerciseCount = await prisma.exercise.count();

    return NextResponse.json({ ok: true, exerciseCount });
  } catch (error) {
    console.error("Database init failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
