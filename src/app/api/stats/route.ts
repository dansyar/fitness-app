import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [sessions, meals] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: session.user.id, startedAt: { gte: since } },
      orderBy: { startedAt: "asc" },
      include: {
        exercises: {
          include: { exercise: true, sets: true },
        },
      },
    }),
    prisma.meal.findMany({
      where: { userId: session.user.id, loggedAt: { gte: since } },
      orderBy: { loggedAt: "asc" },
    }),
  ]);

  const sessionsByDay = new Map<string, number>();
  const setsByMuscle = new Map<string, number>();
  let totalVolumeKg = 0;
  for (const s of sessions) {
    const day = s.startedAt.toISOString().slice(0, 10);
    sessionsByDay.set(day, (sessionsByDay.get(day) ?? 0) + 1);
    for (const ex of s.exercises) {
      const m = ex.exercise.primaryMuscle;
      const setCount = ex.sets.length;
      setsByMuscle.set(m, (setsByMuscle.get(m) ?? 0) + setCount);
      for (const set of ex.sets) {
        if (set.weightKg && set.reps) totalVolumeKg += set.weightKg * set.reps;
      }
    }
  }

  const dailyCalories = new Map<string, { calories: number; proteinG: number }>();
  for (const m of meals) {
    const day = m.loggedAt.toISOString().slice(0, 10);
    const prev = dailyCalories.get(day) ?? { calories: 0, proteinG: 0 };
    dailyCalories.set(day, {
      calories: prev.calories + m.calories,
      proteinG: prev.proteinG + m.proteinG,
    });
  }

  return NextResponse.json({
    sessionsByDay: Object.fromEntries(sessionsByDay),
    setsByMuscle: Object.fromEntries(setsByMuscle),
    totalVolumeKg: Math.round(totalVolumeKg),
    sessionCount: sessions.length,
    mealCount: meals.length,
    dailyCalories: Object.fromEntries(
      Array.from(dailyCalories.entries()).map(([d, v]) => [
        d,
        { calories: Math.round(v.calories), proteinG: Math.round(v.proteinG) },
      ]),
    ),
  });
}
