import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadMealPhoto } from "@/lib/blob";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }

  try {
    const url = await uploadMealPhoto(file, session.user.id);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      { error: "Upload failed", detail: (err as Error).message },
      { status: 500 },
    );
  }
}
