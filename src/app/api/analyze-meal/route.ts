import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { AnalyzeMealRequestSchema, AnalysisResultSchema } from "@/lib/zod-schemas";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a careful nutritionist analyzing a meal photograph and/or description.
You MUST output VALID JSON only that exactly matches this TypeScript shape:

{
  "items": Array<{
    "name": string,
    "estimatedGrams": number,
    "calories": number,
    "proteinG": number,
    "carbsG": number,
    "fatG": number,
    "confidence": "high" | "medium" | "low",
    "notes"?: string
  }>,
  "totals": { "calories": number, "proteinG": number, "carbsG": number, "fatG": number },
  "overallConfidence": "high" | "medium" | "low",
  "caveats": string[],
  "suggestedClarifications": string[]
}

Rules:
- Identify each visible food item separately. Use known portion guides (palm, fist, deck of cards) and visible utensils for scale.
- Use whole-food USDA-style macro values per 100g and scale by your gram estimate. Round calories to integers and macros to one decimal.
- "totals" must be the sum of items, rounded as above.
- Set "confidence" per item:
  - high: clear identification + visible scale reference + standard preparation
  - medium: identifiable but portion or preparation uncertain
  - low: occluded, unfamiliar dish, or sauce/dressing of unknown composition
- "caveats" lists specific uncertainties (e.g. "oil in cooking unknown", "rice could be 150-220g").
- "suggestedClarifications" lists short questions the user could answer to improve accuracy.
- If the user's description conflicts with the photo, prefer the description and note in caveats.
- Respect declared dietary restrictions only when interpreting ambiguous items (do NOT refuse if a user logs something off-restriction).
- NO prose outside the JSON. NO Markdown fences.`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = AnalyzeMealRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const { imageUrl, description } = parsed.data;

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  const restrictions: string[] = profile ? safeParseJSON(profile.restrictions, []) : [];

  const userText = [
    description ? `User description: ${description}` : null,
    restrictions.length ? `Dietary context: ${restrictions.join(", ")}` : null,
    "Return JSON only.",
  ]
    .filter(Boolean)
    .join("\n");

  const client = getAnthropic();
  const messageContent = imageUrl
    ? ([
        {
          type: "image" as const,
          source: { type: "url" as const, url: imageUrl },
        },
        { type: "text" as const, text: userText || "Analyze the meal in this photo." },
      ])
    : [{ type: "text" as const, text: userText || "Analyze this meal." }];

  let raw: string;
  try {
    const resp = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: messageContent }],
    });
    const block = resp.content.find((c) => c.type === "text");
    if (!block || block.type !== "text") throw new Error("No text response from model");
    raw = block.text;
  } catch (err) {
    return NextResponse.json(
      { error: "AI analysis failed", detail: (err as Error).message },
      { status: 502 },
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(stripCodeFences(raw));
  } catch {
    return NextResponse.json(
      { error: "Model returned non-JSON output", raw },
      { status: 502 },
    );
  }

  const result = AnalysisResultSchema.safeParse(json);
  if (!result.success) {
    return NextResponse.json(
      { error: "Model output failed validation", issues: result.error.issues, raw: json },
      { status: 502 },
    );
  }

  const finalised: AnalysisResult = result.data;
  return NextResponse.json(finalised);
}

function stripCodeFences(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function safeParseJSON<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
