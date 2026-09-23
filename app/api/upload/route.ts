import { put } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/jpg"];

async function putToBlob(file: File) {
  const original = file.name || "image.jpg";
  const dot = original.lastIndexOf(".");
  const ext = (dot >= 0 ? original.slice(dot) : ".jpg").toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const safeExt = allowed.includes(ext) ? ext : ".jpg";
  const pathname = `vlaw-images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
  const body = Buffer.from(await file.arrayBuffer());
  return put(pathname, body, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || "image/jpeg",
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, storage: "vercel-blob", fs: false },
    { headers: { "x-vlaw-storage": "vercel-blob", "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "이미지 파일이 없습니다." }, { status: 400 });
      }
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
      }
      const blob = await putToBlob(file);
      return NextResponse.json(
        { url: blob.url, storage: "vercel-blob" },
        { headers: { "x-vlaw-storage": "vercel-blob", "Cache-Control": "no-store" } },
      );
    }

    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: IMAGE_TYPES,
        addRandomSuffix: true,
        maximumSizeInBytes: 10 * 1024 * 1024,
        tokenPayload: JSON.stringify({}),
      }),
    });
    return NextResponse.json(jsonResponse, {
      headers: { "x-vlaw-storage": "vercel-blob", "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
