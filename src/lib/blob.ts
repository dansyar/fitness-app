import { put } from "@vercel/blob";

export async function uploadMealPhoto(file: File, userId: string): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set.");
  }
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `meals/${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const blob = await put(key, file, {
    access: "public",
    contentType: file.type || "image/jpeg",
  });
  return blob.url;
}
