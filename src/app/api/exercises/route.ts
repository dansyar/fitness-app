import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toExerciseRecord } from "@/lib/exercise-mapping";
import { MUSCLE_GROUP_IDS, type MuscleGroupId } from "@/lib/muscles";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const muscle = url.searchParams.get("muscle");

  const where = muscle && MUSCLE_GROUP_IDS.includes(muscle as MuscleGroupId)
    ? { primaryMuscle: muscle }
    : undefined;

  const rows = await prisma.exercise.findMany({
    where,
    orderBy: [{ researchScore: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(rows.map(toExerciseRecord));
}
