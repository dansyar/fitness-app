import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { GenerateMealPlanRequestSchema, MealPlanResultSchema } from "@/lib/zod-schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You are a registered dietitian generating a structured meal plan.
Output VALID JSON only matching:

{
  "name": string,
  "days": Array<{
    "meals": Array<{
      "name": string,
      "ingredients": Array<{ "name": string, "grams": number }>,
      "prep": string,
      "calories": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number
    }>
  }>
}

Rules:
- Match daily totals to within ±5% of the requested calorie target.
- Hit protein at or above the target. Carbs/fat may flex within ±10%.
- Respect every dietary restriction strictly.
- Vary cuisines and protein sources across the timeframe.
- Use realistic, supermarket-available whole foods. No supplements.
- Ingredients in grams; round calories to integers and macros to one decimal.
- "prep" is one or two practical sentences.
- NO prose outside the JSON. NO Markdown fences.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = GenerateMealPlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;
  const dayCount = data.timeframe === "week" ? 7 : 1;

  const userPrompt = `Build a ${data.timeframe === "week" ? "7-day" : "1-day"} plan with ${data.mealsPerDay} meals/day.
Daily targets: ${data.targets.calories} kcal, ${data.targets.proteinG}g protein, ${data.targets.carbsG}g carbs, ${data.targets.fatG}g fat.
Restrictions: ${data.restrictions.length ? data.restrictions.join(", ") : "none"}.
${data.preferences ? `Preferences: ${data.preferences}` : ""}
Generate ${dayCount} day(s). Return JSON only.`;

  const client = getAnthropic();
  let raw: string;
  try {
    const resp = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = resp.content.find((c) => c.type === "text");
    if (!block || block.type !== "text") throw new Error("No text response from model");
    raw = block.text;
  } catch (err) {
    return NextResponse.json(
      { error: "AI generation failed", detail: (err as Error).message },
      { status: 502 },
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(stripCodeFences(raw));
  } catch {
    return NextResponse.json({ error: "Model returned non-JSON output", raw }, { status: 502 });
  }

  const result = MealPlanResultSchema.safeParse(json);
  if (!result.success) {
    return NextResponse.json(
      { error: "Model output failed validation", issues: result.error.issues, raw: json },
      { status: 502 },
    );
  }

  // Persist a copy as a saved plan.
  const savedPlan = await prisma.mealPlan.create({
    data: {
      userId: session.user.id,
      name: result.data.name,
      timeframe: data.timeframe,
      mealsPerDay: data.mealsPerDay,
      restrictions: JSON.stringify(data.restrictions),
      targets: JSON.stringify(data.targets),
      meals: {
        create: result.data.days.flatMap((day, dayIndex) =>
          day.meals.map((m, mealIndex) => ({
            dayIndex,
            mealIndex,
            name: m.name,
            ingredients: JSON.stringify(m.ingredients),
            prep: m.prep,
            calories: Math.round(m.calories),
            proteinG: round1(m.proteinG),
            carbsG: round1(m.carbsG),
            fatG: round1(m.fatG),
          })),
        ),
      },
    },
  });

  return NextResponse.json({ planId: savedPlan.id, plan: result.data });
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function stripCodeFences(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}
