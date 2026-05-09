import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SaveSessionRequestSchema } from "@/lib/zod-schemas";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = SaveSessionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const created = await prisma.workoutSession.create({
    data: {
      userId: session.user.id,
      startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
      endedAt: data.endedAt ? new Date(data.endedAt) : new Date(),
      notes: data.notes,
      exercises: {
        create: data.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          orderIndex: e.orderIndex,
          sets: {
            create: e.sets.map((s) => ({
              setNumber: s.setNumber,
              weightKg: s.weightKg,
              reps: s.reps,
              rpe: s.rpe,
              completed: s.completed,
            })),
          },
        })),
      },
    },
    include: { exercises: { include: { sets: true, exercise: true } } },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");
  const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = toStr ? new Date(toStr) : new Date();

  const rows = await prisma.workoutSession.findMany({
    where: { userId: session.user.id, startedAt: { gte: from, lte: to } },
    orderBy: { startedAt: "desc" },
    include: { exercises: { include: { sets: true, exercise: true }, orderBy: { orderIndex: "asc" } } },
  });
  return NextResponse.json(rows);
}
