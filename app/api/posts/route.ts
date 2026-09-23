import { NextResponse } from "next/server";
import { readPostsStore, writePostsStore } from "@/lib/posts-store";
import { subItemsForSlug, type GuidePost } from "@/lib/guides";

function decodeSlug(value: string) {
  let current = value;
  for (let i = 0; i < 2; i++) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return current;
}

function postsForSlug(store: Record<string, GuidePost[]>, rawSlug: string): GuidePost[] {
  const decoded = decodeSlug(rawSlug);
  const keys = new Set<string>([decoded, decoded.replace(/-/g, " ")]);
  for (const name of subItemsForSlug(decoded)) keys.add(name);
  for (const name of keys) {
    const posts = store[name];
    if (Array.isArray(posts) && posts.length) return posts;
  }
  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subItem = searchParams.get("subItem");
  const slug = searchParams.get("slug");
  const store = await readPostsStore();
  if (subItem) {
    const posts = store[subItem];
    return NextResponse.json({ posts: Array.isArray(posts) ? posts : [] });
  }
  if (slug) {
    return NextResponse.json({ posts: postsForSlug(store, slug) });
  }
  return NextResponse.json({ store });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { subItem?: string; posts?: GuidePost[] };
    const subItem = String(body.subItem || "").trim();
    if (!subItem || !Array.isArray(body.posts)) {
      return NextResponse.json({ error: "subItem과 posts가 필요합니다." }, { status: 400 });
    }
    const store = await readPostsStore();
    store[subItem] = body.posts;
    await writePostsStore(store);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
