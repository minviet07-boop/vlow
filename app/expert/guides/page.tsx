"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GUIDE_CATEGORIES,
  readPosts,
  savePosts,
  type GuidePost,
  type AdminGuideStep,
} from "@/lib/guides";

const categories = [
  GUIDE_CATEGORIES.find((c) => c.id === "closure")!,
  GUIDE_CATEGORIES.find((c) => c.id === "business")!,
  GUIDE_CATEGORIES.find((c) => c.id === "labor")!,
  GUIDE_CATEGORIES.find((c) => c.id === "issue")!,
  GUIDE_CATEGORIES.find((c) => c.id === "sos")!,
];

type StepItem = AdminGuideStep;

function insertImageMarkdown(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  value: string,
  setValue: (next: string) => void,
) {
  const url = window.prompt("이미지 URL을 입력하세요");
  if (!url?.trim()) return;
  const snippet = `![이미지](${url.trim()})`;
  const start = el?.selectionStart ?? value.length;
  const end = el?.selectionEnd ?? value.length;
  const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
  setValue(next);
  requestAnimationFrame(() => {
    if (!el) return;
    const pos = start + snippet.length;
    el.focus();
    el.setSelectionRange(pos, pos);
  });
}

export default function ExpertGuidesAdmin() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [selectedSubItem, setSelectedSubItem] = useState(categories[0].subItems[0]);
  const [guideTitle, setGuideTitle] = useState("");
  const [guideDesc, setGuideDesc] = useState("");
  const [period, setPeriod] = useState("약 2 ~ 3주 소요");
  const [authority, setAuthority] = useState("관할 관공서");
  const [steps, setSteps] = useState<StepItem[]>([{ stepNum: "Step 1", title: "", desc: "" }]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState("");
  const [ready, setReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const stepDescRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem("vlaw_admin_ok") === "1");
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const posts = await readPosts(selectedSubItem);
      if (cancelled) return;
      const existing = posts[0];
      if (existing) {
        setSavedId(existing.id);
        setSavedAt(existing.createdAt);
        setGuideTitle(existing.title);
        setGuideDesc(existing.desc);
        setPeriod(existing.period);
        setAuthority(existing.authority);
        setSteps(
          existing.steps && existing.steps.length > 0
            ? existing.steps.map((step) => ({ ...step }))
            : [{ stepNum: "Step 1", title: "", desc: "" }],
        );
      } else {
        setSavedId(null);
        setSavedAt("");
        setGuideTitle("");
        setGuideDesc("");
        setPeriod("약 2 ~ 3주 소요");
        setAuthority("관할 관공서");
        setSteps([{ stepNum: "Step 1", title: "", desc: "" }]);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSubItem]);

  const addStep = () => {
    setSteps([...steps, { stepNum: `Step ${steps.length + 1}`, title: "", desc: "" }]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    const reindexed = newSteps.map((s, idx) => ({ ...s, stepNum: `Step ${idx + 1}` }));
    setSteps(reindexed);
  };

  const handleStepChange = (index: number, field: "title" | "desc", value: string) => {
    setSteps(steps.map((step, i) => (i === index ? { ...step, [field]: value } : step)));
  };

  const handleSave = () => {
    if (!guideTitle.trim()) {
      alert("가이드 제목을 입력해주세요.");
      return;
    }
    const post: GuidePost = {
      id: savedId || Date.now().toString(),
      createdAt: savedAt || new Date().toLocaleDateString("ko-KR"),
      title: guideTitle,
      desc: guideDesc,
      period,
      authority,
      steps,
    };
    setSavedId(post.id);
    setSavedAt(post.createdAt);
    savePosts(selectedSubItem, [post]);
    alert(`[${selectedSubItem}] 가이드가 저장되었습니다.`);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const found = categories.find((c) => c.id === catId);
    if (found && found.subItems.length > 0) {
      setSelectedSubItem(found.subItems[0]);
    }
  };

  const currentCatObj = categories.find((c) => c.id === selectedCategory);

  const handleAdminUnlock = () => {
    if (password === "6789") {
      sessionStorage.setItem("vlaw_admin_ok", "1");
      setUnlocked(true);
      return;
    }
    alert("비밀번호가 올바르지 않습니다.");
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 text-slate-800">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-sm font-black text-slate-900">관리자 인증</h1>
          <p className="text-xs text-slate-500">비밀번호를 입력한 뒤 관리자 CMS에 진입하세요.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdminUnlock();
            }}
            placeholder="비밀번호"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdminUnlock}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
          >
            입장하기
          </button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-100 pb-24 text-slate-800">
      <header className="fixed top-0 left-1/2 z-50 flex w-full max-w-2xl -translate-x-1/2 items-center justify-between bg-slate-900 px-4 py-3 text-white shadow-md">
        <Link href="/" className="text-sm font-bold text-blue-400">
          ← VLaw 홈으로 돌아가기
        </Link>
        <span className="rounded-md bg-blue-900 px-2.5 py-1 text-xs font-semibold text-blue-200">
          가이드 콘텐츠 관리
        </span>
      </header>

      <main className="w-full max-w-2xl space-y-6 p-4 pt-20">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase">
            1. 대분류 카테고리 선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`rounded-xl border p-3 text-left text-xs font-bold transition ${
                  selectedCategory === cat.id
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {currentCatObj ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase">
              2. 세부 항목 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {currentCatObj.subItems.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubItem(sub)}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                    selectedSubItem === sub
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  📄 {sub}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
              현재 편집 항목
            </span>
            <h2 className="mt-1 text-base font-black text-slate-900">[{selectedSubItem}] 가이드 내용 편집</h2>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">가이드 제목</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertImageMarkdown(titleRef.current, guideTitle, setGuideTitle)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  📷 이미지 URL 추가
                </button>
              </div>
            </div>
            <input
              ref={titleRef}
              type="text"
              placeholder="예: 최신 행정 절차 안내"
              value={guideTitle}
              onChange={(e) => setGuideTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">상단 안내 문구 (요약 설명)</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertImageMarkdown(descRef.current, guideDesc, setGuideDesc)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  📷 이미지 URL 추가
                </button>
              </div>
            </div>
            <textarea
              ref={descRef}
              rows={2}
              placeholder="전체 요약 설명 입력"
              value={guideDesc}
              onChange={(e) => setGuideDesc(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">예상 소요 기간</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">관할 행정기관</label>
              <input
                type="text"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                📌 단계별 절차 블록 관리
              </label>
              <button
                type="button"
                onClick={addStep}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
              >
                + 스텝 추가하기
              </button>
            </div>
            {steps.map((step, idx) => (
              <div key={idx} className="relative space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-900">
                    {step.stepNum}
                  </span>
                  {steps.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="rounded px-2 py-1 text-xs font-bold text-red-500 hover:text-red-700"
                    >
                      삭제 ✕
                    </button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="단계 제목"
                    value={step.title}
                    onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-bold focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        insertImageMarkdown(stepDescRefs.current[idx], step.desc, (next) =>
                          handleStepChange(idx, "desc", next),
                        )
                      }
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      📷 이미지 URL 추가
                    </button>
                  </div>
                  <textarea
                    ref={(node) => {
                      stepDescRefs.current[idx] = node;
                    }}
                    rows={2}
                    placeholder="단계별 상세 설명 문구 입력"
                    value={step.desc}
                    onChange={(e) => handleStepChange(idx, "desc", e.target.value)}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              저장하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
