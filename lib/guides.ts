export type GuideStep = {
  step: string;
  title: string;
  desc: string;
};

export type ServiceGuideData = {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  period: string;
  authority: string;
  accent: "blue" | "purple" | "indigo" | "amber" | "emerald" | "red";
  homeHref: string;
  steps: GuideStep[];
};

const LOCAL_KEY = "vlaw_service_guides";
export const KAKAO_CHANNEL_URL =
  process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "https://pf.kakao.com/_xxxxxx";

export const DEFAULT_GUIDES: ServiceGuideData[] = [
  {
    slug: "irc-erc",
    category: "1. 비즈니스 컨설팅 및 인허가",
    title: "IRC & ERC 설립 및 발급 절차",
    subtitle: "전문가(변호사)가 관리자 모드에서 실시간으로 업데이트하는 공식 가이드입니다.",
    period: "약 3 ~ 4주 소요",
    authority: "기획투자국 (DPI)",
    accent: "blue",
    homeHref: "/",
    steps: [
      {
        step: "Step 1",
        title: "사전 준비 및 서류 공증",
        desc: "투자자 여권 공증 및 영사확인, 법인 설립 주소지 임대차 계약서 검토",
      },
      {
        step: "Step 2",
        title: "IRC (투자등록증) 접수 및 심사",
        desc: "기획투자국(DPI) 제출 후 업종별 적합성 심사 진행 (약 15~20일)",
      },
      {
        step: "Step 3",
        title: "ERC (사업자등록증) 및 세무 등록",
        desc: "사업자 등록 및 세무 코드 활성화, 전자세금계산서 세팅 완료",
      },
    ],
  },
  {
    slug: "closure",
    category: "3. 폐업처리 절차",
    title: "방치·미결제 법인 폐업 소급 해결",
    subtitle: "전문가(변호사)가 관리자 모드에서 실시간으로 업데이트하는 공식 가이드입니다.",
    period: "사안별 2 ~ 8주",
    authority: "세무서 · DPI",
    accent: "purple",
    homeHref: "/",
    steps: [
      {
        step: "Step 1",
        title: "미납 세무 신고 소급 정리",
        desc: "월별/분기별 미납 세무 신고를 소급 정리합니다.",
      },
      {
        step: "Step 2",
        title: "관세청 및 노동청 제재 확인",
        desc: "미결제 행정 제재와 체납을 확인하고 해소 순서를 잡습니다.",
      },
      {
        step: "Step 3",
        title: "라이선스 반납 및 폐업 승인",
        desc: "라이선스를 공식 반납하고 세무서 폐업 승인 공문을 확보합니다.",
      },
    ],
  },
];

function normalize(guide: ServiceGuideData & Record<string, unknown>): ServiceGuideData {
  const seed = DEFAULT_GUIDES.find((g) => g.slug === guide.slug);
  const steps = (guide.steps ?? []).map((raw, i) => {
    const item = raw as GuideStep & { body?: string };
    return {
      step: item.step || `Step ${i + 1}`,
      title: item.title?.replace(/^Step \d+\.\s*/, "") || item.title,
      desc: item.desc || item.body || "",
    };
  });
  return {
    slug: guide.slug,
    category: (guide.category as string) || (guide.badge as string) || seed?.category || "",
    title: guide.title,
    subtitle: guide.subtitle || seed?.subtitle || "",
    period: (guide.period as string) || (guide.duration as string) || seed?.period || "",
    authority: guide.authority,
    accent: guide.accent || seed?.accent || "blue",
    homeHref: guide.homeHref || "/",
    steps,
  };
}

function readLocal(): ServiceGuideData[] {
  if (typeof window === "undefined") return DEFAULT_GUIDES;
  try {
    const raw = null;
    if (!raw) return DEFAULT_GUIDES;
    const parsed = JSON.parse(raw) as ServiceGuideData[];
    const bySlug = new Map(parsed.map((g) => [g.slug, normalize(g)]));
    const seeds = DEFAULT_GUIDES.map((seed) => bySlug.get(seed.slug) ?? seed);
    const extras = parsed
      .filter((g) => !DEFAULT_GUIDES.some((seed) => seed.slug === g.slug))
      .map((g) => normalize(g));
    return [...seeds, ...extras];
  } catch {
    return DEFAULT_GUIDES;
  }
}

export function listGuides(): ServiceGuideData[] {
  return readLocal();
}

export async function getGuide(slug: string): Promise<ServiceGuideData | undefined> {
  if (typeof window !== "undefined") {
    const fromItem = await readItemGuideBySlug(slug);
    if (fromItem) return fromItem;
    return undefined;
  }
  return DEFAULT_GUIDES.find((g) => g.slug === slug);
}

export async function saveGuide(next: ServiceGuideData) {
  const matchedSubItem = displayNameForSlug(next.slug) || next.title;
  const payload: AdminGuidePayload = {
    title: next.title,
    subItem: matchedSubItem,
    desc: next.subtitle,
    period: next.period,
    authority: next.authority,
    steps: (next.steps || []).map((s, i) => ({
      stepNum: s.step || `Step ${i + 1}`,
      title: s.title,
      desc: s.desc,
    })),
  };
  await saveItemGuide(payload);
}

export const GUIDE_CATEGORIES = [
  {
    id: "closure",
    name: "1. 폐업처리 절차",
    accent: "purple" as const,
    subItems: ["업종별 폐업", "오래 폐업처리 안된 기업", "폐업처리안되는 기업"],
  },
  {
    id: "business",
    name: "2. 비즈니스 컨설팅 및 인허가",
    accent: "blue" as const,
    subItems: ["IRC & ERC", "업종별 라이선스", "지사 설립"],
  },
  {
    id: "labor",
    name: "3. 법률 및 노무·세무 자문",
    accent: "indigo" as const,
    subItems: ["노무 및 근로계약", "비자 및 노동허가서", "세무 및 회계 감사"],
  },
  {
    id: "issue",
    name: "4. 실시간 문제 해결 데스크",
    accent: "amber" as const,
    subItems: ["관공서 실사 마찰 대응", "1:1 긴급 진단"],
  },
  {
    id: "sos",
    name: "5. 긴급 SOS",
    accent: "red" as const,
    subItems: ["긴급 SOS 신청하기"],
  },
];

const SUB_SLUGS: Record<string, string> = {
  "IRC & ERC": "irc-erc",
  "업종별 라이선스": "industry-licenses",
  "Industry licenses": "industry-licenses",
  "지사 설립": "branch-setup",
  "Branch setup": "branch-setup",
  "노무 및 근로계약": "labor-contracts",
  "Labor & contracts": "labor-contracts",
  "비자 및 노동허가서": "visa-work-permit",
  "Visa & work permit": "visa-work-permit",
  "세무 및 회계 감사": "tax-audit",
  "Tax & audit": "tax-audit",
  "업종별 폐업": "closure-industry",
  "오래 폐업처리 안된 기업": "closure",
  "폐업처리안되는 기업": "closure-blocked",
  "관공서 실사 마찰 대응": "inspection-friction",
  "Inspection friction": "inspection-friction",
  "1:1 긴급 진단": "diagnosis",
  "1:1 Diagnosis": "diagnosis",
  "실시간 진행 트래킹": "live-tracking",
  "Live tracking": "live-tracking",
  "안심 문서 보관함": "secure-vault",
  "Secure vault": "secure-vault",
  "긴급 SOS 신청하기": "emergency-sos",
  "Submit Emergency SOS": "emergency-sos",
};

export type AdminGuideStep = {
  stepNum: string;
  title: string;
  desc: string;
};

export type GuidePost = {
  id: string;
  createdAt: string;
  title: string;
  desc: string;
  period: string;
  authority: string;
  steps: AdminGuideStep[];
};

export type AdminGuidePayload = {
  title: string;
  category?: string;
  subItem: string;
  desc: string;
  period: string;
  authority: string;
  steps: AdminGuideStep[];
};

export async function savePosts(subItem: string, posts: GuidePost[]) {
  await fetch("/api/posts", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subItem, posts }),
    cache: "no-store",
  });
}

export function subItemsForSlug(slug: string) {
  const preferred = GUIDE_CATEGORIES.flatMap((c) => c.subItems).filter((name) => slugForSubItem(name) === slug);
  const aliases = Object.entries(SUB_SLUGS)
    .filter(([, value]) => value === slug)
    .map(([name]) => name);
  return [...new Set([...preferred, ...aliases])];
}

export async function readPostsBySlug(slug: string): Promise<GuidePost[]> {
  return loadPostsForSlug(slug);
}

export function displayNameForSlug(rawSlug: string) {
  const decoded = safeDecode(rawSlug);
  const byExact = GUIDE_CATEGORIES.flatMap((c) => c.subItems).find((name) => name === decoded);
  if (byExact) return byExact;
  return subItemsForSlug(decoded)[0] || subItemsForSlug(rawSlug)[0] || decoded.replace(/-/g, " ");
}

function safeDecode(value: string) {
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

export async function loadPostsForSlug(rawSlug: string): Promise<GuidePost[]> {
  if (!rawSlug) return [];
  try {
    const res = await fetch(`/api/posts?slug=${encodeURIComponent(rawSlug)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { posts?: GuidePost[] };
    return Array.isArray(data.posts) ? data.posts : [];
  } catch {
    return [];
  }
}

export function itemStorageKey(subItem: string) {
  return `vlaw_guide_${subItem}`;
}

export function categoryForSubItem(subItem: string) {
  return GUIDE_CATEGORIES.find((c) => c.subItems.includes(subItem));
}

export function postsStorageKey(subItem: string) {
  return `vlaw_posts_${subItem}`;
}

export async function readPosts(subItem: string): Promise<GuidePost[]> {
  try {
    const res = await fetch(`/api/posts?subItem=${encodeURIComponent(subItem)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { posts?: GuidePost[] };
    return Array.isArray(data.posts) ? data.posts : [];
  } catch {
    return [];
  }
}

export async function readItemGuideAsync(subItem: string): Promise<AdminGuidePayload | null> {
  try {
    const posts = await readPosts(subItem);
    if (!posts || posts.length === 0) return null;
    const first = posts[0];
    return {
      title: first.title,
      subItem,
      desc: first.desc,
      period: first.period,
      authority: first.authority,
      steps: first.steps,
    };
  } catch {
    return null;
  }
}

async function readItemGuideBySlug(slug: string): Promise<ServiceGuideData | undefined> {
  const names = Object.entries(SUB_SLUGS)
    .filter(([, value]) => value === slug)
    .map(([name]) => name);
  for (const name of names) {
    const item = await readItemGuideAsync(name);
    if (item) return adminPayloadToGuide(item, name);
  }
  return undefined;
}

export function adminPayloadToGuide(item: AdminGuidePayload, subItem: string): ServiceGuideData {
  const cat = categoryForSubItem(subItem);
  const slug = slugForSubItem(subItem);
  return {
    slug,
    category: item.category || cat?.name || "",
    title: item.title,
    subtitle: item.desc,
    period: item.period,
    authority: item.authority,
    accent: cat?.accent || "blue",
    homeHref: "/",
    steps: (item.steps || []).map((step, i) => ({
      step: step.stepNum || `Step ${i + 1}`,
      title: step.title,
      desc: step.desc,
    })),
  };
}

export async function saveItemGuide(payload: AdminGuidePayload) {
  const post: GuidePost = {
    id: Date.now().toString(),
    createdAt: new Date().toLocaleDateString("ko-KR"),
    title: payload.title,
    desc: payload.desc,
    period: payload.period,
    authority: payload.authority,
    steps: payload.steps,
  };
  await savePosts(payload.subItem, [post]);
}

export function defaultItemGuide(subItem: string): AdminGuidePayload {
  return {
    title: `${subItem} 가이드 및 절차`,
    category: categoryForSubItem(subItem)?.name,
    subItem,
    desc: "베트남 현지 행정 기준에 맞춘 전문 가이드 및 실무 절차 안내입니다.",
    period: "약 2 ~ 3주 소요",
    authority: "관할 관공서",
    steps: [{ stepNum: "Step 1", title: "초기 요건 검토", desc: "필수 서류 및 법적 요건 확인 단계" }],
  };
}

export function deleteItemGuide(subItem: string) {
  const slug = slugForSubItem(subItem);
  for (const [name, value] of Object.entries(SUB_SLUGS)) {
    if (name === subItem || value === slug) {
      window.localStorage.removeItem(itemStorageKey(name));
    }
  }
  window.localStorage.removeItem(itemStorageKey(subItem));
  try {
    const raw = null;
    if (!raw) return;
    const parsed = JSON.parse(raw) as ServiceGuideData[];
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed.filter((g) => g.slug !== slug)));
  } catch {
    /* ignore */
  }
}

export function slugForSubItem(subItem: string) {
  return SUB_SLUGS[subItem] || subItem.toLowerCase().replace(/[^a-z0-9가-힣]+/gi, "-");
}

export function emptyGuide(
  slug: string,
  subItem: string,
  categoryName: string,
  accent: ServiceGuideData["accent"],
): ServiceGuideData {
  return {
    slug,
    category: categoryName,
    title: subItem,
    subtitle: "전문가(변호사)가 관리자 모드에서 실시간으로 업데이트하는 공식 가이드입니다.",
    period: "",
    authority: "",
    accent,
    homeHref: "/",
    steps: [{ step: "Step 1", title: "", desc: "" }],
  };
}

export async function getOrCreateGuide(
  subItem: string,
  categoryName: string,
  accent: ServiceGuideData["accent"],
): Promise<ServiceGuideData> {
  const slug = slugForSubItem(subItem);
  const existing = await getGuide(slug);
  return existing ?? emptyGuide(slug, subItem, categoryName, accent);
}

export async function resolveGuide(slug: string): Promise<ServiceGuideData | undefined> {
  const existing = await getGuide(slug);
  if (existing) return existing;
  const found = GUIDE_CATEGORIES.flatMap((c) => c.subItems).find((name) => slugForSubItem(name) === slug);
  const fallback = found || Object.entries(SUB_SLUGS).find(([, value]) => value === slug)?.[0];
  if (!fallback) return undefined;
  return adminPayloadToGuide(defaultItemGuide(fallback), fallback);
}
