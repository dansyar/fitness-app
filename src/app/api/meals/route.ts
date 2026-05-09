import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SaveMealRequestSchema } from "@/lib/zod-schemas";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = SaveMealRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;

  const totals = data.items.reduce(
    (acc, it) => ({
      calories: acc.calories + it.calories,
      proteinG: acc.proteinG + it.proteinG,
      carbsG: acc.carbsG + it.carbsG,
      fatG: acc.fatG + it.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

  const meal = await prisma.meal.create({
    data: {
      userId: session.user.id,
      name: data.name,
      mealType: data.mealType,
      loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
      photoUrl: data.photoUrl,
      description: data.description,
      calories: Math.round(totals.calories),
      proteinG: round1(totals.proteinG),
      carbsG: round1(totals.carbsG),
      fatG: round1(totals.fatG),
      aiConfidence: data.aiConfidence,
      aiCaveats: JSON.stringify(data.aiCaveats),
      items: {
        create: data.items.map((i) => ({
          name: i.name,
          estimatedGrams: i.estimatedGrams,
          calories: Math.round(i.calories),
          proteinG: round1(i.proteinG),
          carbsG: round1(i.carbsG),
          fatG: round1(i.fatG),
          confidence: i.confidence,
          notes: i.notes,
        })),
      },
    },
    include: { items: true },
  });
  return NextResponse.json(meal, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const day = dateParam ? new Date(dateParam) : new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const meals = await prisma.meal.findMany({
    where: { userId: session.user.id, loggedAt: { gte: start, lt: end } },
    orderBy: { loggedAt: "asc" },
    include: { items: true },
  });
  return NextResponse.json(meals);
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
