import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { GuidePost } from "@/lib/guides";

const FILE = path.join(process.cwd(), "data", "vlaw-posts.json");

export type PostsStore = Record<string, GuidePost[]>;

export async function readPostsStore(): Promise<PostsStore> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as PostsStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function writePostsStore(store: PostsStore) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}
