import { put } from "@vercel/blob";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "이미지 파일이 없습니다." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
    }
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    const safeExt = allowed.includes(ext) ? ext : ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
    const blob = await put(name, file, {
      access: "public",
      contentType: file.type || "image/jpeg",
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
