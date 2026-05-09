import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function getDatabaseUrlProtocol() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  return databaseUrl.split(":", 1)[0] || null;
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    const prismaError = error as Error & { code?: string; meta?: unknown };
    return {
      name: prismaError.name,
      code: prismaError.code,
      message: prismaError.message,
      meta: prismaError.meta,
    };
  }

  return { message: String(error) };
}

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const exerciseCount = await prisma.exercise.count();

    return NextResponse.json({
      ok: true,
      databaseUrlProtocol: getDatabaseUrlProtocol(),
      exerciseCount,
    });
  } catch (error) {
    console.error("Database health check failed", error);

    return NextResponse.json(
      {
        ok: false,
        databaseUrlProtocol: getDatabaseUrlProtocol(),
        error: serializeError(error),
      },
      { status: 500 },
    );
  }
}
