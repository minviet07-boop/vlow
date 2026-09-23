import { supabase } from "./supabaseClient";
import type { Expert } from "./types";

const LOCAL_KEY = "vlaw_experts";

const SEED: Expert[] = [
  {
    id: "local-expert-1",
    name: "박민준",
    specialty: "공안 트러블슈팅",
    phone: "010-2000-1001",
    is_available: true,
  },
  {
    id: "local-expert-2",
    name: "Nguyen Thi Lan",
    specialty: "노동법/비자",
    phone: "010-2000-1002",
    is_available: true,
  },
  {
    id: "local-expert-3",
    name: "이서연",
    specialty: "법인설립/세무",
    phone: "010-2000-1003",
    is_available: true,
  },
];

function readLocal(): Expert[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw) as Expert[];
  } catch {
    /* ignore */
  }
  return SEED;
}

export async function listExperts(): Promise<Expert[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .order("name");
    if (!error && data) return data as Expert[];
  }
  return readLocal();
}
