import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toExerciseRecord } from "@/lib/exercise-mapping";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await prisma.exercise.findUnique({ where: { slug } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(toExerciseRecord(row));
}
