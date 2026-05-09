import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { UpdateProfileRequestSchema, UpdateMacroGoalRequestSchema } from "@/lib/zod-schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  const macroGoal = await prisma.macroGoal.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json({
    profile: profile
      ? {
          gender: profile.gender,
          units: profile.units,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          restrictions: JSON.parse(profile.restrictions) as string[],
        }
      : null,
    macroGoal,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const profilePart = UpdateProfileRequestSchema.safeParse(body?.profile ?? {});
  const macroPart = body?.macroGoal
    ? UpdateMacroGoalRequestSchema.safeParse(body.macroGoal)
    : null;

  if (!profilePart.success) {
    return NextResponse.json(
      { error: "Invalid profile", issues: profilePart.error.issues },
      { status: 400 },
    );
  }
  if (macroPart && !macroPart.success) {
    return NextResponse.json(
      { error: "Invalid macroGoal", issues: macroPart.error.issues },
      { status: 400 },
    );
  }

  const profileData = profilePart.data;
  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      gender: profileData.gender ?? "male",
      units: profileData.units ?? "metric",
      heightCm: profileData.heightCm,
      weightKg: profileData.weightKg,
      restrictions: JSON.stringify(profileData.restrictions ?? []),
    },
    update: {
      ...(profileData.gender && { gender: profileData.gender }),
      ...(profileData.units && { units: profileData.units }),
      ...(profileData.heightCm !== undefined && { heightCm: profileData.heightCm }),
      ...(profileData.weightKg !== undefined && { weightKg: profileData.weightKg }),
      ...(profileData.restrictions && { restrictions: JSON.stringify(profileData.restrictions) }),
    },
  });

  if (macroPart && macroPart.success) {
    const m = macroPart.data;
    await prisma.macroGoal.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        goal: m.goal,
        calories: m.calories,
        proteinG: Math.round(m.proteinG),
        carbsG: Math.round(m.carbsG),
        fatG: Math.round(m.fatG),
      },
      update: {
        goal: m.goal,
        calories: m.calories,
        proteinG: Math.round(m.proteinG),
        carbsG: Math.round(m.carbsG),
        fatG: Math.round(m.fatG),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
